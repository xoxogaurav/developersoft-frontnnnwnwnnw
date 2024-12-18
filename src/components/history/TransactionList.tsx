import React from 'react';
import TransactionItem from './TransactionItem';
import type { Transaction } from '../../types/transactions';

interface TransactionListProps {
  transactions: Transaction[];
  onDisputeClick: (transaction: Transaction) => void;
}

export default function TransactionList({ transactions, onDisputeClick }: TransactionListProps) {
  if (!transactions.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        No transactions found
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onDisputeClick={onDisputeClick}
        />
      ))}
    </div>
  );
}