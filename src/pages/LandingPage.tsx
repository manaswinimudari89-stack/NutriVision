import React from 'react';
import Hero from '../components/Hero';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Heart, Target, Apple, Camera, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const features = [
    { title: 'AI Recognition', desc: 'Instantly identify thousands of food types with our advanced computer vision model.', icon: Camera, color: 'text-blue-500', bg: 'bg-blue-50', link: '/analyze' },
    { title: 'Nutritional Data', desc: 'Get accurate calories, protein, carbs, and fats for every meal you log.', icon: Activity, color: 'text-green-500', bg: 'bg-green-50', link: '/dashboard' },
    { title: 'Goal Tracking', desc: 'Set personalized health goals and monitor your progress with intuitive dashboards.', icon: Target, color: 'text-orange-500', bg: 'bg-orange-50', link: '/dashboard' },
    { title: 'Diet Plans', desc: 'Generate personalized weekly diet plans based on your health conditions and goals.', icon: Apple, color: 'text-purple-500', bg: 'bg-purple-50', link: '/diet-plan' },
  ];

  return (
    <div className="bg-white">
      <Hero />
      
      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to eat better</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">Powerful features designed to help you understand your nutrition and reach your health goals.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <Link to={feature.link} key={feature.title} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", feature.bg)}>
                    <feature.icon className={cn("w-7 h-7", feature.color)} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social Impact Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Heart className="text-red-500 fill-red-500 w-6 h-6" />
                <span className="text-sm font-bold uppercase tracking-widest text-gray-400">SDG 3: Good Health & Well-being</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Our mission is to improve global health through AI.</h2>
              <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                NutriVision is built with the United Nations Sustainable Development Goal 3 in mind. We believe that access to nutritional information is a fundamental step toward a healthier world.
              </p>
              <Link to="/login" className="inline-block bg-white text-black px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all duration-300">
                Join the Mission
              </Link>
            </div>
            {/* Abstract background shapes */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
          </div>
        </div>
      </section>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
