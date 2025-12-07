import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ReportCard } from '../../components/ReportCard';
import { api } from '../../services/api';

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

type FilterType = 'all' | 'verified' | 'pending';

export default function ReportsScreen() {
  const { colors } = useTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    try {
      const params = filter === 'all' ? {} : { status: filter };
      const response = await api.getReports(params);
      setReports(response.data.reports || []);
    } catch (error) {
      // Handle error silently
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

  const FilterButton = ({ title, value }: { title: string; value: FilterType }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: filter === value ? colors.primary : colors.surface,
        },
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterText,
          { color: filter === value ? '#FFFFFF' : colors.textSecondary },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <View style={styles.filterRow}>
        <FilterButton title="All" value="all" />
        <FilterButton title="Verified" value="verified" />
        <FilterButton title="Pending" value="pending" />
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ReportCard
            type={item.type}
            description={item.description}
            severity={item.severity}
            confirmations={item.confirmations}
            denials={item.denials}
            status={item.status}
            createdAt={item.createdAt}
            onConfirm={() => handleConfirm(item._id)}
            onDeny={() => handleDeny(item._id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Reports Found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {filter === 'all' ? 'No reports in your area yet' : `No ${filter} reports available`}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  emptyState: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 32,
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
});
