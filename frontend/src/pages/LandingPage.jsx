import React from 'react';
import LandingLayout from '../components/landing/LandingLayout';
import HeroSection from '../components/landing/HeroSection';
import FeaturedDishes from '../components/landing/FeaturedDishes';
import AboutSection from '../components/landing/AboutSection';
import Testimonials from '../components/landing/Testimonials';
import ReservationForm from '../components/landing/ReservationForm';
import Footer from '../components/landing/Footer';
import { useAuth } from '../contexts/useAuth';
import { Logger } from '../utils/helpers';
import './LandingPage.css';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  
  Logger.info(`Landing page accessed. Authenticated: ${isAuthenticated}, User role: ${user?.role}`);

  return (
    <div className="landing-page">
      <LandingLayout>
        <HeroSection isAuthenticated={isAuthenticated} userRole={user?.role} />
        <FeaturedDishes />
        <AboutSection />
        <Testimonials />
        <ReservationForm />
      </LandingLayout>
      <Footer />
    </div>
  );
};

export default LandingPage;