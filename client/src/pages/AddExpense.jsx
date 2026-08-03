import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddExpense = () => {
  const [friends, setFriends] = useState([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [description, setDescription] = useState('');
  const [totalBill, setTotalBill] = useState('');
  const [memberInputs, setMemberInputs] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const { data } = await api.get('/users');
        setFriends(data);
      } catch (err) {
        console.error('Error fetching friends', err);
      }
    };
    fetchFriends();
  }, []);

  const handleAmountChange = (userId, amount) => {
    setMemberInputs({
      ...memberInputs,
      [userId]: amount
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const members = Object.keys(memberInputs)
      .filter(key => memberInputs[key] && Number(memberInputs[key]) > 0)
      .map(key => ({
        userId: key,
        amount: Number(memberInputs[key])
      }));

    if (members.length === 0) {
      setError('Please enter amount for at least one member.');
      return;
    }

    const totalConsumed = members.reduce((acc, curr) => acc + curr.amount, 0);
    if (Math.abs(totalConsumed - Number(totalBill)) > 0.01) {
      setError(`The entered amounts (₹${totalConsumed}) do not match the total bill (₹${totalBill}).`);
      return;
    }

    setLoading(true);
    try {
      await api.post('/expenses', {
        restaurantName,
        description,
        totalBill: Number(totalBill),
        members
      });
      setSuccess('Expense Added Successfully');
      setTimeout(() => navigate('/admin'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 text-white min-h-screen bg-gray-900">
      <div className="max-w-3xl mx-auto bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-gray-700">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Create New Expense</h1>
        
        {error && <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded mb-6">{error}</div>}
        {success && <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded mb-6">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Restaurant Name</label>
              <input
                type="text"
                required
                className="w-full p-2.5 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-primary text-white"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Total Bill (₹)</label>
              <input
                type="number"
                required
                min="0.1"
                step="0.1"
                className="w-full p-2.5 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-primary text-white"
                value={totalBill}
                onChange={(e) => setTotalBill(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
              <input
                type="text"
                className="w-full p-2.5 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-primary text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Member Consumptions</h2>
            <div className="bg-gray-750 p-2 sm:p-4 rounded-lg border border-gray-600 overflow-x-auto">
              <table className="w-full text-left min-w-[320px]">
                <thead>
                  <tr className="border-b border-gray-600 text-gray-400">
                    <th className="pb-3">Friend</th>
                    <th className="pb-3">Available Balance</th>
                    <th className="pb-3">Consumed Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {friends.map(friend => (
                    <tr key={friend._id} className="border-b border-gray-700/50 last:border-0">
                      <td className="py-3 font-medium">{friend.name}</td>
                      <td className={`py-3 ${friend.balance < 500 ? 'text-red-400' : 'text-green-400'}`}>
                        ₹{friend.balance}
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          className="w-full max-w-[150px] p-2 bg-gray-800 rounded border border-gray-600 focus:outline-none focus:border-primary text-white"
                          value={memberInputs[friend._id] || ''}
                          onChange={(e) => handleAmountChange(friend._id, e.target.value)}
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
              <span className="font-semibold text-gray-300">Sum of Entered Amounts:</span>
              <span className={`font-bold text-lg ${Math.abs(Object.values(memberInputs).reduce((a, b) => a + Number(b || 0), 0) - Number(totalBill)) < 0.01 && Number(totalBill) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{Object.values(memberInputs).reduce((a, b) => a + Number(b || 0), 0)}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary hover:bg-blue-600 rounded-lg font-bold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {loading ? 'Applying...' : 'Apply Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
