import React from 'react';
import './AboutSection.css';
import restaurantImage from '../../assets/restaurant-image.jpg';

const AboutSection = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <div className="section-header">
              <span className="section-tag">About Us</span>
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
             {/* <div className="stat-item">
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
              </div>*/}
            </div>
          </div>
          
          {<div className="about-image">
            <img 
              src={restaurantImage} 
              alt="Malawian cuisine"
              
            />
          </div>}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;