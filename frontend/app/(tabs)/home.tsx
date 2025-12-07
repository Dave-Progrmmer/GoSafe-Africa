import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ReportCard } from '../../components/ReportCard';
import { api } from '../../services/api';
import { router } from 'expo-router';

interface Report {
  _id: string;
  type: string;
  description: string;
  severity: number;
  confirmations: number;
  denials: number;
  status: string;
  createdAt: string;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Fetch all reports for stats
      const allResponse = await api.getReports({});
      const all = allResponse.data?.reports || [];
      setAllReports(all);
      
      // Filter verified for display
      const verified = all.filter((r: Report) => r.status === 'verified');
      setReports(verified);
    } catch (error) {
      setReports([]);
      setAllReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleConfirm = async (id: string) => {
    try {
      await api.confirmReport(id);
      fetchReports();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error confirming report');
    }
  };

  const handleDeny = async (id: string) => {
    try {
      await api.denyReport(id);
      fetchReports();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error denying report');
    }
  };

  // Calculate stats from real data
  const verifiedCount = allReports.filter(r => r.status === 'verified').length;
  const pendingCount = allReports.filter(r => r.status === 'pending').length;
  const highRiskCount = allReports.filter(r => r.severity === 3).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={[styles.welcomeCard, { backgroundColor: colors.primary }]}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>
              Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Stay safe on the roads today
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={() => router.push('/(tabs)/create')}
          >
            <Ionicons name="add" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats - Now using REAL data */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{verifiedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Verified</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="time" size={24} color="#F59E0B" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{pendingCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#EF444420' }]}>
              <Ionicons name="warning" size={24} color="#EF4444" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{highRiskCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>High Risk</Text>
          </View>
        </View>

        {/* Recent Reports */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Reports</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/reports')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {reports.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Reports Yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Be the first to report a hazard in your area
            </Text>
            <TouchableOpacity 
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/create')}
            >
              <Text style={styles.createButtonText}>Create Report</Text>
            </TouchableOpacity>
          </View>
        ) : (
          reports.slice(0, 5).map((report) => (
            <ReportCard
              key={report._id}
              type={report.type}
              description={report.description}
              severity={report.severity}
              confirmations={report.confirmations}
              denials={report.denials}
              status={report.status}
              createdAt={report.createdAt}
              onConfirm={() => handleConfirm(report._id)}
              onDeny={() => handleDeny(report._id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  reportButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  createButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
