import React from 'react';
import { motion } from 'motion/react';
import { Heart, Globe, Users, Shield, Apple, Target, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About NutriVision</h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            We are redefining how the world understands nutrition through the power of artificial intelligence and computer vision.
          </p>
        </motion.div>

        <div className="prose prose-lg max-w-none text-gray-600 space-y-12">
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 m-0">Our Social Impact</h2>
            </div>
            <p>
              NutriVision is deeply committed to <strong>SDG 3: Good Health and Well-being</strong>. Our goal is to ensure healthy lives and promote well-being for all at all ages. By providing accessible, AI-powered nutritional analysis, we empower individuals to make informed decisions about their diet, potentially reducing the risk of non-communicable diseases.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
              <Globe className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global Accessibility</h3>
              <p className="text-sm leading-relaxed">
                We believe that health information should be available to everyone, regardless of their location or socioeconomic status.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
              <Users className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community Driven</h3>
              <p className="text-sm leading-relaxed">
                Our platform grows with our users, constantly improving its accuracy and insights based on real-world data and feedback.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 m-0">The Technology</h2>
            </div>
            <p>
              Using state-of-the-art deep learning models hosted on Hugging Face, NutriVision can identify thousands of food types with high precision. Our backend, built on Node.js and Firebase, ensures that your data is processed quickly and stored securely.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
