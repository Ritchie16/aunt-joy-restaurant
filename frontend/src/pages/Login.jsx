import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { Utensils, Eye, EyeOff, Loader } from 'lucide-react';
import { Logger } from '../utils/helpers';
import AppToast from '../components/common/AppToast';
import AuthBackLink from '../components/common/AuthBackLink';

/**
 * Unified Login Page for all user roles
 */
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  
  const { login, error, clearError, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || getDashboardRoute();
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when component unmounts or form changes
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  useEffect(() => {
    if (!error) return;
    setToast({ show: true, message: error, type: 'error' });
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
    return () => clearTimeout(timer);
  }, [error]);

  /**
   * Get dashboard route based on user role
   */
  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin';
      case 'manager':
        return '/manager';
      case 'sales':
        return '/sales';
      case 'customer':
      default:
        return '/customer';
    }
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    Logger.info(`Login form submitted for: ${formData.email}`);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        Logger.info('Login successful, redirecting to dashboard...');
        // Navigation will be handled by the useEffect above
      } else {
        Logger.warn(`Login failed: ${result.message}`);
      }
    } catch (error) {
      Logger.error('Login form error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-[#f1f4f6] flex flex-col justify-center py-8 sm:px-6 lg:px-8">
      <AuthBackLink />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Brand */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2.5 rounded-lg">
              <Utensils className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Aunt Joy's
            </span>
          </div>
        </div>
        
        <h2 className="mt-5 text-center text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your restaurant management portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-sm rounded-xl sm:px-8 border border-gray-200">
          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Demo Accounts Hint */}
            {/*
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Demo Accounts
              </h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Admin:</strong> admin@auntjoy.com / app@1234</p>
                <p className="text-xs text-blue-600 mt-1">
                  More accounts can be created by admin
                </p>
              </div>
            </div>

            */}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
              {/* Add this after the password field or before the submit button */}
<div className="flex items-center justify-end">
  <div className="text-sm">
    <Link
      to="/forgot-password"
      className="font-medium text-primary-600 hover:text-primary-500"
    >
      Forgot your password?
    </Link>
  </div>
</div>
            </div>
          </form>

          {/* Registration Link for Customers */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  New customer?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Create customer account
              </Link>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Having trouble signing in? Contact support at{' '}
            <a href="mailto:support@auntjoy.com" className="text-primary-600 hover:text-primary-500">
              support@auntjoy.com
            </a>
          </p>
        </div>
      </div>

      <AppToast
        open={toast.show}
        title="Login failed"
        message={toast.message}
        type={toast.type}
        duration={4200}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default Login;
