// src/components/admin/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Utensils, Package, BarChart3 } from 'lucide-react';

/**
 * Admin Dashboard Component
 */
const AdminDashboard = () => {
  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Create and manage system users',
      icon: Users,
      link: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: 'Manage Meals',
      description: 'Add and update menu items',
      icon: Utensils,
      link: '/admin/meals',
      color: 'bg-green-500'
    },
    {
      title: 'View Orders',
      description: 'Monitor all customer orders',
      icon: Package,
      link: '/sales/orders',
      color: 'bg-purple-500'
    },
    {
      title: 'View Reports',
      description: 'Analyze sales and performance',
      icon: BarChart3,
      link: '/manager/reports',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Manage your restaurant operations and system settings
      </p>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <Link
              key={index}
              to={action.link}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className={`${action.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity Overview</h3>
            <p className="text-gray-600">
              Recent system activity will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;