import React, { useState, useEffect } from 'react';
import { Package, Clock, Truck, CheckCircle, AlertCircle, Search, Filter, Eye } from 'lucide-react';
import  api  from '../../services/api';
import { Logger } from '../../utils/helpers';
import { ORDER_STATUS, ORDER_STATUS_DISPLAY } from '../../utils/constants';
import Modal from '../common/Modal';

/**
 * Sales Order Management Component
 */
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
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
  }, [orders, searchTerm, statusFilter]);

  /**
   * Load orders from API
   */
  const loadOrders = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);

      Logger.info('Loading orders for sales management...');

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
    }
  };

  /**
   * Filter orders based on search and status
   */
  const filterOrders = () => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(term) ||
        order.customer_name.toLowerCase().includes(term) ||
        order.customer_phone.includes(term)
      );
    }

    // Filter by status
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
   * View order details
   */
  const viewOrderDetails = async (orderId) => {
    try {
      Logger.info(`Fetching details for order: ${orderId}`);

      const response = await api.get(`/orders/${orderId}`);
      if (response.data.success) {
        setSelectedOrder(response.data.data);
        setIsDetailModalOpen(true);
        Logger.info(`Order details loaded: ${orderId}`);
      }
    } catch (error) {
      Logger.error('Error loading order details:', error);
      alert('Failed to load order details: ' + error.message);
    }
  };

  /**
   * Get status badge color and icon
   */
  const getStatusInfo = (status) => {
    const statusInfo = {
      [ORDER_STATUS.PENDING]: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock, 
        label: ORDER_STATUS_DISPLAY[ORDER_STATUS.PENDING] 
      },
      [ORDER_STATUS.PREPARING]: { 
        color: 'bg-blue-100 text-blue-800', 
        icon: Package, 
        label: ORDER_STATUS_DISPLAY[ORDER_STATUS.PREPARING] 
      },
      [ORDER_STATUS.OUT_FOR_DELIVERY]: { 
        color: 'bg-purple-100 text-purple-800', 
        icon: Truck, 
        label: ORDER_STATUS_DISPLAY[ORDER_STATUS.OUT_FOR_DELIVERY] 
      },
      [ORDER_STATUS.DELIVERED]: { 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle, 
        label: ORDER_STATUS_DISPLAY[ORDER_STATUS.DELIVERED] 
      },
      [ORDER_STATUS.CANCELLED]: { 
        color: 'bg-red-100 text-red-800', 
        icon: AlertCircle, 
        label: ORDER_STATUS_DISPLAY[ORDER_STATUS.CANCELLED] 
      }
    };

    return statusInfo[status] || statusInfo[ORDER_STATUS.PENDING];
  };

  /**
   * Get next available status
   */
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      [ORDER_STATUS.PENDING]: ORDER_STATUS.PREPARING,
      [ORDER_STATUS.PREPARING]: ORDER_STATUS.OUT_FOR_DELIVERY,
      [ORDER_STATUS.OUT_FOR_DELIVERY]: ORDER_STATUS.DELIVERED
    };

    return statusFlow[currentStatus];
  };

  if (error) {
    return (
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
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Order Management</h2>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {/* Refresh Button */}
          <button
            onClick={() => loadOrders()}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
        </div>
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
                placeholder="Search by order number, customer name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                {Object.values(ORDER_STATUS).map(status => (
                  <option key={status} value={status}>
                    {ORDER_STATUS_DISPLAY[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map(order => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  const nextStatus = getNextStatus(order.status);

                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{order.order_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()} at{' '}
                            {new Date(order.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer_phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.item_count} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        MK {parseFloat(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {/* View Details */}
                          <button
                            onClick={() => viewOrderDetails(order.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Status Update Buttons */}
                          {nextStatus && (
                            <button
                              onClick={() => updateOrderStatus(order.id, nextStatus)}
                              className="bg-primary-600 text-white px-3 py-1 rounded text-xs hover:bg-primary-700 transition-colors"
                            >
                              Mark as {ORDER_STATUS_DISPLAY[nextStatus]}
                            </button>
                          )}
                          
                          {order.status === ORDER_STATUS.DELIVERED && (
                            <span className="text-green-600 text-xs font-medium px-2 py-1">
                              Completed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'No orders have been placed yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Order Details - #${selectedOrder?.order_number}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Information */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Customer Name</p>
                <p className="font-medium text-gray-900">{selectedOrder.customer_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Customer Email</p>
                <p className="font-medium text-gray-900">{selectedOrder.customer_email}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone Number</p>
                <p className="font-medium text-gray-900">{selectedOrder.customer_phone}</p>
              </div>
              <div>
                <p className="text-gray-600">Order Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <p className="text-gray-600 mb-2">Delivery Address</p>
              <p className="font-medium text-gray-900">{selectedOrder.delivery_address}</p>
            </div>

            {/* Special Instructions */}
            {selectedOrder.special_instructions && (
              <div>
                <p className="text-gray-600 mb-2">Special Instructions</p>
                <p className="font-medium text-gray-900">{selectedOrder.special_instructions}</p>
              </div>
            )}

            {/* Order Items */}
            <div>
              <p className="text-gray-600 mb-3">Order Items</p>
              <div className="space-y-3">
                {selectedOrder.items?.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {item.image_path ? (
                          <img
                            src={item.image_path}
                            alt={item.meal_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.meal_name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        MK {parseFloat(item.unit_price).toFixed(2)} each
                      </p>
                      <p className="text-sm text-gray-600">
                        Total: MK {parseFloat(item.total_price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount</span>
                <span className="text-primary-600">
                  MK {parseFloat(selectedOrder.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement;