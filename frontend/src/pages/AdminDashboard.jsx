import React, { useState, useEffect } from 'react';
import { Users, Utensils, BarChart3, Coins, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import UserManagement from '../components/admin/UserManagement';
import MealManagement from '../components/admin/MealManagement';
import api from '../services/api';
import { Logger } from '../utils/helpers';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMeals: 0,
    totalOrders: 0,
    revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      Logger.info('Loading admin dashboard statistics...');

      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      const [usersResponse, mealsResponse, ordersResponse, reportResponse] = await Promise.all([
        api.get('/users'),
        api.get('/meals'),
        api.get('/orders'),
        api.get(`/reports?month=${month}&year=${year}`),
      ]);

      setStats({
        totalUsers: usersResponse.data?.data?.length || 0,
        totalMeals: mealsResponse.data?.data?.length || 0,
        totalOrders: ordersResponse.data?.data?.length || 0,
        revenue: Number(reportResponse.data?.data?.total_revenue || 0),
      });
    } catch (error) {
      Logger.error('Error loading admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'meals', name: 'Meal Management', icon: Utensils },
  ];

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      iconClass: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Total Meals',
      value: stats.totalMeals,
      icon: Utensils,
      iconClass: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: BarChart3,
      iconClass: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Revenue (This Month)',
      value: `MK ${stats.revenue.toFixed(2)}`,
      icon: Coins,
      iconClass: 'bg-violet-100 text-violet-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}. Manage your restaurant operations.</p>
        </div>

        <button
          onClick={loadDashboardStats}
          disabled={isLoading}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{isLoading ? '...' : card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.iconClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
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

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Admin Overview</h3>
              <p className="text-gray-600">Metrics above are loaded from current API data.</p>
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
