import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaTachometerAlt, 
  FaUser, 
  FaSignOutAlt,
  FaChartLine,
  FaCertificate,
  FaBell
} from 'react-icons/fa';
import YugaYatraLogo from '../common/YugaYatraLogo';

const StudentNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/student/dashboard',
      icon: FaTachometerAlt,
      description: 'Overview and test access'
    },
    {
      name: 'Profile',
      path: '/student/profile',
      icon: FaUser,
      description: 'Manage your profile'
    },
    {
      name: 'Progress',
      path: '/student/progress',
      icon: FaChartLine,
      description: 'Track your performance and achievements'
    },
    {
      name: 'Performance',
      path: '/student/performance',
      icon: FaChartLine,
      description: 'View detailed analytics'
    },
    {
      name: 'Certificates',
      path: '/student/certificates',
      icon: FaCertificate,
      description: 'Download certificates'
    },
    {
      name: 'Notifications',
      path: '/student/notifications',
      icon: FaBell,
      description: 'View notifications'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b-2 border-gold-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <YugaYatraLogo className="w-16 h-16" showText={false} />
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
              <p className="text-sm text-gold-600 font-medium">Welcome, {user?.name || 'Student'}!</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <div className="hidden md:flex space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-gold-100 text-gold-800'
                        : 'text-gray-600 hover:text-gold-600 hover:bg-gold-50'
                    }`}
                    title={item.description}
                  >
                    <Icon className="mr-2" />
                    {item.name}
                  </button>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-gold-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center text-gray-700 hover:text-gold-600 transition-colors font-medium"
            >
              <FaSignOutAlt className="mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 pt-4 pb-2">
          <div className="grid grid-cols-2 gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-gold-100 text-gold-800'
                      : 'text-gray-600 hover:text-gold-600 hover:bg-gold-50'
                  }`}
                >
                  <Icon className="mr-2" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StudentNavigation; 