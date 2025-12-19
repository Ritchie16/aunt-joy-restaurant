import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import  LoadingSpinner  from '../common/LoadingSpinner';
import { Utensils } from 'lucide-react';
import './FeaturedDishes.css';

const FeaturedDishes = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();

  useEffect(() => {
    const fetchFeaturedDishes = async () => {
      try {
        setLoading(true);
        // Fetch from your API
        const response = await get('/api/v1/meals/featured');
        
        if (response.data && response.data.success !== false) {
          // Handle both response formats
          const data = response.data.data || response.data;
          setDishes(Array.isArray(data) ? data : []);
        } else {
          console.error('API Error:', response.data?.message);
          // Fallback to mock data if API fails
          setDishes(getMockDishes());
        }
      } catch (error) {
        console.error('Error fetching featured dishes:', error);
        // Fallback to mock data
        setDishes(getMockDishes());
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedDishes();
  }, [get]);

  // Mock data in case API is not ready
  const getMockDishes = () => {
    return [
      {
        id: 1,
        name: 'Nsima with Chicken',
        description: 'Traditional Malawian staple with grilled chicken',
        price: 12.99,
        image_path: '/images/nsima-chicken.jpg',
        category_name: 'Main Course'
      },
      {
        id: 2,
        name: 'Chambo Fish',
        description: 'Lake Malawi fish served with rice and vegetables',
        price: 15.99,
        image_path: '/images/chambo-fish.jpg',
        category_name: 'Seafood'
      },
      {
        id: 3,
        name: 'Mandasi',
        description: 'Malawian fried dough served with tea',
        price: 4.99,
        image_path: '/images/mandasi.jpg',
        category_name: 'Breakfast'
      }
    ];
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MWK', // Malawi Kwacha
      minimumFractionDigits: 2
    }).format(price);
  };

  if (loading) {
    return (
      <section id="menu" className="featured-dishes">
        <div className="container">
          <h2 className="section-title">Our Signature Dishes</h2>
          <p className="section-subtitle">Chef's special recommendations</p>
          <div className="loading-container">
            <LoadingSpinner />
            <p className="loading-text">Loading delicious dishes...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="featured-dishes">
      <div className="container">
        <h2 className="section-title">Our Signature Dishes</h2>
        <p className="section-subtitle">Chef's special recommendations</p>
        
        {dishes.length === 0 ? (
          <div className="no-dishes">
            <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No featured dishes available at the moment.</p>
            <p className="text-gray-500">Please check back later or view our full menu.</p>
          </div>
        ) : (
          <div className="dishes-grid">
            {dishes.map((dish) => (
              <div key={dish.id} className="dish-card">
                <div className="dish-image">
                  <img 
                    src={dish.image_path || '/images/default-food.jpg'} 
                    alt={dish.name}
                    className="dish-img"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="%23f3f4f6"><rect width="400" height="300"/><text x="50%" y="50%" font-family="Arial" font-size="20" fill="%239ca3af" text-anchor="middle" dy=".3em">No Image</text></svg>';
                    }}
                  />
                </div>
                <div className="dish-content">
                  <div className="dish-header">
                    <h3 className="dish-name">{dish.name}</h3>
                    <span className="dish-price">{formatPrice(dish.price)}</span>
                  </div>
                  <p className="dish-description">{dish.description}</p>
                  <div className="dish-footer">
                    <span className="dish-category">{dish.category_name || 'Special'}</span>
                    <button className="dish-order-btn">Order Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedDishes;