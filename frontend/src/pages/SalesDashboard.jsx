import React, { useState, useEffect } from 'react';
import { Package, Clock, Truck, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import  api  from '../services/api';
import { Logger } from '../utils/helpers';

/**
 * Sales Personnel Dashboard - Order Management
 */
const SalesDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadOrders(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter]);

  /**
   * Load orders from API
   */
  const loadOrders = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      Logger.info('Loading orders for sales dashboard...');

      const response = await api.get('/orders');
      if (response.data.success) {
        setOrders(response.data.data);
        Logger.info(`Loaded ${response.data.data.length} orders`);
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to load orders';
      setError(errorMsg);
      Logger.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  /**
   * Filter orders by status
   */
  const filterOrders = () => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  /**
   * Update order status
   */
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      Logger.info(`Updating order ${orderId} status to: ${newStatus}`);

      const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (response.data.success) {
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        
        Logger.info(`Order status updated successfully: ${orderId} -> ${newStatus}`);
      }
    } catch (error) {
      Logger.error('Error updating order status:', error);
      alert('Failed to update order status: ' + error.message);
    }
  };

  /**
   * Get status badge color and icon
   */
  const getStatusInfo = (status) => {
    const statusInfo = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      preparing: { color: 'bg-blue-100 text-blue-800', icon: Package, label: 'Preparing' },
      out_for_delivery: { color: 'bg-purple-100 text-purple-800', icon: Truck, label: 'Out for Delivery' },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Cancelled' }
    };

    return statusInfo[status] || statusInfo.pending;
  };

  /**
   * Get next available status
   */
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'preparing',
      preparing: 'out_for_delivery',
      out_for_delivery: 'delivered'
    };

    return statusFlow[currentStatus];
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Orders</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => loadOrders()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Management
          </h1>
          <p className="text-gray-600">
            Welcome, {user?.name}. Manage and track customer orders in real-time.
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          {/* Refresh Button */}
          <button
            onClick={() => loadOrders()}
            disabled={isRefreshing}
            className="bg-white border border-gray-300 text-gray-700 px-3.5 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center space-x-2 text-sm font-semibold"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {['pending', 'preparing', 'out_for_delivery', 'delivered'].map(status => {
          const statusInfo = getStatusInfo(status);
          const Icon = statusInfo.icon;
          const count = orders.filter(order => order.status === status).length;

          return (
            <div key={status} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{statusInfo.label}</p>
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${statusInfo.color.split(' ')[0]}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 px-5 py-3.5">
          <h2 className="text-lg font-semibold text-gray-900">
            Orders ({filteredOrders.length})
          </h2>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading orders...</p>
          </div>
        )}

        {/* Orders Content */}
        {!isLoading && filteredOrders.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map(order => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              const nextStatus = getNextStatus(order.status);

              return (
                <div key={order.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {statusInfo.label}
                        </span>
                        <span className="text-sm text-gray-500">#{order.order_number}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()} at{' '}
                          {new Date(order.created_at).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{order.customer_name}</p>
                          <p className="text-gray-600">{order.customer_phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Items: {Number(order.total_quantity || order.item_count || 0)}</p>
                          <p className="text-gray-600">Total: MK {parseFloat(order.total_amount).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 line-clamp-2">{order.delivery_address}</p>
                        </div>
                      </div>

                      {order.special_instructions && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Instructions:</span> {order.special_instructions}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      {nextStatus && (
                        <button
                          onClick={() => updateOrderStatus(order.id, nextStatus)}
                          className="bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
                        >
                          Mark as {getStatusInfo(nextStatus).label}
                        </button>
                      )}
                      
                      {order.status === 'delivered' && (
                        <span className="text-green-600 text-sm font-medium">Completed</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !isLoading && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {statusFilter !== 'all' 
                  ? `No orders with status "${statusFilter}"`
                  : 'No orders have been placed yet'
                }
              </p>
            </div>
          )
        )}
      </div>

      {/* Auto-refresh Indicator */}
      {isRefreshing && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">Refreshing orders...</span>
        </div>
      )}
    </div>
  );
};

export default SalesDashboard;
