import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const getBalanceColor = (balance, minBalance, maxBalance) => {
  if (minBalance === maxBalance) return '#4ade80';
  
  let percentage = (balance - minBalance) / (maxBalance - minBalance);
  percentage = Math.max(0, Math.min(1, percentage));
  
  const r = Math.round(248 - (248 - 74) * percentage);
  const g = Math.round(113 + (222 - 113) * percentage);
  const b = Math.round(113 + (128 - 113) * percentage);
  
  return `rgb(${r}, ${g}, ${b})`;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/users/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="p-8 text-center text-white">Loading...</div>;

  const minBalance = stats.walletDistribution?.length > 0 
    ? Math.min(...stats.walletDistribution.map(m => m.balance)) 
    : 0;
  const maxBalance = stats.walletDistribution?.length > 0
    ? Math.max(...stats.walletDistribution.map(m => m.balance))
    : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 text-white min-h-screen bg-gray-900">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm">Total Friends</h3>
          <p className="text-3xl font-bold">{stats.totalFriends}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm">Total Money Available</h3>
          <p className="text-3xl font-bold text-green-500">₹{stats.totalMoneyAvailable}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm">Today's Expense</h3>
          <p className="text-3xl font-bold text-red-400">₹{stats.todayExpense}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm">This Month's Expense</h3>
          <p className="text-3xl font-bold text-orange-400">₹{stats.monthExpense}</p>
        </div>
      </div>

      {/* Member Balances */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Member Balances</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {stats.walletDistribution?.map((member, idx) => {
            const isNegative = member.balance < 0;
            const isLow = !isNegative && member.balance < 500;
            return (
              <div
                key={idx}
                className="bg-gray-800 rounded-xl p-4 border shadow-md flex flex-col gap-2"
                style={{ borderColor: getBalanceColor(member.balance, minBalance, maxBalance) }}
              >
                {/* Avatar initial */}
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    isNegative ? 'bg-red-900 text-red-300' : isLow ? 'bg-yellow-900 text-yellow-300' : 'bg-blue-900 text-blue-300'
                  }`}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-sm truncate">{member.name}</span>
                </div>

                {/* Balance */}
                <p 
                  className="text-2xl font-bold"
                  style={{ color: getBalanceColor(member.balance, minBalance, maxBalance) }}
                >
                  ₹{member.balance.toFixed(2)}
                </p>

                {/* Status badge */}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start ${
                  isNegative
                    ? 'bg-red-900/60 text-red-300'
                    : isLow
                    ? 'bg-yellow-900/60 text-yellow-300'
                    : 'bg-green-900/60 text-green-300'
                }`}>
                  {isNegative ? 'In Debt' : isLow ? 'Low' : 'Good'}
                </span>
              </div>
            );
          })}
          {(!stats.walletDistribution || stats.walletDistribution.length === 0) && (
            <p className="text-gray-500 col-span-full">No members found.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Monthly Expense Graph</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyGraph}>
                <XAxis dataKey="_id" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip wrapperStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Highest/Lowest Balance</h2>
          <div className="flex justify-between items-center bg-gray-700 p-4 rounded mb-4">
            <div>
              <p className="text-sm text-gray-400">Highest Balance Friend</p>
              <p className="font-bold text-lg">{stats.highestBalanceFriend?.name || 'N/A'}</p>
            </div>
            <p className="text-2xl font-bold text-green-400">₹{stats.highestBalanceFriend?.balance || 0}</p>
          </div>
          <div className="flex justify-between items-center bg-gray-700 p-4 rounded">
            <div>
              <p className="text-sm text-gray-400">Lowest Balance Friend</p>
              <p className="font-bold text-lg">{stats.lowestBalanceFriend?.name || 'N/A'}</p>
            </div>
            <p className="text-2xl font-bold text-red-400">₹{stats.lowestBalanceFriend?.balance || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="py-2 px-4">Friend</th>
                <th className="py-2 px-4">Type</th>
                <th className="py-2 px-4">Amount</th>
                <th className="py-2 px-4">Reason</th>
                <th className="py-2 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTransactions?.map(tx => (
                <tr key={tx._id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="py-2 px-4">{tx.userId?.name}</td>
                  <td className={`py-2 px-4 font-semibold ${tx.type === 'Deposit' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type}
                  </td>
                  <td className="py-2 px-4">₹{tx.amount}</td>
                  <td className="py-2 px-4">{tx.reason}</td>
                  <td className="py-2 px-4">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
