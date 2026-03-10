import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Key, ArrowLeft, Loader, CheckCircle, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { Logger } from '../utils/helpers';
import AuthBackLink from '../components/common/AuthBackLink';
import AppToast from '../components/common/AppToast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  useEffect(() => {
    // Verify token when component mounts
    const verifyToken = async () => {
      if (!token) {
        setToast({
          show: true,
          message: 'No reset token provided',
          type: 'error'
        });
        return;
      }

      try {
        Logger.info('Verifying reset token');
        const response = await api.get(`/forgot-password/verify?token=${token}`);
        
        if (response.data.success) {
          setIsVerified(true);
        } else {
          setToast({
            show: true,
            message: 'Invalid or expired reset token',
            type: 'error'
          });
        }
      } catch (error) {
        Logger.error('Token verification error:', error);
        setToast({
          show: true,
          message: error.response?.data?.message || 'Invalid or expired reset token',
          type: 'error'
        });
      }
    };

    verifyToken();
  }, [token]);

  const validatePassword = () => {
    if (password.length < 6) {
      setToast({ show: true, message: 'Password must be at least 6 characters', type: 'error' });
      return false;
    }
    
    if (!/[A-Z]/.test(password)) {
      setToast({ show: true, message: 'Password must contain at least one uppercase letter', type: 'error' });
      return false;
    }
    
    if (!/[a-z]/.test(password)) {
      setToast({ show: true, message: 'Password must contain at least one lowercase letter', type: 'error' });
      return false;
    }
    
    if (!/[0-9]/.test(password)) {
      setToast({ show: true, message: 'Password must contain at least one number', type: 'error' });
      return false;
    }
    
    if (password !== confirmPassword) {
      setToast({ show: true, message: 'Passwords do not match', type: 'error' });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);

    try {
      Logger.info('Resetting password');
      
      const response = await api.post('/forgot-password/reset', {
        token,
        password
      });
      
      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setToast({
          show: true,
          message: response.data.message || 'Failed to reset password',
          type: 'error'
        });
      }
    } catch (error) {
      Logger.error('Reset password error:', error);
      setToast({
        show: true,
        message: error.response?.data?.message || 'An error occurred. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f1f4f6] flex flex-col justify-center py-8 sm:px-6 lg:px-8">
        <AuthBackLink />
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-8 border border-gray-200 text-center">
            <Key className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">The password reset link is missing or invalid.</p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center text-primary-600 hover:text-primary-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Request new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-[#f1f4f6] flex flex-col justify-center py-8 sm:px-6 lg:px-8">
        <AuthBackLink />
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-8 border border-gray-200 text-center">
            <Loader className="h-16 w-16 text-primary-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Reset Link</h2>
            <p className="text-gray-600">Please wait while we verify your reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#f1f4f6] flex flex-col justify-center py-8 sm:px-6 lg:px-8">
        <AuthBackLink />
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-sm rounded-xl sm:px-8 border border-gray-200 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your password has been reset successfully. You will be redirected to the login page.
            </p>
            <div className="animate-pulse text-sm text-gray-500">
              Redirecting...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f4f6] flex flex-col justify-center py-8 sm:px-6 lg:px-8">
      <AuthBackLink />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-primary-600 p-2.5 rounded-lg">
            <Key className="h-7 w-7 text-white" />
          </div>
        </div>
        
        <h2 className="mt-5 text-center text-2xl font-bold text-gray-900">
          Create new password
        </h2>
        
        <p className="mt-2 text-center text-sm text-gray-600">
          Please enter your new password below.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-sm rounded-xl sm:px-8 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  placeholder="Enter new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Password Requirements:
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li className={password.length >= 6 ? 'text-green-600' : ''}>
                  ✓ At least 6 characters
                </li>
                <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                  ✓ At least one uppercase letter
                </li>
                <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                  ✓ At least one lowercase letter
                </li>
                <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                  ✓ At least one number
                </li>
              </ul>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>

      <AppToast
        open={toast.show}
        title="Error"
        message={toast.message}
        type={toast.type}
        duration={4200}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default ResetPassword;