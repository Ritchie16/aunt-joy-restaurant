// src/hooks/useApi.js
import { useState, useEffect } from 'react';
import { Logger } from '../utils/helpers';

/**
 * Custom hook for API calls with loading and error states
 */
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        Logger.debug('useApi: Starting API call');

        const response = await apiCall();
        
        if (isMounted) {
          if (response.data.success) {
            setData(response.data.data);
            Logger.debug('useApi: API call successful', response.data.data);
          } else {
            setError(response.data.message || 'API call failed');
            Logger.warn('useApi: API call failed', response.data);
          }
        }
      } catch (err) {
        if (isMounted) {
          const errorMsg = err.message || 'An error occurred';
          setError(errorMsg);
          Logger.error('useApi: API error', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: () => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall();
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  } };
};