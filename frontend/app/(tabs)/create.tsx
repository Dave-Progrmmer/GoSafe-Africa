import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { api } from '../../services/api';
import { router } from 'expo-router';
import * as Location from 'expo-location';

const REPORT_TYPES = [
  { id: 'pothole', label: 'Pothole', icon: 'warning' },
  { id: 'accident', label: 'Accident', icon: 'car' },
  { id: 'roadblock', label: 'Roadblock', icon: 'stop-circle' },
  { id: 'police', label: 'Police', icon: 'shield' },
  { id: 'flood', label: 'Flood', icon: 'water' },
  { id: 'construction', label: 'Construction', icon: 'construct' },
];

export default function CreateReportScreen() {
  const { colors } = useTheme();
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to create reports');
        setLocationLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get your location');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!type) {
      Alert.alert('Error', 'Please select a report type');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please add a description');
      return;
    }
    if (!location) {
      Alert.alert('Error', 'Location is required. Please enable GPS');
      return;
    }

    setLoading(true);
    try {
      await api.createReport({
        type,
        location: { coordinates: [location.lng, location.lat] },
        description: description.trim(),
        severity,
      });

      Alert.alert('Success', 'Report submitted successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Location Status */}
          <View style={[styles.locationCard, { backgroundColor: colors.card }]}>
            <Ionicons
              name={location ? 'location' : 'location-outline'}
              size={24}
              color={location ? colors.success : colors.warning}
            />
            <View style={styles.locationText}>
              <Text style={[styles.locationTitle, { color: colors.text }]}>
                {locationLoading ? 'Getting location...' : location ? 'Location detected' : 'Location unavailable'}
              </Text>
              {location && (
                <Text style={[styles.locationCoords, { color: colors.textMuted }]}>
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={getLocation}>
              <Ionicons name="refresh" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Report Type */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>What's the issue?</Text>
          <View style={styles.typeGrid}>
            {REPORT_TYPES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.typeCard,
                  {
                    backgroundColor: type === item.id ? colors.primary : colors.card,
                    borderColor: type === item.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setType(item.id)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={28}
                  color={type === item.id ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    { color: type === item.id ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Severity */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Severity Level</Text>
          <View style={styles.severityRow}>
            {[1, 2, 3].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.severityButton,
                  {
                    backgroundColor: severity === level
                      ? level === 1 ? '#10B981' : level === 2 ? '#F59E0B' : '#EF4444'
                      : colors.card,
                    borderColor: severity === level
                      ? level === 1 ? '#10B981' : level === 2 ? '#F59E0B' : '#EF4444'
                      : colors.border,
                  },
                ]}
                onPress={() => setSeverity(level)}
              >
                <Text
                  style={[
                    styles.severityText,
                    { color: severity === level ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {level === 1 ? 'Low' : level === 2 ? 'Medium' : 'High'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <TextInput
            placeholder="Describe the hazard in detail..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          {/* Submit Button */}
          <Button
            title="Submit Report"
            onPress={handleSubmit}
            loading={loading}
            disabled={!type || !description.trim() || !location}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  locationText: {
    flex: 1,
    marginLeft: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationCoords: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  typeCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  severityRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  severityText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
