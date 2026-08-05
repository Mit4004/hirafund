import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showLowBalanceModal, setShowLowBalanceModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, txRes] = await Promise.all([
          api.get('/auth/profile'),
          api.get('/transactions/my')
        ]);
        setProfile(profileRes.data);
        setTransactions(txRes.data);
        if (profileRes.data.balance < 100) {
          setShowLowBalanceModal(true);
        }
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };
    fetchData();
  }, []);

  if (!profile) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 text-white min-h-screen bg-gray-900">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Hello {profile.name}</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-xl shadow-lg border border-blue-500">
          <h3 className="text-blue-100 text-sm font-medium">Current Wallet</h3>
          <p className="text-4xl font-bold mt-2">₹{profile.balance}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm">Total Deposited</h3>
          <p className="text-2xl font-bold text-green-400 mt-2">₹{profile.totalDeposited}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm">Total Spent</h3>
          <p className="text-2xl font-bold text-red-400 mt-2">₹{profile.totalSpent}</p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Latest Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Type</th>
                <th className="py-2 px-4">Reason</th>
                <th className="py-2 px-4">Amount</th>
                <th className="py-2 px-4">Balance After</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx._id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                  <td className="py-3 px-4">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className={`py-3 px-4 font-semibold ${tx.type === 'Deposit' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type}
                  </td>
                  <td className="py-3 px-4">{tx.reason}</td>
                  <td className="py-3 px-4 font-medium">₹{tx.amount}</td>
                  <td className="py-3 px-4">₹{tx.balanceAfter}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Balance Modal */}
      {showLowBalanceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 sm:p-8 max-w-sm w-full border border-gray-700 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-red-400 mb-2">Low Balance Alert</h2>
            <p className="text-gray-300 mb-6">
              Your current balance is <span className="font-bold text-white">₹{profile.balance}</span>. You need to recharge to avoid going into debt.
            </p>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowLowBalanceModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
