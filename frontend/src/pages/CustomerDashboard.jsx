import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Utensils, Clock, Star } from 'lucide-react';
import { Logger } from '../utils/helpers';

/**
 * Customer Dashboard - Main landing page for customers
 */
const CustomerDashboard = () => {
  const { user } = useAuth();
  const { getTotalItems, getTotalPrice, addToCart } = useCart();
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredMeals, setFeaturedMeals] = useState([]);

  useEffect(() => {
    Logger.info(`Customer dashboard loaded for: ${user?.email}`);
    // Simulate loading recent orders
    setTimeout(() => {
      setRecentOrders([]); // Would be populated from API

setFeaturedMeals([
  { id: 1, name: "Chips & Sausage", price: 4500,},
  { id: 2, name: "Beef Burger", price: 3500,},
  { id: 3, name: "Grilled Fish", price: 4000,},
  { id: 4, name: "Nsima with beef", price: 2500, },
  { id: 5, name: "Rice with chicken", price: 5000, }
]);

      setIsLoading(false);
    }, 1000);
  }, [user]);

  return (
    
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="featured-meals-container">
</div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Ready to explore our delicious menu and place your order?
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            {/* Cart Summary */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="text-sm text-primary-600 font-medium">Cart Items</p>
                  <p className="text-lg font-bold text-primary-700">{getTotalItems()}</p>
                </div>
              </div>
            </div>
            
            {/* Quick Action */}
            <Link
              to="/customer/menu"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Utensils className="h-5 w-5" />
              <span>Browse Menu</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Utensils className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Loyalty Points</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Meals */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Meals</h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {featuredMeals.map((meal) => (
      <div key={meal.id} className="border rounded-lg p-4">
        <h3 className="font-semibold text-gray-900">{meal.name}</h3>
        <p className="text-primary-600 font-bold mb-2">
          MK {meal.price}
        </p>

   <button
  onClick={() => addToCart(meal)}
  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
>
  Add to Cart
</button>
      </div>
    ))}
  </div>
</div>
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading orders...</p>
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {/* Order items would be mapped here */}
              </div>
            ) : (
              <div className="text-center py-8">
                <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
                <Link
                  to="/customer/menu"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors inline-block"
                >
                  Place Your First Order
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/customer/menu"
                className="w-full bg-primary-50 text-primary-700 p-3 rounded-lg font-medium hover:bg-primary-100 transition-colors flex items-center space-x-3"
              >
                <Utensils className="h-5 w-5" />
                <span>Browse Menu</span>
              </Link>
              
              <Link
                to="/customer/cart"
                className="w-full bg-gray-50 text-gray-700 p-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-3"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>View Cart ({getTotalItems()})</span>
              </Link>
            </div>
          </div>

          {/* Cart Summary */}
          {getTotalItems() > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cart Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{getTotalItems()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-lg text-primary-600">
                    MK {getTotalPrice().toFixed(2)}
                  </span>
                </div>
                <Link
                  to="/customer/checkout"
                  className="w-full bg-primary-600 text-white p-3 rounded-lg font-medium hover:bg-primary-700 transition-colors text-center block"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}

          {/* Support Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-blue-700 text-sm mb-4">
              Our support team is here to help with your orders.
            </p>
            <div className="space-y-2 text-sm text-blue-600">
              <p>📞 +265 123 456 789</p>
              <p>✉️ support@auntjoy.com</p>
              <p>🕒 7:00 AM - 10:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;