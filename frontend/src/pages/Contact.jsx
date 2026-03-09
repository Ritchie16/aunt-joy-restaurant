import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { Utensils } from 'lucide-react';
import './Contact.css';

/**
 * Simple public contact page (mostly static) that reuses
 * the same header layout as the landing page. The form uses
 * a mailto: action so no backend work is required.
 */
const Contact = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-[#f1f4f6]">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-500 p-2 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Aunt Joy&apos;s Restaurant</p>
              <h1 className="text-lg font-bold text-slate-900">Contact Us</h1>
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
                <Link
                  to="/login"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
        <p className="text-gray-700 mb-6">
          We'd love to hear from you. Reach out using the details below or send us a message directly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">Location</h3>
              <p>Mzuzu, Katoto, M1 road</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Email</h3>
              <p>info@auntjoys.com</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Phone</h3>
              <p>+265 (0) 999 467 324</p>
            </div>
          </div>

          <div>
            <form
              action="mailto:info@auntjoys.com"
              method="POST"
              encType="text/plain"
              className="space-y-4"
            >
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                required
                className="w-full border p-2 rounded"
              />

              <input
                type="email"
                name="email"
                placeholder="Your Email"
                required
                className="w-full border p-2 rounded"
              />

              <textarea
                name="message"
                placeholder="Your Message"
                rows="5"
                className="w-full border p-2 rounded"
                required
              />

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
