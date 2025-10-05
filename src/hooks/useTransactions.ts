import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { BridgeTransaction, TransactionFilters, TransactionPair } from '../types/bridge';
import { bridgeApi } from '../api/bridge';

export const useTransactions = () => {
  const { address, isConnected } = useAppKitAccount();
  const [transactions, setTransactions] = useState<BridgeTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<BridgeTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to avoid dependency cycles
  const fetchTransactionsRef = useRef<(() => Promise<void>) | null>(null);
  const applyFiltersRef = useRef<(() => void) | null>(null);
  const refreshTransactionRef = useRef<((id: string) => Promise<void>) | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [filters, setFilters] = useState<TransactionFilters>({
    status: 'all',
  });

  // Convert TransactionPair to BridgeTransaction format
  const convertTransactionPairToBridgeTransaction = useCallback((pair: TransactionPair): BridgeTransaction => {
    // Use API data directly instead of SUPPORTED_CHAINS
    const fromChain = {
      id: pair.chain_id_from,
      name: pair.chain_alias_name_from,
      symbol: 'Unknown',
      logo: pair.chain_logo_url_from || '/chains/unknown.svg',
      rpcUrl: '',
      blockExplorerUrl: pair.block_explorer_from
    };

    const toChain = pair.chain_id_to ? {
      id: pair.chain_id_to,
      name: pair.chain_alias_name_to || 'Unknown',
      symbol: 'Unknown', 
      logo: pair.chain_logo_url_to || '/chains/unknown.svg',
      rpcUrl: '',
      blockExplorerUrl: pair.block_explorer_to || ''
    } : fromChain;

    // Use API data for token info
    const token = {
      symbol: pair.token_group,
      name: pair.token_group,
      decimals: pair.decimals_from,
      logo: '/tokens/unknown.svg', // API doesn't provide token logo in TransactionPair
      addresses: {
        [pair.chain_id_from]: '0x0000000000000000000000000000000000000000', // API doesn't provide token address in TransactionPair
      }
    };

    // Convert status number to string status
    let status: 'pending' | 'bridging' | 'completed' | 'failed';
    switch (pair.status) {
      case 1:
        status = 'completed';
        break;
      case 2:
        status = 'bridging';
        break;
      case 0:
        status = 'pending';
        break;
      case -1:
        status = 'failed';
        break;
      default:
        // null, undefined, or other unknown values are treated as pending
        status = 'pending';
    }

    return {
      id: `${pair.txl_related_id}`,
      fromChain,
      toChain,
      token,
      amount: pair.num_human_from.toString(),
      fromTxHash: pair.tx_hash_from,
      toTxHash: pair.tx_hash_to,
      status,
      timestamp: new Date(pair.tx_time).getTime(),
      estimatedTime: 15,
      fees: {
        gas: '0.01',
        bridge: '0.1', 
        total: '0.11',
      },
      fromAddress: pair.addr_from,
      toAddress: pair.addr_to || pair.addr_from,
      actualTime: status === 'completed' ? 10 : undefined,
    };
  }, []);

  // Fetch transactions from API
  const fetchTransactions = useCallback(async () => {
    if (!isConnected || !address) return;

    setLoading(true);
    setError(null);

    try {
      // Get transaction data from API only
      const transactionPairs = await bridgeApi.getTransactionPairs(address, 50, 0);
      
      // Convert API data to BridgeTransaction format
      const apiTransactions = transactionPairs && transactionPairs.length > 0
        ? transactionPairs.map(pair => convertTransactionPairToBridgeTransaction(pair))
        : [];

      // Sort by timestamp in descending order
      apiTransactions.sort((a, b) => b.timestamp - a.timestamp);

      setTransactions(apiTransactions);
      setPagination({
        page: 1,
        limit: 20,
        total: apiTransactions.length,
      });
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, convertTransactionPairToBridgeTransaction]);

  // Store function in ref
  fetchTransactionsRef.current = fetchTransactions;

  // Fetch transactions with status filter
  const fetchTransactionsWithFilter = useCallback(async (statusFilter?: number) => {
    if (!isConnected || !address) return;

    setLoading(true);
    setError(null);

    try {
      // Get transaction data from real API, support status filtering
      const transactionPairs = await bridgeApi.getTransactionPairs(address, 50, 0, statusFilter);
      
      if (transactionPairs && transactionPairs.length > 0) {
        // Convert API data to BridgeTransaction format
        const apiTransactions = transactionPairs.map(pair => 
          convertTransactionPairToBridgeTransaction(pair)
        );

        // Sort by timestamp in descending order
        apiTransactions.sort((a, b) => b.timestamp - a.timestamp);

        setTransactions(apiTransactions);
        setPagination({
          page: 1,
          limit: 20,
          total: apiTransactions.length,
        });
        return;
      }

      // If no API data, fallback to original logic
      await fetchTransactions();
    } catch (err) {
      console.error('Failed to fetch transactions with filter:', err);
      // Fallback to original logic on error
      await fetchTransactions();
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, fetchTransactions, convertTransactionPairToBridgeTransaction]);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...transactions];

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(tx => tx.status === filters.status);
    }

    // Chain filter
    if (filters.chain) {
      filtered = filtered.filter(tx => 
        tx.fromChain.id === filters.chain || tx.toChain.id === filters.chain
      );
    }

    // Token filter
    if (filters.token) {
      filtered = filtered.filter(tx => tx.token.symbol === filters.token);
    }

    // Date range filter
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.timestamp);
        return txDate >= start && txDate <= end;
      });
    }

    setFilteredTransactions(filtered);
  }, [transactions, filters]);

  // Store function in ref
  applyFiltersRef.current = applyFilters;

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // If status filter changes, re-fetch data from API
    if (newFilters.status !== undefined) {
      let statusFilter: number | undefined;
      switch (newFilters.status) {
        case 'pending':
          statusFilter = 0;
          break;
        case 'completed':
          statusFilter = 1;
          break;
        case 'bridging':
          statusFilter = 2;
          break;
        case 'all':
        default:
          statusFilter = undefined;
          break;
      }
      fetchTransactionsWithFilter(statusFilter);
    }
  }, [fetchTransactionsWithFilter]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({ status: 'all' });
    // Re-fetch all data when clearing filters
    fetchTransactionsWithFilter();
  }, [fetchTransactionsWithFilter]);

  // Refresh specific transaction
  const refreshTransaction = useCallback(async (transactionId: string) => {
    try {
      // For demo purposes, simulate status update
      setTransactions(prev => 
        prev.map(tx => {
          if (tx.id === transactionId && tx.status === 'pending') {
            return { ...tx, status: 'bridging' as const };
          }
          if (tx.id === transactionId && tx.status === 'bridging') {
            return { 
              ...tx, 
              status: 'completed' as const,
              toTxHash: '0x' + Math.random().toString(16).substr(2, 64),
              actualTime: tx.estimatedTime - Math.floor(Math.random() * 5),
            };
          }
          return tx;
        })
      );
    } catch (err) {
      console.error('Failed to refresh transaction:', err);
    }
  }, []);

  // Store function in ref
  refreshTransactionRef.current = refreshTransaction;

  // Auto-refresh pending transactions
  useEffect(() => {
    const pendingTransactions = transactions.filter(tx => 
      tx.status === 'pending' || tx.status === 'bridging'
    );

    if (pendingTransactions.length === 0) return;

    const interval = setInterval(() => {
      pendingTransactions.forEach(tx => {
        // Simulate random status updates
        if (Math.random() < 0.3 && refreshTransactionRef.current) {
          refreshTransactionRef.current(tx.id);
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [transactions]);

  // Apply filters when transactions or filters change
  useEffect(() => {
    if (applyFiltersRef.current) {
      applyFiltersRef.current();
    }
  }, [transactions, filters]);

  // Fetch transactions when wallet connects
  useEffect(() => {
    if (isConnected && address && fetchTransactionsRef.current) {
      fetchTransactionsRef.current();
    } else {
      setTransactions([]);
      setFilteredTransactions([]);
    }
  }, [isConnected, address]);

  // Get transaction statistics
  const getStatistics = useCallback(() => {
    const total = transactions.length;
    const completed = transactions.filter(tx => tx.status === 'completed').length;
    const pending = transactions.filter(tx => tx.status === 'pending' || tx.status === 'bridging').length;
    const failed = transactions.filter(tx => tx.status === 'failed').length;
    
    const totalVolume = transactions.reduce((sum, tx) => {
      if (tx.status === 'completed') {
        return sum + parseFloat(tx.amount);
      }
      return sum;
    }, 0);

    const avgTime = transactions
      .filter(tx => tx.status === 'completed' && tx.actualTime)
      .reduce((sum, tx) => sum + (tx.actualTime || 0), 0) / 
      Math.max(1, transactions.filter(tx => tx.status === 'completed' && tx.actualTime).length);

    return {
      total,
      completed,
      pending,
      failed,
      totalVolume: totalVolume.toFixed(2),
      successRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0',
      avgTime: avgTime.toFixed(1),
    };
  }, [transactions]);

  return {
    // Data
    transactions: filteredTransactions,
    allTransactions: transactions,
    loading,
    error,
    pagination,
    filters,
    statistics: getStatistics(),

    // Actions
    fetchTransactions,
    fetchTransactionsWithFilter,
    refreshTransaction,
    updateFilters,
    clearFilters,

    // Utils
    hasTransactions: transactions.length > 0,
    hasFilters: Object.keys(filters).some(key => 
      key !== 'status' || filters.status !== 'all'
    ),
  };
};
