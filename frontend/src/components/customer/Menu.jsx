import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Utensils } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import MealCard from './MealCard';
import  api  from '../../services/api';
import { Logger } from '../../utils/helpers';

/**
 * Customer Menu Component with Search and Filtering
 */
const Menu = () => {
  const [meals, setMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  
  const { addToCart } = useCart();

  useEffect(() => {
    loadMenuData();
  }, []);

  useEffect(() => {
    const queryCategory = searchParams.get('category');
    if (queryCategory) {
      setSelectedCategory(queryCategory);
    }
  }, [searchParams]);

  useEffect(() => {
    filterMeals();
  }, [meals, selectedCategory, searchTerm]);

  /**
   * Load meals and categories from API
   */
  const loadMenuData = async () => {
    try {
      setIsLoading(true);
      Logger.info('Loading menu data...');
      
      // In a real app, these would be separate API calls
      const mealsResponse = await api.get('/meals-available');
      const categoriesResponse = await api.get('/categories');
      
      if (mealsResponse.data.success) {
        setMeals(mealsResponse.data.data);
        Logger.info(`Loaded ${mealsResponse.data.data.length} meals`);
      }
      
      if (categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.data);
        Logger.info(`Loaded ${categoriesResponse.data.data.length} categories`);
      }
      
    } catch (error) {
      const errorMsg = error.message || 'Failed to load menu';
      setError(errorMsg);
      Logger.error('Error loading menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filter meals based on category and search term
   */
  const filterMeals = () => {
    let filtered = meals;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(meal => 
        meal.category_id === parseInt(selectedCategory)
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(meal =>
        meal.name.toLowerCase().includes(term) ||
        meal.description.toLowerCase().includes(term)
      );
    }

    setFilteredMeals(filtered);
    Logger.debug(`Filtered meals: ${filtered.length} results`);
  };

  /**
   * Handle category filter change
   */
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    Logger.debug(`Category filter changed to: ${categoryId}`);
  };

  /**
   * Handle search input change
   */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  /**
   * Handle add to cart
   */
  const handleAddToCart = (meal, quantity = 1) => {
    addToCart(meal, quantity);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Menu</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadMenuData}
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
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Our Menu</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our delicious selection of meals prepared with fresh ingredients and traditional recipes
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search meals by name or description..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white transition-colors text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading delicious meals...</p>
        </div>
      )}

      {/* Menu Grid */}
      {!isLoading && (
        <>
          {/* Results Count */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredMeals.length} of {meals.length} meals
            </p>
            {(selectedCategory !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                }}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Meals Grid */}
          {filteredMeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMeals.map(meal => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No meals found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No meals available at the moment'
                }
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchTerm('');
                  }}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Menu;
