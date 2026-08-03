import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useContext } from 'react';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import AddExpense from './pages/AddExpense';
import AddFriend from './pages/AddFriend';
import AddMoney from './pages/AddMoney';
import Transactions from './pages/Transactions';
import Layout from './layouts/Layout';

const RootRoute = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  return <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout><Outlet /></Layout>}>
              {/* User Routes */}
              <Route path="/dashboard" element={<UserDashboard />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route element={<Layout><Outlet /></Layout>}>
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/expense" element={<AddExpense />} />
              <Route path="/admin/add-friend" element={<AddFriend />} />
              <Route path="/admin/add-money" element={<AddMoney />} />
              <Route path="/admin/transactions" element={<Transactions />} />
            </Route>
          </Route>
          
          <Route path="/" element={<RootRoute />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
