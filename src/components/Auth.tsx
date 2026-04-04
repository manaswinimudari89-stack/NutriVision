import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../lib/firebase';
import { motion } from 'motion/react';
import { Apple, Chrome, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-black/5 border border-gray-100 p-10 md:p-12"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/20">
            <Apple className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Welcome to NutriVision</h2>
          <p className="text-gray-500">Sign in to start your personalized nutrition journey.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm"
          >
            <Chrome className="w-5 h-5 text-blue-500" />
            Continue with Google
          </button>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400 font-medium">Secure Authentication</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        <p className="mt-10 text-center text-xs text-gray-400 leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy. Your data is encrypted and secure.
        </p>
      </motion.div>
    </div>
  );
}
