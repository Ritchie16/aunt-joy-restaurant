import React, { useState } from 'react';
import { Plus, Minus, Utensils } from 'lucide-react';
import { Logger } from '../../utils/helpers';
import { resolveMediaUrl } from '../../utils/media';

/**
 * Meal Card Component for displaying individual meals
 */
const MealCard = ({ meal, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  /**
   * Handle quantity increase
   */
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  /**
   * Handle quantity decrease
   */
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  /**
   * Handle add to cart with animation
   */
  const handleAddToCart = async () => {
    setIsAdding(true);
    Logger.info(`Adding ${quantity} ${meal.name} to cart`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onAddToCart(meal, quantity);
    setQuantity(1);
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Meal Image */}
      <div className="relative h-40 bg-gray-200">
        {meal.image_path ? (
          <img
            src={resolveMediaUrl(meal.image_path)}
            alt={meal.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Utensils className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Availability Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
          meal.is_available 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {meal.is_available ? 'Available' : 'Out of Stock'}
        </div>
      </div>

      {/* Meal Details */}
      <div className="p-3.5">
        {/* Meal Name and Price */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
            {meal.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
            {meal.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary-600">
              MK {parseFloat(meal.price).toFixed(2)}
            </span>
            {/* Rating would go here */}
          </div>
        </div>

        {/* Quantity Selector and Add to Cart */}
        {meal.is_available ? (
          <div className="space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">Quantity:</span>
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-semibold text-gray-900 w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full bg-primary-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isAdding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            disabled
            className="w-full bg-gray-300 text-gray-500 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
};

export default MealCard;
