import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import { Flame, Activity, TrendingUp, Utensils, Calendar, ShoppingCart, Loader2, Bell, CheckSquare, Square, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteField } from 'firebase/firestore';

interface DietPlan {
  createdAt?: string;
  dailyGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  schedule: {
    day: string;
    meals: {
      type: string;
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      ingredients: string;
      recipe: string;
    }[];
  }[];
  groceryList: string[];
}

export default function DietPlanPage() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [preferences, setPreferences] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isPlanExpired, setIsPlanExpired] = useState(false);

  useEffect(() => {
    const fetchProfileAndPlan = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Set preferences for generation
          if (data.profile) {
            const p = data.profile;
            const m = data.metrics;
            const profileString = `I am a ${p.age}yo ${p.gender}, ${p.weight}kg, ${p.height}cm. Activity level: ${p.activityLevel}. Health conditions: ${p.healthConditions}. Dietary preferences: ${p.dietaryPreferences}. Target calories: ${m.tdee} kcal/day.`;
            setPreferences(profileString);
          }

          // Check for existing diet plan
          if (data.dietPlan) {
            const savedPlan = data.dietPlan as DietPlan;
            if (savedPlan.createdAt) {
              const createdDate = new Date(savedPlan.createdAt);
              const now = new Date();
              const diffTime = Math.abs(now.getTime() - createdDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              if (diffDays > 7) {
                setIsPlanExpired(true);
              } else {
                setPlan(savedPlan);
                if (data.groceryCheckedItems) {
                  setCheckedItems(data.groceryCheckedItems);
                }
              }
            } else {
              setPlan(savedPlan);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching profile/plan:", error);
      }
    };
    fetchProfileAndPlan();
  }, []);

  const generatePlan = async () => {
    if (!preferences.trim() || !auth.currentUser) return;
    setLoading(true);
    
    try {
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a medically-sound, algorithmically optimized diet plan based on these preferences, goals, and conditions: ${preferences}. Return a realistic daily calorie goal and macro split, a 7-day weekly schedule with 4 meals per day (Breakfast, Lunch, Snack, Dinner) with realistic recipes and macros, and a consolidated grocery list.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dailyGoals: {
                type: Type.OBJECT,
                properties: {
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  fats: { type: Type.NUMBER },
                },
                required: ["calories", "protein", "carbs", "fats"]
              },
              schedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING, description: "e.g., Monday, Tuesday" },
                    meals: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          type: { type: Type.STRING },
                          name: { type: Type.STRING },
                          calories: { type: Type.NUMBER },
                          protein: { type: Type.NUMBER },
                          carbs: { type: Type.NUMBER },
                          fats: { type: Type.NUMBER },
                          ingredients: { type: Type.STRING },
                          recipe: { type: Type.STRING },
                        },
                        required: ["type", "name", "calories", "protein", "carbs", "fats", "ingredients", "recipe"]
                      }
                    }
                  },
                  required: ["day", "meals"]
                }
              },
              groceryList: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["dailyGoals", "schedule", "groceryList"]
          }
        }
      });

      if (response.text) {
        const parsedPlan = JSON.parse(response.text) as DietPlan;
        parsedPlan.createdAt = new Date().toISOString();
        
        // Save to Firestore
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          dietPlan: parsedPlan,
          groceryCheckedItems: {}
        }, { merge: true });

        setPlan(parsedPlan);
        setCheckedItems({});
        setIsPlanExpired(false);
      }
    } catch (error) {
      console.error("Failed to generate plan:", error);
      alert("Failed to generate diet plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async () => {
    if (!auth.currentUser) return;
    if (!window.confirm("Are you sure you want to delete your current weekly diet plan?")) return;
    
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        dietPlan: deleteField(),
        groceryCheckedItems: deleteField()
      });
      setPlan(null);
      setCheckedItems({});
      setIsPlanExpired(false);
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  const toggleGroceryItem = async (item: string) => {
    if (!auth.currentUser) return;
    const newCheckedState = { ...checkedItems, [item]: !checkedItems[item] };
    setCheckedItems(newCheckedState);
    
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        groceryCheckedItems: newCheckedState
      });
    } catch (error) {
      console.error("Error saving grocery state:", error);
    }
  };

  const toggleNotifications = () => {
    if (!notificationsEnabled && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          new Notification("NutriVision", { body: "Meal reminders enabled!" });
        }
      });
    } else {
      setNotificationsEnabled(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">AI Personalized Diet Plan</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Generate a medically-sound, algorithmically optimized diet plan based on your unique health profile, goals, and conditions.
          </p>
        </div>

        {/* Input Section */}
        {!plan && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-12"
          >
            {isPlanExpired && (
              <div className="mb-6 p-4 bg-orange-50 text-orange-700 rounded-xl border border-orange-100">
                <p className="font-bold">Your previous weekly diet plan has expired.</p>
                <p className="text-sm mt-1">It's time to generate a new plan for the upcoming week!</p>
              </div>
            )}
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Your Health Profile & Goals</label>
            <textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g., I am a 30yo male, 80kg, looking to build muscle. I am vegetarian and allergic to nuts."
              className="w-full p-4 border border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none h-32"
            />
            <button
              onClick={generatePlan}
              disabled={loading || !preferences.trim()}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
              Generate My Weekly Plan
            </button>
          </motion.div>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {plan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Top Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-teal-600 text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
                  <Flame className="absolute top-6 right-6 w-6 h-6 opacity-50" />
                  <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Daily Goal</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">{plan.dailyGoals.calories}</span>
                    <span className="text-sm font-medium opacity-80">kcal</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative">
                  <Activity className="absolute top-6 right-6 w-6 h-6 text-blue-500 opacity-50" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Protein Goal</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.dailyGoals.protein}</span>
                    <span className="text-sm font-medium text-gray-400">g</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative">
                  <TrendingUp className="absolute top-6 right-6 w-6 h-6 text-orange-500 opacity-50" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Carbs Goal</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.dailyGoals.carbs}</span>
                    <span className="text-sm font-medium text-gray-400">g</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative">
                  <Utensils className="absolute top-6 right-6 w-6 h-6 text-red-500 opacity-50" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fats Goal</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.dailyGoals.fats}</span>
                    <span className="text-sm font-medium text-gray-400">g</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Schedule */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-teal-600" />
                      <h2 className="text-2xl font-bold text-gray-900">Weekly Schedule</h2>
                    </div>
                    <button 
                      onClick={toggleNotifications}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors",
                        notificationsEnabled ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      <Bell className="w-4 h-4" />
                      {notificationsEnabled ? "Reminders On" : "Enable Reminders"}
                    </button>
                  </div>

                  {plan.schedule.map((dayPlan, dayIdx) => (
                    <div key={dayIdx} className="mb-8">
                      <h3 className="text-xl font-extrabold text-gray-900 mb-4 pb-2 border-b-2 border-teal-100">{dayPlan.day}</h3>
                      <div className="space-y-4">
                        {dayPlan.meals.map((meal, idx) => (
                          <div key={idx} className="bg-white p-6 rounded-3xl border-l-4 border-teal-500 shadow-sm border-y border-r border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider rounded-md mb-2">
                                  {meal.type}
                                </span>
                                <h4 className="text-lg font-bold text-gray-900">{meal.name}</h4>
                              </div>
                              <div className="text-right">
                                <div className="flex items-baseline justify-end gap-1 text-teal-600">
                                  <span className="text-2xl font-extrabold">{meal.calories}</span>
                                  <span className="text-sm font-bold">kcal</span>
                                </div>
                                <div className="text-xs font-bold text-gray-400 mt-1">
                                  P:{meal.protein}g C:{meal.carbs}g F:{meal.fats}g
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2"><strong className="text-gray-900">Ingredients:</strong> {meal.ingredients}</p>
                            <p className="text-sm text-gray-500 italic">Recipe: {meal.recipe}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column: Grocery List */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <ShoppingCart className="w-6 h-6 text-teal-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Automated Grocery List</h2>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Smart Grocery Essentials</h3>
                    <div className="space-y-3">
                      {plan.groceryList.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => toggleGroceryItem(item)}
                          className="w-full flex items-center gap-3 text-left group"
                        >
                          {checkedItems[item] ? (
                            <CheckSquare className="w-5 h-5 text-teal-500 shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-colors shrink-0" />
                          )}
                          <span className={cn(
                            "text-sm transition-colors",
                            checkedItems[item] ? "text-gray-400 line-through" : "text-gray-700 font-medium"
                          )}>
                            {item}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={deletePlan}
                    className="w-full mt-6 bg-red-50 text-red-600 py-4 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Weekly Plan
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
