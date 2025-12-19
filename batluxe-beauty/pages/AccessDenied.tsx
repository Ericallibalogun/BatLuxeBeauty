
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const AccessDenied: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <ShieldAlert size={80} className="text-red-500 mb-6" />
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Access Denied</h1>
      <p className="text-gray-500 text-center max-w-md mb-8">
        You do not have the required permissions to access this page. Please contact an administrator if you believe this is an error.
      </p>
      <Link 
        to="/" 
        className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default AccessDenied;
