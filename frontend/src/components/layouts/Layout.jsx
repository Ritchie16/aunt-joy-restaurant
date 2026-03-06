import React from 'react';
import Header from './Header';
import Cart from '../customer/Cart';
import { useAuth } from '../../contexts/useAuth';
import { Logger } from '../../utils/helpers';

/**
 * Main Layout Component wrapping all pages
 */
const Layout = ({ children }) => {
  const { isCustomer } = useAuth();
  Logger.debug('Layout rendered');
  
  return (
    <div className="min-h-screen bg-[#f1f4f6] flex flex-col">
      <Header />
      <main className={`flex-1 mx-auto w-full px-4 sm:px-6 lg:px-8 ${isCustomer ? 'max-w-6xl py-4 md:py-5' : 'max-w-6xl py-6'}`}>
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-base font-bold text-primary-600">
                Aunt Joy's Restaurant
              </span>
            </div>
            
            <div className="text-xs text-gray-600">
              <p>&copy; {new Date().getFullYear()} Aunt Joy's Restaurant. All rights reserved.</p>
              <p className="mt-1">Mzuzu, Malawi</p>
            </div>
          </div>
        </div>
      </footer>

      {isCustomer && <Cart />}
    </div>
  );
};

export default Layout;
