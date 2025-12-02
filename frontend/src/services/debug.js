// src/services/debug.js
import { Logger } from "../utils/helpers";

export const debugService = {
  /**
   * Log detailed API response information
   */
  logApiResponse: (url, response, error = null) => {
    const timestamp = new Date().toISOString();
    
    console.groupCollapsed(`🔍 API DEBUG: ${url} [${timestamp}]`);
    
    if (error) {
      console.error('❌ Error:', error);
      console.error('Error Details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        data: error.response?.data
      });
    } else {
      console.log('✅ Success Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        config: {
          url: response.config.url,
          method: response.config.method,
          headers: response.config.headers
        }
      });
      
      console.log('📦 Response Data:', response.data);
      console.log('📊 Data Type:', typeof response.data);
      console.log('🔗 Full Response Object:', response);
    }
    
    console.groupEnd();
  },

  /**
   * Log API request details
   */
  logApiRequest: (config) => {
    console.groupCollapsed(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('📤 Request Config:', {
      baseURL: config.baseURL,
      url: config.url,
      method: config.method,
      headers: config.headers,
      params: config.params,
      data: config.data
    });
    console.groupEnd();
  },

  /**
   * Test API connectivity
   */
  testConnection: async () => {
    const endpoints = [
      '/meals',
      '/meals-available',
      '/categories',
      '/auth/login'
    ];

    console.group('🔌 API Connection Tests');
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:8000/api${endpoint}`);
        console.log(`✅ ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        
        if (response.ok) {
          const text = await response.text();
          console.log(`   📄 Response preview:`, text.substring(0, 200));
        }
      } catch (error) {
        console.error(`❌ ${endpoint}:`, error.message);
      }
    }
    
    console.groupEnd();
  }
};