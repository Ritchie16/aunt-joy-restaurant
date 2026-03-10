import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, MapPin, Phone, Utensils } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/useAuth';
import { resolveMediaUrl } from '../utils/media';

// landing-specific styling & components
import './LandingPage.css';
import Footer from '../components/landing/Footer';
import AboutSection from '../components/landing/AboutSection';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // derive filtered list when category changes
  const filteredMeals = selectedCategory === 'all'
    ? meals
    : meals.filter(m => m.category_id === parseInt(selectedCategory));

  useEffect(() => {
    const loadPublicData = async () => {
      try {
        const [mealsResponse, categoriesResponse] = await Promise.all([
          api.get('/meals-available'),
          api.get('/categories'),
        ]);

        setMeals(mealsResponse.data?.data || []);
        setCategories(categoriesResponse.data?.data || []);
      } catch (error) {
        setMeals([]);
        setCategories([]);
      }
    };

    loadPublicData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-500 p-2 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Aunt Joy&apos;s Restaurant</p>
              <h1 className="text-lg font-bold text-slate-900">Online Ordering</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'customer' ? '/customer' : '/dashboard'}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Login
                </Link>
                <Link to="/register" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-green-500 p-6 text-white md:p-10">
          <p className="text-sm uppercase tracking-wide text-emerald-100">Now delivering across Mzuzu</p>
          <h2 className="mt-2 text-3xl font-bold md:text-5xl">Fresh meals. Fast delivery.</h2>
          <p className="mt-3 max-w-2xl text-emerald-50">
            Browse our live menu, place your order online, and track delivery progress from kitchen to doorstep.
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1"><MapPin className="h-4 w-4" /> Mzuzu</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1"><Clock3 className="h-4 w-4" /> 8:00 AM - 10:00 PM</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1"><Phone className="h-4 w-4" /> +265 (0) 999 467 324</span>
          </div>

          <div className="mt-6">
            <Link
              to={isAuthenticated ? (user?.role === 'customer' ? '/customer' : '/dashboard') : '/register'}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Start Ordering <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">Menu Categories</h3>
            <span className="text-sm text-slate-500">{categories.length} categories</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category.id}
                onClick={() => setSelectedCategory(String(category.id))}
                className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors
                  ${selectedCategory === String(category.id)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}
                `}
              >
                {category.name}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">Available Meals</h3>
            <span className="text-sm text-slate-500">
              {selectedCategory === 'all' ? meals.length : filteredMeals.length} items
            </span>
          </div>

          {filteredMeals.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMeals.slice(0, 9).map((meal) => (
                <article key={meal.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="h-40 bg-slate-100">
                    {meal.image_path ? (
                      <img src={resolveMediaUrl(meal.image_path)} alt={meal.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">No image</div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase text-emerald-600">{meal.category_name || 'Meal'}</p>
                    <h4 className="mt-1 text-base font-semibold text-slate-900">{meal.name}</h4>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{meal.description}</p>
                    <p className="mt-3 text-lg font-bold text-slate-900">MK {Number(meal.price).toFixed(2)}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              Meals will appear here once available in the system.
            </div>
          )}
        </section>
      </main>
      {/* about us section pulled from component */}
      {/*<AboutSection /> */}
      {/* landing footer */}
      {/* clear filter button if active */}
      {selectedCategory !== 'all' && (
        <div className="max-w-7xl mx-auto px-4 py-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-sm text-emerald-600 hover:underline"
          >
            Show all meals
          </button>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default LandingPage;
