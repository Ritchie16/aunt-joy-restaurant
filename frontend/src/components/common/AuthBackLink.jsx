import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AuthBackLink = () => (
  <div className="mx-auto w-full max-w-md px-1 mb-3">
    <Link
      to="/"
      className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Link>
  </div>
);

export default AuthBackLink;
