import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Flame, Activity, Heart, ShieldAlert, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';

interface MealLog {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  imageUrl: string;
  timestamp: string;
}

export default function Dashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, `users/${auth.currentUser.uid}/meals`),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mealData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MealLog[];
      setMeals(mealData);

      // Calculate today's stats
      const today = new Date().toISOString().split('T')[0];
      const todayMeals = mealData.filter(m => m.timestamp.startsWith(today));
      
      const newStats = todayMeals.reduce((acc, curr) => ({
        calories: acc.calories + curr.calories,
        protein: acc.protein + curr.protein,
        carbs: acc.carbs + curr.carbs,
        fats: acc.fats + curr.fats
      }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
      
      setStats(newStats);
      setLoading(false);
    }, (error) => {
      console.error("Dashboard error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!containerRef.current || loading) return;
    
    const ctx = gsap.context(() => {
      gsap.from('.stagger-card', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      });
      
      gsap.from('.progress-bar-fill', {
        width: 0,
        duration: 1.5,
        ease: 'power3.out',
        delay: 0.5,
      });

      gsap.from('.donut-segment', {
        strokeDasharray: '0, 100',
        duration: 1.5,
        ease: 'power3.out',
        delay: 0.5,
        stagger: 0.2,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate percentages for the donut chart
  const totalMacros = stats.protein + stats.carbs + stats.fats || 1;
  const pPct = (stats.protein / totalMacros) * 100;
  const cPct = (stats.carbs / totalMacros) * 100;
  const fPct = (stats.fats / totalMacros) * 100;
  
  // SVG stroke-dasharray values (length, gap)
  const pDash = `${pPct}, 100`;
  const cDash = `${cPct}, 100`;
  const fDash = `${fPct}, 100`;
  
  // SVG stroke-dashoffset values
  const pOffset = 0;
  const cOffset = -pPct;
  const fOffset = -(pPct + cPct);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={containerRef}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Row */}
        <div className="lg:col-span-6 stagger-card">
          <div className="bg-gradient-to-br from-[#059669] to-[#10b981] rounded-[2rem] p-8 text-white h-full relative overflow-hidden shadow-lg shadow-emerald-500/20">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xs font-bold tracking-widest uppercase opacity-90">Target Daily Caloric Intake</h3>
              <Flame className="w-5 h-5 opacity-80" />
            </div>
            
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-6xl font-black tracking-tight">{stats.calories}</span>
              <span className="text-xl font-medium opacity-90">/ 2500 kcal</span>
            </div>
            
            <div className="w-full bg-white/20 rounded-full h-3 mb-4 overflow-hidden">
              <div className="progress-bar-fill bg-white h-full rounded-full" style={{ width: `${Math.min((stats.calories / 2500) * 100, 100)}%` }}></div>
            </div>
            
            <div className="flex items-center gap-2 text-sm font-bold">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {stats.calories >= 2500 ? 'Caloric Goal Reached' : 'On Track'}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 stagger-card">
          <div className="bg-white rounded-[2rem] p-8 h-full shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase">BMI Index</h3>
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-6xl font-black text-[#0f172a] tracking-tight mb-3">16.4</div>
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider rounded-md">
                Underweight
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 stagger-card">
          <div className="bg-white rounded-[2rem] p-8 h-full shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Metabolic Rate</h3>
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <div className="text-6xl font-black text-[#0f172a] tracking-tight mb-1">1187</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Base Kcal/Day</div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="lg:col-span-4 stagger-card">
          <div className="bg-white rounded-[2rem] p-8 h-full shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-lg font-bold text-[#0f172a] mb-8">Macro Breakdown</h3>
            
            <div className="flex-1 flex flex-col items-center justify-center relative mb-8">
              {/* Custom SVG Donut Chart */}
              <svg viewBox="0 0 36 36" className="w-48 h-48 transform -rotate-90">
                {/* Background Circle */}
                <path
                  className="text-gray-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                {/* Protein (Green) */}
                <path
                  className="donut-segment text-emerald-500"
                  strokeDasharray={pDash}
                  strokeDashoffset={pOffset}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Carbs (Orange) */}
                <path
                  className="donut-segment text-amber-500"
                  strokeDasharray={cDash}
                  strokeDashoffset={cOffset}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Fats (Red) */}
                <path
                  className="donut-segment text-rose-500"
                  strokeDasharray={fDash}
                  strokeDashoffset={fOffset}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-[#0f172a]">{Math.round(totalMacros)}g</span>
                <span className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest leading-tight mt-1">Total<br/>Biosynthesized</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="w-8 h-1 bg-emerald-500 mx-auto rounded-full mb-2"></div>
                <div className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Protein</div>
                <div className="text-xl font-black text-[#0f172a]">{Math.round(stats.protein)}g</div>
              </div>
              <div>
                <div className="w-8 h-1 bg-amber-500 mx-auto rounded-full mb-2"></div>
                <div className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Carbs</div>
                <div className="text-xl font-black text-[#0f172a]">{Math.round(stats.carbs)}g</div>
              </div>
              <div>
                <div className="w-8 h-1 bg-rose-500 mx-auto rounded-full mb-2"></div>
                <div className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Fats</div>
                <div className="text-xl font-black text-[#0f172a]">{Math.round(stats.fats)}g</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Nutrient Gap Detection */}
          <div className="bg-[#111424] rounded-[2rem] p-8 stagger-card shadow-xl shadow-black/5">
            <div className="flex items-center gap-3 mb-8">
              <ShieldAlert className="w-6 h-6 text-rose-500" />
              <h3 className="text-xl font-bold text-white">Nutrient Gap Detection</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#1e2235] rounded-2xl p-6 border border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-xl">🥩</div>
                  <span className="px-2 py-1 bg-rose-500 text-white text-[0.65rem] font-bold uppercase tracking-wider rounded-md">Deficit Found</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-4">Insufficient Iron</h4>
                <div className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-2">AI Recovery Strategy:</div>
                <div className="bg-[#2a2f45] text-gray-300 text-sm p-3 rounded-xl">Spinach, lentils, red meat</div>
              </div>
              
              <div className="bg-[#1e2235] rounded-2xl p-6 border border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-xl">🥛</div>
                  <span className="px-2 py-1 bg-rose-500 text-white text-[0.65rem] font-bold uppercase tracking-wider rounded-md">Deficit Found</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-4">Insufficient Calcium</h4>
                <div className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-2">AI Recovery Strategy:</div>
                <div className="bg-[#2a2f45] text-gray-300 text-sm p-3 rounded-xl">Dairy, almonds, fortified soy</div>
              </div>
            </div>
          </div>

          {/* AI Condition Protocols */}
          <div className="bg-white rounded-[2rem] p-8 stagger-card shadow-sm border border-gray-100 flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-[#0f172a]">AI Condition Protocols</h3>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex gap-4 items-start">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-[#0f172a]">Hypertension Protocol</h4>
                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-[0.6rem] font-bold uppercase tracking-wider rounded-md">Active</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Sodium-response filter active (&lt;1500mg/day). Prioritizing high-mineral potassium and magnesium rich alternatives.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
