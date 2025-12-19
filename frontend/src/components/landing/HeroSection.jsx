import React from 'react';
import Button from '../common/Button';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = ({ isAuthenticated, userRole }) => {
  const scrollToReservation = () => {
    const element = document.getElementById('reservation');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1 className="hero-title">
            Taste the Authentic Flavors of <span className="highlight">Malawi</span>
          </h1>
          <p className="hero-subtitle">
            Fresh ingredients, traditional recipes, and a cozy atmosphere that feels like home
          </p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to="/customer/menu">
                <Button variant="primary" size="lg">
                  Order Now
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button variant="primary" size="lg">
                  Order Now
                </Button>
              </Link>
            )}
            <Button 
              variant="outline" 
              size="lg"
              onClick={scrollToReservation}
            >
              Book a Table
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;