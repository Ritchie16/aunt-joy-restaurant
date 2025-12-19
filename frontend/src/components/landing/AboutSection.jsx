import React from 'react';
import './AboutSection.css';

const AboutSection = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <div className="section-header">
              <span className="section-tag">Our Story</span>
              <h2 className="section-title">Authentic Malawian Flavors</h2>
            </div>
            <p>
              Founded in 2020 in the heart of Mzuzu, Aunt Joy's Restaurant brings 
              the authentic taste of Malawi to your table. Our recipes are inspired by 
              traditional Malawian cooking methods passed down through generations.
            </p>
            <p>
              We believe in using only the freshest, locally-sourced ingredients. 
              From our famous Nsima to our flavorful fish dishes, every meal is 
              prepared with love and attention to detail.
            </p>
            
            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-number">3+</span>
                <span className="stat-label">Years Serving</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Traditional Dishes</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">1000+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
            </div>
          </div>
          
          <div className="about-image">
            <img 
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Malawian cuisine"
              className="restaurant-image"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" fill="%23f3f4f6"><rect width="400" height="300"/></svg>';
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;