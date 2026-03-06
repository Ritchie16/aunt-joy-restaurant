import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Download, TrendingUp, Users, Package, DollarSign, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import api from '../services/api';
import { Logger } from '../utils/helpers';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const pctChange = (current, previous) => {
  const c = Number(current || 0);
  const p = Number(previous || 0);
  if (p === 0 && c === 0) return '0.0%';
  if (p === 0) return '+100.0%';
  const change = ((c - p) / p) * 100;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
};

const prevPeriod = (month, year) => {
  if (month === 1) return { month: 12, year: year - 1 };
  return { month: month - 1, year };
};

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState({});
  const [previousReports, setPreviousReports] = useState({});
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  const years = useMemo(() => Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i), []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError('');

      const prev = prevPeriod(filters.month, filters.year);
      Logger.info(`Loading manager reports for ${filters.month}/${filters.year}`);

      const [currentResponse, previousResponse] = await Promise.all([
        api.get(`/reports?month=${filters.month}&year=${filters.year}`),
        api.get(`/reports?month=${prev.month}&year=${prev.year}`),
      ]);

      setReports(currentResponse.data?.data || {});
      setPreviousReports(previousResponse.data?.data || {});
    } catch (loadError) {
      const errorMsg = loadError.message || 'Failed to load reports';
      setError(errorMsg);
      Logger.error('Error loading manager reports:', loadError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [filters.month, filters.year]);

  const exportReport = async (format) => {
    try {
      setIsExporting(true);
      const response = await api.get(`/reports/export?month=${filters.month}&year=${filters.year}&format=${format}`, {
        responseType: 'blob',
      });

      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${filters.month}-${filters.year}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (exportError) {
      Logger.error('Error exporting report:', exportError);
      alert('Failed to export report: ' + (exportError.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Reports</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadReports} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sales Reports & Analytics</h1>
          <p className="text-gray-600">Welcome, {user?.name}. Analyze sales performance with live data.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.month}
            onChange={(e) => setFilters((prev) => ({ ...prev, month: parseInt(e.target.value, 10) }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {MONTHS.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <select
            value={filters.year}
            onChange={(e) => setFilters((prev) => ({ ...prev, year: parseInt(e.target.value, 10) }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <button
            onClick={loadReports}
            disabled={isLoading}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            onClick={() => exportReport('pdf')}
            disabled={isExporting || isLoading}
            className="bg-red-600 text-white px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors inline-flex items-center gap-1"
          >
            <Download className="h-4 w-4" /> PDF
          </button>

          <button
            onClick={() => exportReport('excel')}
            disabled={isExporting || isLoading}
            className="bg-emerald-600 text-white px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors inline-flex items-center gap-1"
          >
            <Download className="h-4 w-4" /> Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900">MK {Number(reports.total_revenue || 0).toFixed(2)}</p>
              <p className="text-sm text-emerald-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {pctChange(reports.total_revenue, previousReports.total_revenue)} vs prev period
              </p>
            </div>
            <div className="bg-emerald-100 p-2.5 rounded-lg">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-xl font-bold text-gray-900">{reports.total_orders || 0}</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {pctChange(reports.total_orders, previousReports.total_orders)} vs prev period
              </p>
            </div>
            <div className="bg-blue-100 p-2.5 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-xl font-bold text-gray-900">{reports.active_customers || 0}</p>
              <p className="text-sm text-violet-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {pctChange(reports.active_customers, previousReports.active_customers)} vs prev period
              </p>
            </div>
            <div className="bg-violet-100 p-2.5 rounded-lg">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-xl font-bold text-gray-900">MK {Number(reports.average_order_value || 0).toFixed(2)}</p>
              <p className="text-sm text-amber-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                {pctChange(reports.average_order_value, previousReports.average_order_value)} vs prev period
              </p>
            </div>
            <div className="bg-amber-100 p-2.5 rounded-lg">
              <BarChart3 className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading data...</p>
            </div>
          ) : reports.top_selling_items?.length > 0 ? (
            <div className="space-y-4">
              {reports.top_selling_items.map((item, index) => (
                <div key={item.meal_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="bg-primary-600 text-white text-sm font-medium rounded-full h-6 w-6 flex items-center justify-center">{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900">{item.meal_name}</p>
                      <p className="text-sm text-gray-600">{item.total_quantity} sold</p>
                    </div>
                  </div>
                  <span className="font-semibold text-primary-600">MK {Number(item.total_revenue).toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">No sales data available for this period.</div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales</h3>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading data...</p>
            </div>
          ) : reports.daily_sales?.length > 0 ? (
            <div className="space-y-3">
              {reports.daily_sales.map((day) => {
                const percent = (Number(day.revenue || 0) / (Number(reports.max_daily_revenue || 1))) * 100;
                return (
                  <div key={day.date} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-600 w-24">{day.date}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${Math.min(100, percent)}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-24 text-right">MK {Number(day.revenue).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">No daily sales data available.</div>
          )}
        </div>
      </div>

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
