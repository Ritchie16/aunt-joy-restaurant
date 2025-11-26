import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Utensils } from 'lucide-react';
import  api  from '../../services/api';
import { Logger } from '../../utils/helpers';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Meal Management Component for Admin
 */
const MealManagement = () => {
  const [meals, setMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMealsAndCategories();
  }, []);

  useEffect(() => {
    filterMeals();
  }, [meals, searchTerm, categoryFilter]);

  /**
   * Load meals and categories
   */
  const loadMealsAndCategories = async () => {
    try {
      setIsLoading(true);
      Logger.info('Loading meals and categories...');

      const [mealsResponse, categoriesResponse] = await Promise.all([
        api.get('/meals'),
        api.get('/categories')
      ]);

      if (mealsResponse.data.success) {
        setMeals(mealsResponse.data.data);
      }

      if (categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.data);
      }

    } catch (error) {
      const errorMsg = error.message || 'Failed to load data';
      setError(errorMsg);
      Logger.error('Error loading meals and categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filter meals based on search and category
   */
  const filterMeals = () => {
    let filtered = meals;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(meal =>
        meal.name.toLowerCase().includes(term) ||
        meal.description.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(meal => 
        meal.category_id === parseInt(categoryFilter)
      );
    }

    setFilteredMeals(filtered);
  };

  /**
   * Handle create new meal
   */
  const handleCreateMeal = () => {
    setSelectedMeal(null);
    setIsModalOpen(true);
  };

  /**
   * Handle edit meal
   */
  const handleEditMeal = (meal) => {
    setSelectedMeal(meal);
    setIsModalOpen(true);
  };

  /**
   * Handle delete meal
   */
  const handleDeleteMeal = async (meal) => {
    if (window.confirm(`Are you sure you want to delete "${meal.name}"?`)) {
      try {
        Logger.info(`Deleting meal: ${meal.name}`);
        
        const response = await api.delete(`/meals/${meal.id}`);
        if (response.data.success) {
          Logger.info(`Meal deleted successfully: ${meal.name}`);
          loadMealsAndCategories(); // Reload meals
        }
      } catch (error) {
        Logger.error('Error deleting meal:', error);
        alert('Failed to delete meal: ' + error.message);
      }
    }
  };

  /**
   * Handle modal close
   */
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMeal(null);
  };

  /**
   * Handle meal saved
   */
  const handleMealSaved = () => {
    loadMealsAndCategories();
    handleModalClose();
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Meals</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadMealsAndCategories}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Meal Management</h2>
          <p className="text-gray-600">Manage your restaurant menu items</p>
        </div>
        
        <button
          onClick={handleCreateMeal}
          className="mt-4 md:mt-0 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Meal</span>
        </button>
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
                placeholder="Search meals by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
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

      {/* Meals Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Loading meals..." />
          </div>
        ) : filteredMeals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
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
                {filteredMeals.map(meal => (
                  <tr key={meal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                          {meal.image_path ? (
                            <img
                              src={meal.image_path}
                              alt={meal.name}
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center bg-gray-100">
                              <Utensils className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{meal.name}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{meal.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {meal.category_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      MK {parseFloat(meal.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        meal.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {meal.is_available ? 'Available' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditMeal(meal)}
                          className="text-blue-600 hover:text-blue-900 p-1 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMeal(meal)}
                          className="text-red-600 hover:text-red-900 p-1 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No meals found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'No meals in the menu yet'
              }
            </p>
            <button
              onClick={handleCreateMeal}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add First Meal
            </button>
          </div>
        )}
      </div>

      {/* Meal Modal would go here */}
      {/* For now, we'll just show a basic modal structure */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedMeal ? 'Edit Meal' : 'Add New Meal'}
        size="lg"
      >
        <div className="text-center py-8">
          <p className="text-gray-600">
            Meal form would be implemented here
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This would include fields for name, description, price, category, and image upload.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default MealManagement;