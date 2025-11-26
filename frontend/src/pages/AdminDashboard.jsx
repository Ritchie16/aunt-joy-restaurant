// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Users, Utensils, BarChart3, Plus, Mail } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import UserManagement from '../components/admin/UserManagement';
import MealManagement from '../components/admin/MealManagement';
import  api  from '../services/api';
import { Logger } from '../utils/helpers';

/**
 * Admin Dashboard with User and Meal Management
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMeals: 0,
    totalOrders: 0,
    revenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  /**
   * Load dashboard statistics
   */
  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      Logger.info('Loading admin dashboard statistics...');

      // Simulate API calls for stats
      const usersResponse = await api.get('/users');
      const mealsResponse = await api.get('/meals');
      
      // In a real app, these would be actual stats endpoints
      setStats({
        totalUsers: usersResponse.data.data?.length || 0,
        totalMeals: mealsResponse.data.data?.length || 0,
        totalOrders: 0, // Would come from orders API
        revenue: 0 // Would come from reports API
      });

    } catch (error) {
      Logger.error('Error loading admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'meals', name: 'Meal Management', icon: Utensils }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user?.name}. Manage your restaurant operations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Meals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMeals}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Utensils className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">MK {stats.revenue.toFixed(2)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Overview</h3>
              <p className="text-gray-600">
                Welcome to your admin dashboard. Use the tabs above to manage users and meals.
              </p>
            </div>
          )}

          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'meals' && <MealManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;