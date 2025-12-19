import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Utensils, User, UserCheck } from 'lucide-react';
import api from '../../services/api';
import { Logger } from '../../utils/helpers';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import MealForm from './MealForm';


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
  // Update your loadMealsAndCategories function
const loadMealsAndCategories = async () => {
  try {
    setIsLoading(true);
    setError('');
    Logger.info('Loading meals and categories...');
    
    console.group('📋 Loading Meal Data');
    
    // Test API connection first
    console.log('🔌 Testing API connection...');
    await api.testConnection();
    
    // Load meals
    console.log('🍽️ Loading meals from /meals...');
    const mealsResponse = await api.get('/meals');
    console.log('Meals Response:', mealsResponse);
    
    if (mealsResponse.data.success) {
      console.log(`✅ Loaded ${mealsResponse.data.data?.length || 0} meals`);
      console.log('Meals sample:', mealsResponse.data.data?.slice(0, 3));
      setMeals(mealsResponse.data.data || []);
    } else {
      console.error('❌ Meals API returned success=false:', mealsResponse.data);
      setError(mealsResponse.data.message || 'Failed to load meals');
    }
    
    // Load categories - IMPORTANT: Check your actual API endpoint
    console.log('📂 Loading categories...');
    
    // Try different endpoints to find the correct one
    const categoryEndpoints = ['/categories', '/meals/categories', '/meals?categories=true'];
    
    let categoriesResponse = null;
    for (const endpoint of categoryEndpoints) {
      try {
        console.log(`   Trying endpoint: ${endpoint}`);
        categoriesResponse = await api.get(endpoint);
        console.log(`   ✅ ${endpoint} responded with status:`, categoriesResponse.status);
        
        if (categoriesResponse.data.success) {
          console.log(`✅ Loaded ${categoriesResponse.data.data?.length || 0} categories`);
          setCategories(categoriesResponse.data.data || []);
          break;
        }
      } catch (err) {
        console.log(`   ❌ ${endpoint} failed:`, err.message);
      }
    }
    
    if (!categoriesResponse || !categoriesResponse.data.success) {
      console.warn('⚠️ Could not load categories from any endpoint');
      // Use the categories from your database dump if API fails
      const fallbackCategories = [
        {"id":1,"name":"Breakfast","description":"Start your day with our delicious breakfast options"},
        {"id":2,"name":"Lunch","description":"Hearty meals for your midday break"},
        {"id":3,"name":"Dinner","description":"Perfect meals to end your day"},
        {"id":4,"name":"Drinks","description":"Refreshing beverages and drinks"},
        {"id":5,"name":"Desserts","description":"Sweet treats to satisfy your cravings"}
      ];
      setCategories(fallbackCategories);
    }
    
    console.groupEnd();
    
  } catch (error) {
    console.error('❌ Error loading meals and categories:', error);
    
    // Detailed error analysis
    console.group('🔍 Error Analysis');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    }
    
    if (error.request) {
      console.error('No response received. Request was:', error.request);
    }
    
    console.groupEnd();
    
    const errorMsg = error.message || 'Failed to load data';
    setError(`Error: ${errorMsg}. Check console for details.`);
    
    // Show helpful error message to user
    if (error.message.includes('Network Error')) {
      setError('Cannot connect to server. Make sure the backend is running on http://localhost:8000');
    } else if (error.response?.status === 404) {
      setError('API endpoint not found. Check if the server routes are configured correctly.');
    }
    
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
  // const handleMealSaved = () => {
  //   loadMealsAndCategories();
  //   handleModalClose();
  // };

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

      {/* Search and Filter - existing code ... */}

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated By
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
  src={meal.image_path ? `http://localhost:8000${meal.image_path}` : ''}
  alt={meal.name}
  className="h-10 w-10 object-cover"
  onError={(e) => {
    // Fallback if image fails to load
    e.target.style.display = 'none';
    e.target.parentElement.innerHTML = '<div class="h-10 w-10 flex items-center justify-center bg-gray-100"><Utensils className="h-5 w-5 text-gray-400" /></div>';
  }}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        <div>
                          <div className="font-medium">{meal.creator_name || 'Unknown'}</div>
                          {meal.creator_email && (
                            <div className="text-xs text-gray-500">{meal.creator_email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <UserCheck className="h-4 w-4 mr-1 text-blue-400" />
                        <div>
                          <div className="font-medium">{meal.updater_name || meal.creator_name || 'Unknown'}</div>
                          {meal.updater_email && (
                            <div className="text-xs text-gray-500">{meal.updater_email}</div>
                          )}
                        </div>
                      </div>
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

      
{isModalOpen && (
  <Modal
    isOpen={isModalOpen}
    onClose={handleModalClose}
    title={selectedMeal ? 'Edit Meal' : 'Add New Meal'}
    size="lg"
  >
    <MealForm
      meal={selectedMeal}
      onClose={handleModalClose}
      onSuccess={loadMealsAndCategories}
    />
  </Modal>
)}
    </div>
  );
};

export default MealManagement;