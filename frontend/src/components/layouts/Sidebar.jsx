import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Utensils, 
  Package, 
  FileText,
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Sidebar navigation component
 */
const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: BarChart3,
        roles: ['admin', 'manager', 'sales', 'customer']
      }
    ];

    const roleSpecificItems = {
      admin: [
        {
          name: 'User Management',
          href: '/admin/users',
          icon: Users,
          roles: ['admin']
        },
        {
          name: 'Meal Management',
          href: '/admin/meals',
          icon: Utensils,
          roles: ['admin']
        }
      ],
      manager: [
        {
          name: 'Reports',
          href: '/manager/reports',
          icon: FileText,
          roles: ['manager', 'admin']
        }
      ],
      sales: [
        {
          name: 'Order Management',
          href: '/sales/orders',
          icon: Package,
          roles: ['sales', 'admin']
        }
      ],
      customer: [
        {
          name: 'Menu',
          href: '/customer/menu',
          icon: Utensils,
          roles: ['customer']
        },
        {
          name: 'My Orders',
          href: '/customer/orders',
          icon: Package,
          roles: ['customer']
        }
      ]
    };

    return [
      ...baseItems,
      ...(roleSpecificItems[user?.role] || [])
    ].filter(item => item.roles.includes(user?.role));
  };

  const navigationItems = getNavigationItems();

  const isActiveLink = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8 p-2">
        <div className="bg-primary-600 p-2 rounded-lg">
          <Utensils className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold">Aunt Joy's</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveLink(item.href);

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;