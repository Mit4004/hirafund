import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Receipt, Wallet, UserPlus, List } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = user?.role === 'admin' ? [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Add Expense', path: '/admin/expense', icon: Receipt },
    { name: 'Add Money', path: '/admin/add-money', icon: Wallet },
    { name: 'Add Friend', path: '/admin/add-friend', icon: UserPlus },
    { name: 'Transactions', path: '/admin/transactions', icon: List },
  ] : [];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col font-sans">
      <nav className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
            HiraFund
          </Link>
          {user?.role === 'admin' && (
            <div className="hidden md:flex gap-2 lg:gap-4 ml-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right text-sm text-gray-400">
            <span className="block font-medium text-gray-200">{user?.name}</span>
            <span className="text-xs uppercase bg-gray-700 px-2 py-0.5 rounded text-gray-300 inline-block mt-0.5 font-semibold">
              {user?.role}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="px-3.5 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-3 md:hidden">
          <div className="text-right text-xs text-gray-400">
            <span className="block font-medium text-gray-200 truncate max-w-[100px]">{user?.name}</span>
            <span className="text-[10px] uppercase bg-gray-700 px-1.5 py-0.5 rounded text-gray-300 inline-block font-semibold">
              {user?.role}
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-gray-700/60 hover:bg-gray-700 rounded-lg text-gray-200 focus:outline-none transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-b border-gray-700 px-4 py-4 space-y-2 sticky top-[57px] z-40 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
          
          <div className="pt-3 mt-2 border-t border-gray-700 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Logged in as <span className="text-white font-medium">{user?.email}</span>
            </div>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
      
      <main className="flex-1 bg-gray-900">
        {children}
      </main>
    </div>
  );
};

export default Layout;
