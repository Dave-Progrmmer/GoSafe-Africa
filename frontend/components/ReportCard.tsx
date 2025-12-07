import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ReportCardProps {
  type: string;
  description: string;
  severity: number;
  confirmations: number;
  denials: number;
  status: string;
  createdAt: string;
  onPress?: () => void;
  onConfirm?: () => void;
  onDeny?: () => void;
}

const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'pothole': return 'warning';
    case 'accident': return 'car';
    case 'roadblock': return 'stop-circle';
    case 'police': return 'shield';
    case 'flood': return 'water';
    case 'construction': return 'construct';
    default: return 'alert-circle';
  }
};

const getSeverityColor = (severity: number) => {
  switch (severity) {
    case 1: return '#10B981'; // Green - Low
    case 2: return '#F59E0B'; // Orange - Medium
    case 3: return '#EF4444'; // Red - High
    default: return '#6B7280';
  }
};

const getStatusBadge = (status: string, colors: any) => {
  switch (status) {
    case 'verified': return { bg: colors.success + '20', text: colors.success };
    case 'rejected': return { bg: colors.error + '20', text: colors.error };
    case 'pending': return { bg: colors.warning + '20', text: colors.warning };
    default: return { bg: colors.textMuted + '20', text: colors.textMuted };
  }
};

export const ReportCard = ({
  type,
  description,
  severity,
  confirmations,
  denials,
  status,
  createdAt,
  onPress,
  onConfirm,
  onDeny,
}: ReportCardProps) => {
  const { colors } = useTheme();
  const statusStyle = getStatusBadge(status, colors);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: getSeverityColor(severity) + '20' }]}>
          <Ionicons name={getTypeIcon(type)} size={24} color={getSeverityColor(severity)} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.type, { color: colors.text }]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>{timeAgo(createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
        {description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.votes}>
          <TouchableOpacity style={styles.voteButton} onPress={onConfirm}>
            <Ionicons name="thumbs-up-outline" size={18} color={colors.success} />
            <Text style={[styles.voteCount, { color: colors.success }]}>{confirmations}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.voteButton} onPress={onDeny}>
            <Ionicons name="thumbs-down-outline" size={18} color={colors.error} />
            <Text style={[styles.voteCount, { color: colors.error }]}>{denials}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.severity}>
          {[1, 2, 3].map((level) => (
            <View
              key={level}
              style={[
                styles.severityDot,
                { backgroundColor: level <= severity ? getSeverityColor(severity) : colors.border },
              ]}
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  type: {
    fontSize: 16,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  votes: {
    flexDirection: 'row',
    gap: 16,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  severity: {
    flexDirection: 'row',
    gap: 4,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
