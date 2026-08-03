import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text }

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/transactions');
      setTransactions(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load transactions.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    setConfirmId(null);
    try {
      const { data } = await api.delete(`/transactions/${id}`);
      setMessage({ type: 'success', text: data.message });
      setTransactions((prev) => prev.filter((tx) => tx._id !== id));
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete transaction.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 text-white min-h-screen bg-gray-900">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">All Transactions</h1>

      {/* Flash message */}
      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-900 border border-green-600 text-green-300'
              : 'bg-red-900 border border-red-600 text-red-300'
          }`}
        >
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="float-right text-lg leading-none opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-16">Loading transactions...</div>
      ) : (
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-sm">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Friend</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Balance Before</th>
                <th className="py-3 px-4">Balance After</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx._id}
                  className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gray-300 whitespace-nowrap">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-medium">{tx.userId?.name || '—'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        tx.type === 'Deposit'
                          ? 'bg-green-900 text-green-300'
                          : 'bg-red-900 text-red-300'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">₹{tx.amount}</td>
                  <td className="py-3 px-4 text-gray-300">{tx.reason}</td>
                  <td className="py-3 px-4 text-gray-400">₹{tx.balanceBefore}</td>
                  <td className="py-3 px-4 text-gray-400">₹{tx.balanceAfter}</td>
                  <td className="py-3 px-4 text-center">
                    {confirmId === tx._id ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          id={`confirm-delete-${tx._id}`}
                          onClick={() => handleDelete(tx._id)}
                          disabled={deletingId === tx._id}
                          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors disabled:opacity-50"
                        >
                          {deletingId === tx._id ? 'Deleting...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`delete-btn-${tx._id}`}
                        onClick={() => setConfirmId(tx._id)}
                        className="px-3 py-1 text-xs bg-red-900 hover:bg-red-700 text-red-300 hover:text-white rounded font-medium transition-colors border border-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;
