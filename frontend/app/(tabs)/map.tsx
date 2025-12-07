import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';

const { width, height } = Dimensions.get('window');

interface Report {
  _id: string;
  type: string;
  description: string;
  severity: number;
  status: string;
  location: {
    coordinates: [number, number]; // [lng, lat]
  };
  createdAt: string;
}

// Sample transport routes (would come from API in production)
const SAMPLE_ROUTES = {
  publicTransport: [
    { latitude: 6.5244, longitude: 3.3792 },
    { latitude: 6.5280, longitude: 3.3850 },
    { latitude: 6.5320, longitude: 3.3900 },
    { latitude: 6.5350, longitude: 3.3920 },
    { latitude: 6.5400, longitude: 3.3880 },
  ],
  okadaRoute: [
    { latitude: 6.5150, longitude: 3.3700 },
    { latitude: 6.5200, longitude: 3.3750 },
    { latitude: 6.5230, longitude: 3.3780 },
  ],
};

// Custom map style for a cleaner look
const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d4edda' }] },
];

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c3e50' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
];

const getMarkerColor = (type: string) => {
  switch (type) {
    case 'pothole': return '#EF4444';
    case 'flood': return '#3B82F6';
    case 'police': return '#6B7280';
    case 'accident': return '#F59E0B';
    case 'roadblock': return '#8B5CF6';
    case 'construction': return '#F97316';
    default: return '#EF4444';
  }
};

const getMarkerIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'pothole': return 'warning';
    case 'flood': return 'water';
    case 'police': return 'shield';
    case 'accident': return 'car';
    case 'roadblock': return 'stop-circle';
    case 'construction': return 'construct';
    default: return 'alert-circle';
  }
};

type FilterType = 'all' | 'hazards' | 'police' | 'transport';

export default function MapScreen() {
  const { colors, isDark } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showRoutes, setShowRoutes] = useState(true);

  // Default to Lagos, Nigeria
  const [region, setRegion] = useState({
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    getLocation();
    fetchReports();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(newLocation);
      setRegion({
        ...newLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await api.getReports({});
      setReports(response.data?.reports || []);
    } catch (error) {
      // Handle error silently
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'hazards') return ['pothole', 'flood', 'accident', 'roadblock', 'construction'].includes(report.type);
    if (filter === 'police') return report.type === 'police';
    return true;
  });

  const FilterButton = ({ type, label, icon }: { type: FilterType; label: string; icon: keyof typeof Ionicons.glyphMap }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { 
          backgroundColor: filter === type ? colors.primary : colors.card,
          borderColor: filter === type ? colors.primary : colors.border,
        },
      ]}
      onPress={() => setFilter(type)}
    >
      <Ionicons name={icon} size={16} color={filter === type ? '#FFFFFF' : colors.text} />
      <Text style={[styles.filterText, { color: filter === type ? '#FFFFFF' : colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={isDark ? DARK_MAP_STYLE : MAP_STYLE}
      >
        {/* Hazard Markers */}
        {filteredReports.map((report) => (
          <Marker
            key={report._id}
            coordinate={{
              latitude: report.location.coordinates[1],
              longitude: report.location.coordinates[0],
            }}
            pinColor={getMarkerColor(report.type)}
          >
            <View style={[styles.customMarker, { backgroundColor: getMarkerColor(report.type) }]}>
              <Ionicons name={getMarkerIcon(report.type)} size={16} color="#FFFFFF" />
            </View>
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>
                  {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                </Text>
                <Text style={styles.calloutDescription}>{report.description}</Text>
                <Text style={styles.calloutStatus}>Status: {report.status}</Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* Public Transport Route */}
        {showRoutes && filter !== 'police' && (
          <Polyline
            coordinates={SAMPLE_ROUTES.publicTransport}
            strokeColor="#3B82F6"
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}

        {/* Okada Route */}
        {showRoutes && filter !== 'police' && (
          <Polyline
            coordinates={SAMPLE_ROUTES.okadaRoute}
            strokeColor="#F97316"
            strokeWidth={3}
            lineDashPattern={[10, 5]}
          />
        )}
      </MapView>

      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={[styles.headerContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>GoSafe Africa</Text>
          <TouchableOpacity 
            style={[styles.offlineButton, { backgroundColor: colors.surface }]}
            onPress={() => Alert.alert('Offline Tiles', 'Offline map tiles feature coming soon! This will allow you to download maps for use without internet.')}
          >
            <Ionicons name="cloud-download-outline" size={18} color={colors.primary} />
            <Text style={[styles.offlineText, { color: colors.primary }]}>Offline</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <FilterButton type="all" label="All" icon="layers" />
        <FilterButton type="hazards" label="Hazards" icon="warning" />
        <FilterButton type="police" label="Police" icon="shield" />
        <FilterButton type="transport" label="Routes" icon="bus" />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={() => setShowRoutes(!showRoutes)}
        >
          <Ionicons 
            name={showRoutes ? 'git-branch' : 'git-branch-outline'} 
            size={22} 
            color={showRoutes ? colors.primary : colors.textMuted} 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={centerOnUser}
        >
          <Ionicons name="locate" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.card }]}
          onPress={fetchReports}
        >
          <Ionicons name="refresh" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: colors.card }]}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Okada route</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Public Transport</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#6B7280' }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Checkpoint</Text>
          </View>
        </View>
      </View>

      {/* Report Count Badge */}
      {filteredReports.length > 0 && (
        <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.countText}>{filteredReports.length} reports nearby</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  offlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterContainer: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    position: 'absolute',
    right: 16,
    bottom: 140,
    gap: 8,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legend: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
  },
  customMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  callout: {
    padding: 8,
    minWidth: 150,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  calloutStatus: {
    fontSize: 10,
    color: '#888',
  },
  countBadge: {
    position: 'absolute',
    top: 170,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
