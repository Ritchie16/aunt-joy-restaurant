import React from 'react';
import Header from './Header';
import { Logger } from '../../utils/helpers';

/**
 * Main Layout Component wrapping all pages
 */
const Layout = ({ children }) => {
  Logger.debug('Layout rendered');
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-lg font-bold text-primary-600">
                Aunt Joy's Restaurant
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>&copy; {new Date().getFullYear()} Aunt Joy's Restaurant. All rights reserved.</p>
              <p className="text-xs mt-1">Mzuzu, Malawi</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;