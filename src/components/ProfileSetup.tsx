import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Activity, Scale, Ruler, Heart, User as UserIcon } from 'lucide-react';

export default function ProfileSetup({ onComplete }: { onComplete: () => void }) {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    height: '', // cm
    weight: '', // kg
    activityLevel: 'moderate',
    healthConditions: '',
    dietaryPreferences: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateMetrics = (data: typeof formData) => {
    const weight = parseFloat(data.weight);
    const height = parseFloat(data.height);
    const age = parseInt(data.age);
    
    // BMI
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    // BMR (Mifflin-St Jeor)
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += data.gender === 'male' ? 5 : -161;
    
    // TDEE
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    const tdee = bmr * activityMultipliers[data.activityLevel];

    return {
      bmi: parseFloat(bmi.toFixed(1)),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    setError('');

    try {
      const metrics = calculateMetrics(formData);
      
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        profile: {
          ...formData,
          age: parseInt(formData.age),
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
        },
        metrics,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      onComplete();
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Profile</h2>
        <p className="text-gray-500">We need a few details to personalize your AI diet recommendations.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
            {error}
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Age</label>
            <input
              type="number"
              required
              value={formData.age}
              onChange={e => setFormData({...formData, age: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#059669] outline-none"
              placeholder="e.g. 28"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Gender</label>
            <select
              value={formData.gender}
              onChange={e => setFormData({...formData, gender: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#059669] outline-none bg-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Height (cm)</label>
            <input
              type="number"
              required
              value={formData.height}
              onChange={e => setFormData({...formData, height: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#059669] outline-none"
              placeholder="e.g. 175"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Weight (kg)</label>
            <input
              type="number"
              required
              value={formData.weight}
              onChange={e => setFormData({...formData, weight: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#059669] outline-none"
              placeholder="e.g. 70"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Activity Level</label>
          <select
            value={formData.activityLevel}
            onChange={e => setFormData({...formData, activityLevel: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#059669] outline-none bg-white"
          >
            <option value="sedentary">Sedentary (Little or no exercise)</option>
            <option value="light">Light (Exercise 1-3 times/week)</option>
            <option value="moderate">Moderate (Exercise 4-5 times/week)</option>
            <option value="active">Active (Daily exercise or intense exercise 3-4 times/week)</option>
            <option value="very_active">Very Active (Intense exercise 6-7 times/week)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Health Conditions</label>
          <input
            type="text"
            value={formData.healthConditions}
            onChange={e => setFormData({...formData, healthConditions: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#059669] outline-none"
            placeholder="e.g. Diabetes, Hypertension, None"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Dietary Preferences</label>
          <input
            type="text"
            value={formData.dietaryPreferences}
            onChange={e => setFormData({...formData, dietaryPreferences: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#059669] outline-none"
            placeholder="e.g. Vegan, Keto, No restrictions"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#059669] text-white py-4 rounded-xl font-bold hover:bg-[#047857] transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-70"
        >
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </form>
    </div>
  );
}
