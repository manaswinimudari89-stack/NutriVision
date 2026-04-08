import React from 'react';
import { motion } from 'motion/react';
import { Heart, Globe, Users, Shield, Apple, Target, Zap, Activity, Brain } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-sm font-medium text-blue-600 mb-6">
            <Brain className="w-4 h-4" />
            AI-Powered Nutrition
          </span>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About NutriVision</h1>
          <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
            We are redefining how the world understands nutrition through the power of artificial intelligence and computer vision.
          </p>
        </motion.div>

        <div className="prose prose-lg max-w-none text-gray-600 space-y-16">
          
          {/* Mission Section */}
          <section className="bg-gray-50 rounded-[3rem] p-10 md:p-16 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 m-0">Our Social Impact</h2>
            </div>
            <p className="text-lg leading-relaxed mb-8">
              NutriVision is deeply committed to <strong>SDG 3: Good Health and Well-being</strong>. Our goal is to ensure healthy lives and promote well-being for all at all ages. By providing accessible, AI-powered nutritional analysis, we empower individuals to make informed decisions about their diet, potentially reducing the risk of non-communicable diseases like diabetes and hypertension.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="text-3xl font-black text-emerald-500 mb-2">100%</div>
                <div className="text-sm font-bold text-gray-900">Personalized</div>
                <div className="text-xs text-gray-500 mt-1">Diet plans tailored to your health conditions.</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="text-3xl font-black text-blue-500 mb-2">Instant</div>
                <div className="text-sm font-bold text-gray-900">Food Recognition</div>
                <div className="text-xs text-gray-500 mt-1">Powered by advanced AI models.</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="text-3xl font-black text-purple-500 mb-2">Secure</div>
                <div className="text-sm font-bold text-gray-900">Data Privacy</div>
                <div className="text-xs text-gray-500 mt-1">Your health data is encrypted and safe.</div>
              </div>
            </div>
          </section>

          {/* Core Values */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Globe className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global Accessibility</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                We believe that health information should be available to everyone, regardless of their location or socioeconomic status. Our app is designed to be intuitive and easy to use for people of all backgrounds.
              </p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Users className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community Driven</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Our platform grows with our users. We constantly improve our accuracy and insights based on real-world data and feedback to provide the best possible nutritional guidance.
              </p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Target className="w-8 h-8 text-orange-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Goal Oriented</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Whether you want to lose weight, build muscle, or manage a health condition, NutriVision provides the tools and tracking you need to stay on target and achieve your goals.
              </p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Activity className="w-8 h-8 text-rose-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Health First</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                We prioritize your long-term health over quick fixes. Our AI protocols specifically adapt to conditions like hypertension and diabetes to ensure your diet supports your medical needs.
              </p>
            </div>
          </section>

          {/* Technology Section */}
          <section className="bg-black text-white rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <h2 className="text-3xl font-bold text-white m-0">The Technology</h2>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
                Using state-of-the-art multimodal AI models (Gemini 3.1 Flash), NutriVision can identify thousands of food types with high precision from a single photo. Our backend, built on React and Firebase, ensures that your data is processed instantly and stored securely.
              </p>
            </div>
            {/* Abstract background shapes */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
          </section>
        </div>
      </div>
    </div>
  );
}
