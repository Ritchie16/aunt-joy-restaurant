import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Clock3,
  Truck,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  Package,
  Home,
  RefreshCw,
  Phone,
  MapPin,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/useAuth';
import { useCart } from '../contexts/CartContext';
import Menu from '../components/customer/Menu';
import Checkout from '../components/customer/Checkout';
import { Logger } from '../utils/helpers';
import { resolveMediaUrl } from '../utils/media';

const STATUS_META = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800', icon: Clock3 },
  preparing: { label: 'Preparing', className: 'bg-blue-100 text-blue-800', icon: ShoppingBag },
  out_for_delivery: { label: 'Out for Delivery', className: 'bg-violet-100 text-violet-800', icon: Truck },
  delivered: { label: 'Delivered', className: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', className: 'bg-rose-100 text-rose-800', icon: AlertCircle },
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCart();

  const location = useLocation();
  const navigate = useNavigate();

  const [meals, setMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState('');

  const section = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/customer/menu')) return 'menu';
    if (path.startsWith('/customer/cart')) return 'cart';
    if (path.startsWith('/customer/orders')) return 'orders';
    if (path.startsWith('/customer/checkout')) return 'checkout';
    return 'home';
  }, [location.pathname]);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      const [mealsResponse, categoriesResponse] = await Promise.all([
        api.get('/meals-available'),
        api.get('/categories'),
      ]);
      setMeals(mealsResponse.data?.data || []);
      setCategories(categoriesResponse.data?.data || []);
      setError('');
    } catch (loadError) {
      Logger.error('Failed to load customer home data', loadError);
      setError(loadError.message || 'Failed to load customer data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await api.get('/orders/my');
      setOrders(response.data?.data || []);
    } catch (loadError) {
      Logger.error('Failed to load customer orders', loadError);
      setError(loadError.message || 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
    loadOrders();
  }, []);

  const filteredHomeMeals = useMemo(() => {
    const source = selectedCategory === 'all'
      ? meals
      : meals.filter((meal) => Number(meal.category_id) === Number(selectedCategory));
    return source.slice(0, 8);
  }, [meals, selectedCategory]);

  const inProgressOrders = useMemo(
    () => orders.filter((order) => ['pending', 'preparing', 'out_for_delivery'].includes(order.status)),
    [orders]
  );
  const activeOrders = useMemo(
    () => orders.filter((order) => ['pending', 'preparing', 'out_for_delivery'].includes(order.status)),
    [orders]
  );
  const orderHistory = useMemo(
    () => orders.filter((order) => ['delivered', 'cancelled'].includes(order.status)),
    [orders]
  );

  const navItems = [
    { key: 'home', label: 'Home', icon: Home, href: '/customer' },
    { key: 'menu', label: 'Menu', icon: LayoutGrid, href: '/customer/menu' },
    { key: 'cart', label: 'Cart', icon: ShoppingCart, href: '/customer/cart' },
    { key: 'orders', label: 'My Orders', icon: Package, href: '/customer/orders' },
  ];

  const renderTopTabs = () => (
    <div className="hidden md:block mb-4">
      <div className="inline-flex rounded-2xl border border-gray-200 bg-white p-1">
        {navItems.map((item) => {
          const active = section === item.key;
          return (
            <Link
              key={item.key}
              to={item.href}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                active ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="space-y-6 pb-24 md:pb-8">
      <section className="rounded-3xl bg-gradient-to-br from-emerald-500 via-green-500 to-lime-500 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-emerald-50">Delivering in Mzuzu</p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">Hungry, {user?.name?.split(' ')[0]}?</h1>
            <p className="mt-2 text-sm text-emerald-50 md:text-base">Fresh meals from Aunt Joy&apos;s kitchen, straight to your door.</p>
          </div>

          <Link
            to="/customer/cart"
            className="inline-flex items-center gap-2 self-start rounded-xl bg-white/95 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-white"
          >
            <ShoppingCart className="h-4 w-4" /> Cart ({getTotalItems()})
          </Link>
        </div>

        <button
          onClick={() => navigate('/customer/menu')}
          className="mt-5 flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-left text-gray-500"
        >
          <Search className="h-5 w-5" /> Search meals or categories
        </button>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          <Link to="/customer/menu" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">See all</Link>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${selectedCategory === 'all' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(String(category.id))}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${String(selectedCategory) === String(category.id) ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Picks</h2>
          <Link to="/customer/menu" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">Full menu</Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((skeleton) => (
              <div key={skeleton} className="h-44 animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        ) : filteredHomeMeals.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredHomeMeals.map((meal) => (
              <article key={meal.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="h-36 w-full bg-gray-100">
                  {meal.image_path ? (
                    <img src={resolveMediaUrl(meal.image_path)} alt={meal.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{meal.category_name || 'Meal'}</p>
                  <h3 className="mt-1 text-base font-semibold text-gray-900 line-clamp-1">{meal.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{meal.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-900">MK {Number(meal.price).toFixed(2)}</p>
                    <button
                      onClick={() => addToCart(meal, 1)}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600">
            No meals found for this category.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Order Tracking</h2>
          <button onClick={loadOrders} className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {ordersLoading ? (
          <p className="text-sm text-gray-600">Loading orders...</p>
        ) : inProgressOrders.length > 0 ? (
          <div className="space-y-3">
            {inProgressOrders.slice(0, 3).map((order) => {
              const status = STATUS_META[order.status] || STATUS_META.pending;
              const Icon = status.icon;
              return (
                <div key={order.id} className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">#{order.order_number}</p>
                    <p className="text-sm text-gray-600">MK {Number(order.total_amount).toFixed(2)}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                    <Icon className="h-3.5 w-3.5" /> {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-600">No active orders. Start a new order from menu.</p>
        )}
      </section>
    </div>
  );

  const renderCart = () => (
    <div className="space-y-4 pb-24 md:pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cart</h1>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm font-semibold text-rose-600 hover:text-rose-700"
          >
            Clear cart
          </button>
        )}
      </div>

      {cartItems.length > 0 ? (
        <>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <article key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                    {item.image_path ? (
                      <img src={resolveMediaUrl(item.image_path)} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-600">MK {Number(item.price).toFixed(2)} each</p>
                    <p className="text-sm font-semibold text-gray-900">MK {(Number(item.price) * item.quantity).toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-50">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="rounded-md border border-gray-300 p-1.5 hover:bg-gray-50">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button onClick={() => removeFromCart(item.id)} className="rounded-md p-2 text-rose-600 hover:bg-rose-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Items</span>
              <span>{getTotalItems()}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>MK {getTotalPrice().toFixed(2)}</span>
            </div>
            <button
              onClick={() => navigate('/customer/checkout')}
              className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <ShoppingCart className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-gray-700">Your cart is empty.</p>
          <button onClick={() => navigate('/customer/menu')} className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Browse Menu
          </button>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4 pb-24 md:pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <button onClick={loadOrders} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {ordersLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-600">Loading your orders...</div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Active Orders</h2>
            {activeOrders.length > 0 ? (
              <div className="space-y-3">
                {activeOrders.map((order) => {
                  const status = STATUS_META[order.status] || STATUS_META.pending;
                  const Icon = status.icon;
                  return (
                    <article key={order.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">Order #{order.order_number}</p>
                          <p className="mt-1 text-sm text-gray-600">{new Date(order.created_at).toLocaleString()} • {order.item_count} items</p>
                          <p className="mt-1 text-sm text-gray-600">{order.delivery_address}</p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-lg font-bold text-gray-900">MK {Number(order.total_amount).toFixed(2)}</p>
                          <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                            <Icon className="h-3.5 w-3.5" /> {status.label}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-600">
                No active orders at the moment.
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Order History</h2>
            {orderHistory.length > 0 ? (
              <div className="space-y-3">
                {orderHistory.map((order) => {
                  const status = STATUS_META[order.status] || STATUS_META.pending;
                  const Icon = status.icon;
                  return (
                    <article key={order.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">Order #{order.order_number}</p>
                          <p className="mt-1 text-sm text-gray-600">{new Date(order.created_at).toLocaleString()} • {order.item_count} items</p>
                          <p className="mt-1 text-sm text-gray-600">{order.delivery_address}</p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-lg font-bold text-gray-900">MK {Number(order.total_amount).toFixed(2)}</p>
                          <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                            <Icon className="h-3.5 w-3.5" /> {status.label}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-600">
                No past orders yet.
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-gray-700">You have not placed any orders yet.</p>
          <button onClick={() => navigate('/customer/menu')} className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Browse Menu
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl">
      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="hidden items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 md:flex">
        <div>
          <p className="text-sm text-gray-500">Aunt Joy&apos;s Restaurant</p>
          <p className="text-lg font-semibold text-gray-900">Mzuzu Delivery</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1"><MapPin className="h-4 w-4" /> Mzuzu</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1"><Phone className="h-4 w-4" /> +265 123 456 789</span>
        </div>
      </div>

      <div className="mt-4">
        {renderTopTabs()}
        {section === 'home' && renderHome()}
        {section === 'menu' && <Menu />}
        {section === 'cart' && renderCart()}
        {section === 'orders' && renderOrders()}
        {section === 'checkout' && <Checkout />}
      </div>

      {section !== 'cart' && section !== 'checkout' && getTotalItems() > 0 && (
        <button
          onClick={() => navigate('/customer/cart')}
          className="fixed bottom-20 right-4 z-40 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-700 md:bottom-6"
        >
          Cart • MK {getTotalPrice().toFixed(2)}
        </button>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = section === item.key;
            const cartBadge = item.key === 'cart' ? getTotalItems() : 0;

            return (
              <Link
                key={item.key}
                to={item.href}
                className={`relative flex flex-col items-center gap-1 py-2 text-[11px] font-semibold ${active ? 'text-emerald-600' : 'text-gray-500'}`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
                {cartBadge > 0 && (
                  <span className="absolute top-1 right-5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white">
                    {cartBadge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default CustomerDashboard;
