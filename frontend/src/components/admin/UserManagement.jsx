import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Users, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { Logger } from '../../utils/helpers';
import UserModal from './UserModal';

/**
 * User Management Component for Admin
 */
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');

  /**
   * Load users from API
   */
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      Logger.info('Loading users...');

      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data);
        Logger.info(`Loaded ${response.data.data.length} users`);
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to load users';
      setError(errorMsg);
      Logger.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /**
   * Filter users based on search and role
   */
  const filterUsers = useCallback(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  // Apply filters when dependencies change
  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  /**
   * Handle create new user
   */
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  /**
   * Handle edit user
   */
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  /**
   * Handle delete user
   */
  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        Logger.info(`Deleting user: ${user.email}`);
        
        const response = await api.delete(`/users/${user.id}`);
        if (response.data.success) {
          Logger.info(`User deleted successfully: ${user.email}`);
          loadUsers(); // Reload users
        }
      } catch (error) {
        Logger.error('Error deleting user:', error);
        alert('Failed to delete user: ' + error.message);
      }
    }
  };

  /**
   * Handle modal close
   */
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  /**
   * Handle user saved
   */
  const handleUserSaved = () => {
    loadUsers();
    handleModalClose();
  };

  /**
   * Get role badge color
   */
  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      sales: 'bg-green-100 text-green-800',
      customer: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Users</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadUsers}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        
        <button
          onClick={handleCreateUser}
          className="mt-4 md:mt-0 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="sales">Sales Personnel</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-1 transition-colors"
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900 p-1 transition-colors"
                          title="Delete user"
                          disabled={user.role === 'admin'} // Prevent deleting admin users
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || roleFilter !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'No users in the system yet'
              }
            </p>
            <button
              onClick={handleCreateUser}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add First User
            </button>
          </div>
        )}
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleUserSaved}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagement;