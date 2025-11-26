import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import  api  from '../services/api';
import { Logger } from '../utils/helpers';

/**
 * Manager Dashboard - Reports and Analytics
 */
const ManagerDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState({});
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, [filters]);

  /**
   * Load reports data
   */
  const loadReports = async () => {
    try {
      setIsLoading(true);
      Logger.info(`Loading reports for ${filters.month}/${filters.year}`);

      const response = await api.get(`/reports?month=${filters.month}&year=${filters.year}`);
      if (response.data.success) {
        setReports(response.data.data);
        Logger.info('Reports loaded successfully');
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to load reports';
      setError(errorMsg);
      Logger.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Export report
   */
  const exportReport = async (format) => {
    try {
      setIsExporting(true);
      Logger.info(`Exporting report as ${format}`);

      const response = await api.get(
        `/reports/export?month=${filters.month}&year=${filters.year}&format=${format}`,
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${filters.month}-${filters.year}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Logger.info(`Report exported successfully as ${format}`);
    } catch (error) {
      Logger.error('Error exporting report:', error);
      alert('Failed to export report: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Generate months and years for filters
   */
  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Reports</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadReports}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sales Reports & Analytics
          </h1>
          <p className="text-gray-600">
            Welcome, {user?.name}. Analyze sales performance and generate reports.
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {/* Date Filters */}
          <div className="flex space-x-2">
            <select
              value={filters.month}
              onChange={(e) => setFilters(prev => ({ ...prev, month: parseInt(e.target.value) }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            <select
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Export Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => exportReport('pdf')}
              disabled={isExporting || isLoading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>PDF</span>
            </button>

            <button
              onClick={() => exportReport('excel')}
              disabled={isExporting || isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                MK {reports.total_revenue ? parseFloat(reports.total_revenue).toFixed(2) : '0.00'}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{reports.total_orders || 0}</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +8% from last month
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">{reports.active_customers || 0}</p>
              <p className="text-sm text-purple-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +5% from last month
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                MK {reports.average_order_value ? parseFloat(reports.average_order_value).toFixed(2) : '0.00'}
              </p>
              <p className="text-sm text-orange-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +3% from last month
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading data...</p>
            </div>
          ) : reports.top_selling_items && reports.top_selling_items.length > 0 ? (
            <div className="space-y-4">
              {reports.top_selling_items.map((item, index) => (
                <div key={item.meal_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="bg-primary-600 text-white text-sm font-medium rounded-full h-6 w-6 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{item.meal_name}</p>
                      <p className="text-sm text-gray-600">{item.total_quantity} sold</p>
                    </div>
                  </div>
                  <span className="font-semibold text-primary-600">
                    MK {parseFloat(item.total_revenue).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No sales data available</p>
            </div>
          )}
        </div>

        {/* Sales Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trends</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading data...</p>
            </div>
          ) : reports.daily_sales && reports.daily_sales.length > 0 ? (
            <div className="space-y-3">
              {reports.daily_sales.map(day => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{day.date}</span>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (day.revenue / (reports.max_daily_revenue || 1)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-16 text-right">
                      MK {parseFloat(day.revenue).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No trend data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Export Loading Indicator */}
      {isExporting && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <Download className="h-4 w-4 animate-bounce" />
          <span className="text-sm">Preparing export...</span>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;