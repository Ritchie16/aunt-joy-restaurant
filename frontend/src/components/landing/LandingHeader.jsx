import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { Menu, X, Utensils } from 'lucide-react';
import './LandingHeader.css';

const LandingHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="landing-header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo">
          <Link to="/" className="logo-link">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-500 p-2 rounded-lg">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Aunt Joy's</span>
                <span className="block text-xs text-gray-600">Malawian Restaurant</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Navigation */}
        <nav className={`header-nav ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <button 
                onClick={() => scrollToSection('menu')}
                className="nav-link"
              >
                Menu
              </button>
            </li>
            <li className="nav-item">
              <button 
                onClick={() => scrollToSection('about')}
                className="nav-link"
              >
                About Us
              </button>
            </li>
            <li className="nav-item">
              <button 
                onClick={() => scrollToSection('testimonials')}
                className="nav-link"
              >
                Reviews
              </button>
            </li>
            <li className="nav-item">
              <button 
                onClick={() => scrollToSection('reservation')}
                className="nav-link"
              >
                Book Table
              </button>
            </li>
          </ul>
        </nav>

        {/* Auth Actions */}
        <div className={`header-actions ${isMenuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <span className="welcome-text hidden md:inline">
                Welcome, <span className="font-semibold">{user?.name?.split(' ')[0] || 'User'}</span>
              </span>
              <Link 
                to="/dashboard" 
                className="btn btn-outline"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button 
                onClick={logout}
                className="btn btn-ghost"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="btn btn-outline"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;