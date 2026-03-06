import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { useCart } from '../../contexts/CartContext';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Utensils,
  Menu,
  X 
} from 'lucide-react';
import { Logger } from '../../utils/helpers';

/**
 * Main Header Component with Navigation
 */
const Header = () => {
  const { user, logout, isCustomer } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    Logger.info(`User logout: ${user?.email}`);
    logout();
    navigate('/login');
    setIsProfileMenuOpen(false);
  };

  /**
   * Toggle mobile menu
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    Logger.debug(`Mobile menu ${!isMobileMenuOpen ? 'opened' : 'closed'}`);
  };

  /**
   * Toggle profile menu
   */
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    Logger.debug(`Profile menu ${!isProfileMenuOpen ? 'opened' : 'closed'}`);
  };

  /**
   * Get dashboard route based on user role
   */
  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'admin': return '/admin';
      case 'manager': return '/manager';
      case 'sales': return '/sales';
      case 'customer': return '/customer';
      default: return '/';
    }
  };

  /**
   * Get user role display name
   */
  const getRoleDisplayName = () => {
    const roleMap = {
      admin: 'Administrator',
      manager: 'Manager',
      sales: 'Sales Personnel',
      customer: 'Customer'
    };
    return roleMap[user?.role] || 'User';
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link 
              to={getDashboardRoute()} 
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
            >
              <Utensils className="h-8 w-8" />
              <span className="text-xl font-bold">Aunt Joy's Restaurant</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user && (
              <>
                <Link
                  to={getDashboardRoute()}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  {isCustomer ? 'Home' : 'Dashboard'}
                </Link>
                
                {isCustomer && (
                  <Link
                    to="/customer/menu"
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Menu
                  </Link>
                )}

                {isCustomer && (
                  <Link
                    to="/customer/orders"
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    My Orders
                  </Link>
                )}

              </>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Shopping Cart (for customers) */}
            {isCustomer && (
              <button
                onClick={() => navigate('/customer/cart')}
                className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            )}

            {/* Profile Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="User menu"
                >
                  <User className="h-6 w-6 text-gray-600" />
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-primary-600 font-medium mt-1">
                        {getRoleDisplayName()}
                      </p>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              {user && (
                <>
                  <Link
                    to={getDashboardRoute()}
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {isCustomer ? 'Home' : 'Dashboard'}
                  </Link>
                  
                  {isCustomer && (
                    <Link
                      to="/customer/menu"
                      className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Menu
                    </Link>
                  )}
                  
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="text-left text-gray-700 hover:text-primary-600 font-medium transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Overlay for profile menu */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
