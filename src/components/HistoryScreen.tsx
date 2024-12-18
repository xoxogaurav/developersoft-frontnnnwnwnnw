import React, { useState, useEffect } from 'react';
import { TransactionService } from '../services';
import toast from 'react-hot-toast';
import HistoryFilters from './history/HistoryFilters';
import TransactionList from './history/TransactionList';
import DisputeModal from './DisputeModal';
import type { Transaction } from '../types/transactions';

type FilterStatus = 'all' | 'completed' | 'pending' | 'failed';

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');
  const [disputeTransaction, setDisputeTransaction] = useState<Transaction | null>(null);

  const fetchData = async () => {
    try {
      const transactionsData = await TransactionService.getTransactions();
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    if (currentFilter === 'all') return true;
    return transaction.status === currentFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Task History</h1>
          <p className="mt-1 text-gray-500">
            View your completed, pending, and rejected tasks
          </p>
        </div>

        <HistoryFilters
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
        />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <TransactionList
            transactions={filteredTransactions}
            onDisputeClick={setDisputeTransaction}
          />
        </div>

        {disputeTransaction && (
          <DisputeModal
            submissionId={disputeTransaction.id}
            onClose={() => setDisputeTransaction(null)}
            onSuccess={() => {
              setDisputeTransaction(null);
              fetchData();
            }}
          />
        )}
      </div>
    </div>
  );
}