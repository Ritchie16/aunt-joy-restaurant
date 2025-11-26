import React from 'react';
import { X, Plus, Minus, ShoppingCart, Utensils } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { Logger, formatCurrency } from '../../utils/helpers';

/**
 * Shopping Cart Sidebar Component
 */
const Cart = () => {
  const { 
    cartItems, 
    isCartOpen, 
    updateQuantity, 
    removeFromCart, 
    getTotalPrice, 
    closeCart,
    clearCart
  } = useCart();

  /**
   * Handle quantity change
   */
  const handleQuantityChange = (mealId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(mealId);
    } else {
      updateQuantity(mealId, newQuantity);
    }
  };

  /**
   * Handle item removal
   */
  const handleRemoveItem = (mealId, mealName) => {
    Logger.info(`Removing ${mealName} from cart`);
    removeFromCart(mealId);
  };

  /**
   * Handle clear cart
   */
  const handleClearCart = () => {
    Logger.info('Clearing entire cart');
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Cart Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
            {cartItems.length > 0 && (
              <span className="bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600">Add some delicious meals to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4">
                    {/* Item Image */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.image_path ? (
                        <img
                          src={item.image_path}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Utensils className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-primary-600 font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item.id, item.name)}
                          className="text-red-600 hover:text-red-700 p-1 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary-600">{formatCurrency(getTotalPrice())}</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    Logger.info('Proceeding to checkout');
                    closeCart();
                    // Navigate to checkout page
                  }}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Proceed to Checkout
                </button>
                
                <button
                  onClick={handleClearCart}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;