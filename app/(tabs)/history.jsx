import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter, useFocusEffect, Tabs } from 'expo-router';
import { ScrollText } from 'lucide-react-native';
import { transactionRepository } from '../../src/db/transactionRepository';
import TransactionCard from '../../src/components/TransactionCard';
import EmptyState from '../../src/components/EmptyState';
import HeaderActions from '../../src/components/HeaderActions';
import { THEME } from '../../src/constants/theme';
import { formatRupiah } from '../../src/components/ProductCard';

export default function HistoryScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Memuat riwayat transaksi dari SQLite
  const loadTransactions = useCallback(() => {
    try {
      const data = transactionRepository.getAllTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transaction history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  // Hitung total omzet keseluruhan
  const totalOmzet = useMemo(() => {
    return transactions.reduce((sum, item) => sum + (Number(item.total_tagihan) || 0), 0);
  }, [transactions]);

  const handleOpenDetail = (transaction) => {
    router.push({
      pathname: `/history/${transaction.id}`,
    });
  };

  return (
    <View style={styles.container}>
      <Tabs.Screen
        options={{
          headerRight: () => <HeaderActions />,
        }}
      />

      {/* Omzet Summary Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.omzetRow}>
          <View>
            <Text style={styles.omzetLabel}>Total Omset Penjualan</Text>
            <Text style={styles.omzetValue}>{formatRupiah(totalOmzet)}</Text>
          </View>
          <View style={styles.trxBadge}>
            <Text style={styles.trxBadgeText}>{transactions.length} Transaksi</Text>
          </View>
        </View>
      </View>

      {/* List Riwayat Transaksi */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Memuat riwayat transaksi...</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[THEME.colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <TransactionCard
              transaction={item}
              onPress={handleOpenDetail}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<ScrollText size={36} color={THEME.colors.primary} />}
              title="Belum Ada Transaksi"
              subtitle="Semua transaksi penjualan kasir yang telah diselesaikan akan tercatat rapi di sini."
              actionText="Mulai Penjualan Baru"
              onAction={() => router.push('/')}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  headerCard: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
    ...THEME.shadow.card,
  },
  omzetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  omzetLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  omzetValue: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.primary,
    marginTop: 2,
  },
  trxBadge: {
    backgroundColor: THEME.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  trxBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primaryDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: THEME.spacing.sm,
  },
  listContent: {
    padding: THEME.spacing.lg,
    paddingBottom: 40,
  },
});
