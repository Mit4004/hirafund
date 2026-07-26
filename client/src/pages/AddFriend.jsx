import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddFriend = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await api.post('/users', formData);
      setSuccess('Friend Added Successfully');
      setTimeout(() => navigate('/admin'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 text-white min-h-screen bg-gray-900 flex justify-center items-center">
      <div className="w-full max-w-lg bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-700">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Add New Friend</h1>
        
        {error && <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded mb-6">{error}</div>}
        {success && <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded mb-6">{success}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full p-2.5 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-primary text-white"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full p-2.5 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-primary text-white"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Phone</label>
            <input
              type="text"
              name="phone"
              required
              className="w-full p-2.5 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-primary text-white"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Temporary Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full p-2.5 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-primary text-white"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-primary hover:bg-blue-600 rounded-lg font-bold text-white transition-colors"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFriend;
