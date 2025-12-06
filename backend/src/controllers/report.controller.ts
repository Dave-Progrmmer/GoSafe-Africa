import { Request, Response, NextFunction } from 'express';
import { Report, Confirmation, User } from '../models';
import { ValidationError, NotFoundError, ConflictError } from '../utils/AppError';
import { saveFileLocally } from '../services/storage.service';

export const createReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { type, location, description, severity, photos } = req.body;

    // Validation
    if (!type || !location || !description || !severity) {
      throw new ValidationError('Type, location, description, and severity are required');
    }

    if (!location.coordinates || location.coordinates.length !== 2) {
      throw new ValidationError('Location must have coordinates [longitude, latitude]');
    }

    if (![1, 2, 3].includes(severity)) {
      throw new ValidationError('Severity must be 1, 2, or 3');
    }

    // Handle photos (base64 or URLs)
    const photoUrls: string[] = [];
    if (photos && Array.isArray(photos)) {
      for (const photo of photos.slice(0, 3)) { // Max 3 photos
        if (photo.startsWith('data:image')) {
          // Save base64 image locally
          const matches = photo.match(/^data:image\/(\w+);base64,(.+)$/);
          if (matches) {
            const buffer = Buffer.from(matches[2], 'base64');
            const url = await saveFileLocally(buffer, `photo.${matches[1]}`);
            photoUrls.push(url);
          }
        } else {
          photoUrls.push(photo); // Already a URL
        }
      }
    }

    // Create report
    const report = await Report.create({
      userId,
      type,
      location: {
        type: 'Point',
        coordinates: location.coordinates
      },
      description,
      severity,
      photos: photoUrls
    });

    // Update user's credibility score for active participation
    await User.findByIdAndUpdate(userId, { $inc: { credibilityScore: 1 } });

    res.status(201).json({
      success: true,
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, radius = 5000, status, type, limit = 50, page = 1 } = req.query;

    const query: any = {};

    // Geospatial query
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng as string), parseFloat(lat as string)]
          },
          $maxDistance: parseInt(radius as string)
        }
      };
    }

    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const reports = await Report.find(query)
      .populate('userId', 'profile credibilityScore')
      .limit(parseInt(limit as string))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          page: parseInt(page as string),
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id).populate('userId', 'profile credibilityScore');
    
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    res.status(200).json({
      success: true,
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};

export const confirmReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    // Can't confirm own report
    if (report.userId.toString() === userId) {
      throw new ValidationError('Cannot confirm your own report');
    }

    // Check if already confirmed/denied
    const existing = await Confirmation.findOne({ reportId: id, userId });
    if (existing) {
      throw new ConflictError('You have already voted on this report');
    }

    // Create confirmation
    await Confirmation.create({ reportId: id, userId, action: 'confirm' });

    // Update report
    report.confirmations += 1;
    report.credibilityScore = calculateCredibilityScore(report.confirmations, report.denials);
    
    // Auto-verify if threshold met
    if (report.confirmations >= 3 && report.credibilityScore >= 70) {
      report.status = 'verified';
    }

    await report.save();

    // Reward user for participation
    await User.findByIdAndUpdate(userId, { $inc: { credibilityScore: 0.5 } });

    res.status(200).json({
      success: true,
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};

export const denyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    // Can't deny own report
    if (report.userId.toString() === userId) {
      throw new ValidationError('Cannot deny your own report');
    }

    // Check if already confirmed/denied
    const existing = await Confirmation.findOne({ reportId: id, userId });
    if (existing) {
      throw new ConflictError('You have already voted on this report');
    }

    // Create denial
    await Confirmation.create({ reportId: id, userId, action: 'deny' });

    // Update report
    report.denials += 1;
    report.credibilityScore = calculateCredibilityScore(report.confirmations, report.denials);
    
    // Auto-reject if too many denials
    if (report.denials >= 5 && report.credibilityScore < 30) {
      report.status = 'rejected';
    }

    await report.save();

    res.status(200).json({
      success: true,
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    // Only owner can delete
    if (report.userId.toString() !== userId && req.user!.role !== 'admin') {
      throw new ValidationError('You can only delete your own reports');
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function
const calculateCredibilityScore = (confirmations: number, denials: number): number => {
  const total = confirmations + denials;
  if (total === 0) return 0;
  
  const ratio = confirmations / total;
  return Math.round(ratio * 100);
};
