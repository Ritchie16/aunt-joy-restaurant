import React from 'react';
import LandingHeader from './LandingHeader';
import './LandingLayout.css';

const LandingLayout = ({ children }) => {
  return (
    <div className="landing-layout">
      <LandingHeader />
      <main className="landing-main">
        {children}
      </main>
    </div>
  );
};

export default LandingLayout;