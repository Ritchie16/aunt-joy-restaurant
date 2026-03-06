import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/useAuth';
import  api  from '../../services/api';
import { Logger } from '../../utils/helpers';
import { CreditCard, MapPin, Phone, MessageSquare } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/media';

/**
 * Checkout Component for Customer Orders
 */
const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    deliveryAddress: user?.address || '',
    customerPhone: user?.phone || '',
    specialInstructions: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

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

    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Delivery address is required';
    } else if (formData.deliveryAddress.trim().length < 10) {
      newErrors.deliveryAddress = 'Please provide a complete address';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    } else if (formData.customerPhone.trim().length < 10) {
      newErrors.customerPhone = 'Please provide a valid phone number';
    }

    return newErrors;
  };

  /**
   * Handle order submission
   */
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      Logger.warn('Checkout validation failed', formErrors);
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsSubmitting(true);

    try {
      Logger.info('Submitting order...');

      // Prepare order data
      const orderData = {
        total_amount: getTotalPrice(),
        delivery_address: formData.deliveryAddress.trim(),
        customer_phone: formData.customerPhone.trim(),
        special_instructions: formData.specialInstructions.trim(),
        items: cartItems.map(item => ({
          meal_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        }))
      };

      const response = await api.post('/orders', orderData);
      
      if (response.data.success) {
        const { order_id, order_number } = response.data.data;
        
        Logger.info(`Order placed successfully: ${order_number}`);
        
        setOrderDetails({
          orderId: order_id,
          orderNumber: order_number
        });
        setOrderSuccess(true);
        
        // Clear cart
        clearCart();
        
        // Redirect to orders page after 3 seconds
        setTimeout(() => {
          navigate('/customer/orders');
        }, 3000);
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to place order';
      Logger.error('Order submission error:', error);
      alert('Failed to place order: ' + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Calculate item total
   */
  const calculateItemTotal = (item) => {
    return item.price * item.quantity;
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We're preparing your delicious meals.
          </p>
          
          {orderDetails && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <p className="text-gray-600">Order Number</p>
                  <p className="font-semibold text-gray-900">{orderDetails.orderNumber}</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-600">Order ID</p>
                  <p className="font-semibold text-gray-900">#{orderDetails.orderId}</p>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            Redirecting to your orders page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image_path ? (
                          <img
                            src={resolveMediaUrl(item.image_path)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <CreditCard className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">
                      MK {calculateItemTotal(item).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">MK {getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-gray-900">MK 0.00</span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span className="text-primary-600">MK {getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Checkout Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
          
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            {/* Delivery Address */}
            <div>
              <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Delivery Address *
              </label>
              <textarea
                id="deliveryAddress"
                name="deliveryAddress"
                rows={3}
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.deliveryAddress ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your complete delivery address in Mzuzu"
                disabled={isSubmitting}
              />
              {errors.deliveryAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.customerPhone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
                disabled={isSubmitting}
              />
              {errors.customerPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
              )}
            </div>

            {/* Special Instructions */}
            <div>
              <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="h-4 w-4 inline mr-1" />
                Special Instructions (Optional)
              </label>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                rows={2}
                value={formData.specialInstructions}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Any special delivery instructions or notes..."
                disabled={isSubmitting}
              />
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Customer Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <span>Place Order - MK {getTotalPrice().toFixed(2)}</span>
                </>
              )}
            </button>

            {/* Security Notice */}
            <p className="text-xs text-gray-500 text-center">
              Your order and personal information are secure. We do not share your data with third parties.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
