// src/components/admin/UserModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Mail, User, Phone, MapPin, Key, Loader } from 'lucide-react';
import  api  from '../../services/api';
import { Logger } from '../../utils/helpers';
import Modal from '../common/Modal';

/**
 * User Modal Component for Creating/Editing Users
 */
const UserModal = ({ isOpen, onClose, onSave, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'customer',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');

  // Initialize form when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        // Edit mode - populate with user data
        setFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'customer',
          phone: user.phone || '',
          address: user.address || ''
        });
        setPassword(''); // Don't show password in edit mode
      } else {
        // Create mode - reset form
        setFormData({
          name: '',
          email: '',
          role: 'customer',
          phone: '',
          address: ''
        });
        setPassword(''); // Password will be generated
      }
      setErrors({});
    }
  }, [isOpen, user]);

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // For staff roles, require phone and address
    if (formData.role !== 'customer') {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required for staff';
      }

      if (!formData.address.trim()) {
        newErrors.address = 'Address is required for staff';
      }
    }

    return newErrors;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      Logger.warn('User form validation failed', formErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      Logger.info(`${user ? 'Updating' : 'Creating'} user: ${formData.email}`);

      if (user) {
        // Update existing user
        const response = await api.put(`/users/${user.id}`, formData);
        if (response.data.success) {
          Logger.info(`User updated successfully: ${formData.email}`);
          onSave();
        }
      } else {
        // Create new user
        const response = await api.post('/users', formData);
        if (response.data.success) {
          Logger.info(`User created successfully: ${formData.email}`);
          onSave();
        }
      }
    } catch (error) {
      const errorMsg = error.message || `Failed to ${user ? 'update' : 'create'} user`;
      setErrors({ submit: errorMsg });
      Logger.error('User form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Generate random password (for demo purposes)
   */
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(password);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Edit User' : 'Create New User'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            <User className="h-4 w-4 inline mr-1" />
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter full name"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="h-4 w-4 inline mr-1" />
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
            disabled={isSubmitting || user} // Can't change email when editing
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Role Field */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Role *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
              errors.role ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          >
            <option value="customer">Customer</option>
            <option value="sales">Sales Personnel</option>
            <option value="manager">Manager</option>
            <option value="admin">Administrator</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="h-4 w-4 inline mr-1" />
            Phone Number {formData.role !== 'customer' && '*'}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter phone number"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Address Field */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-1" />
            Address {formData.role !== 'customer' && '*'}
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            value={formData.address}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
              errors.address ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter address"
            disabled={isSubmitting}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        {/* Password Information for New Users */}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800 flex items-center">
                <Key className="h-4 w-4 mr-1" />
                Password Information
              </span>
              <button
                type="button"
                onClick={generatePassword}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Generate
              </button>
            </div>
            <p className="text-sm text-blue-700">
              A secure random password will be generated and sent to the user's email.
              {password && (
                <span className="font-mono block mt-1 bg-blue-100 p-2 rounded">
                  Generated: {password}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Staff Role Notice */}
        {formData.role !== 'customer' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> For {formData.role} roles, login credentials will be 
              automatically sent to the provided email address.
            </p>
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>{user ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <span>{user ? 'Update User' : 'Create User'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;