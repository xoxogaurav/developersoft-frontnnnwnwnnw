import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatDate } from './dateFormatter';
import { getTransactionStyles } from './transactionStyles';
import TransactionIcon from './TransactionIcon';
import type { Transaction } from '../../types/transactions';
import { formatCurrency } from '../../utils/currency';

interface TransactionItemProps {
  transaction: Transaction;
  onDisputeClick: (transaction: Transaction) => void;
}

export default function TransactionItem({ transaction, onDisputeClick }: TransactionItemProps) {
  const amount = typeof transaction.amount === 'string' 
    ? parseFloat(transaction.amount) 
    : transaction.amount;

  const styles = getTransactionStyles(transaction.type, transaction.status);

  return (
    <div className="p-6">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-4">
          <div className={`p-2 rounded-full ${styles.bg}`}>
            <TransactionIcon 
              type={transaction.type} 
              status={transaction.status} 
              className="h-5 w-5"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900">
                {transaction.task?.title || 'Withdrawal'}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </span>
              {transaction.status === 'failed' && 
               transaction.type === 'earning' &&
               transaction.canDispute && (
                <button
                  onClick={() => onDisputeClick(transaction)}
                  className="flex items-center px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Raise Dispute
                </button>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              {formatDate(transaction.created_at)}
            </div>
            {transaction.task && (
              <div className="mt-1 text-sm text-gray-600">
                Task ID: {transaction.task.id}
              </div>
            )}
          </div>
        </div>
        <div className={`font-medium ${styles.text}`}>
          {styles.prefix}
          {formatCurrency(amount.toFixed(2))}
        </div>
      </div>
    </div>
  );
}