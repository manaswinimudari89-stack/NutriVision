import React, { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, AlertTriangle } from 'lucide-react';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info';
}

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [caloriesToday, setCaloriesToday] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    const fetchProfile = async () => {
      const docRef = doc(db, 'users', auth.currentUser!.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    };
    fetchProfile();

    const q = query(collection(db, `users/${auth.currentUser.uid}/meals`));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const today = new Date().toISOString().split('T')[0];
      const todayMeals = snapshot.docs
        .map(doc => doc.data())
        .filter(m => m.timestamp.startsWith(today));
        
      const currentCalories = todayMeals.reduce((acc, curr) => acc + curr.calories, 0);
      setCaloriesToday(currentCalories);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!profile) return;

    const newNotifications: AppNotification[] = [];
    const targetCalories = profile.metrics?.tdee || 2000;
    const today = new Date().toISOString().split('T')[0];

    // 1. Calorie Limit Check
    if (caloriesToday > targetCalories) {
      const lastNotified = localStorage.getItem('lastCalorieNotification');
      if (lastNotified !== today) {
        newNotifications.push({
          id: 'cal-exceed',
          title: 'Calorie Limit Exceeded',
          message: `You have exceeded your daily goal of ${targetCalories} kcal.`,
          type: 'warning'
        });
        localStorage.setItem('lastCalorieNotification', today);
      }
    }

    // 2. Health Condition Alerts
    if (profile.profile?.healthConditions) {
      const conditions = profile.profile.healthConditions.toLowerCase();
      const lastHealthAlert = localStorage.getItem('lastHealthAlert');
      if (lastHealthAlert !== today) {
        if (conditions.includes('diabetes')) {
          newNotifications.push({ id: 'health-diabetes', title: 'Health Alert', message: 'Remember to monitor your sugar intake today.', type: 'info' });
        }
        if (conditions.includes('hypertension') || conditions.includes('blood pressure')) {
          newNotifications.push({ id: 'health-bp', title: 'Health Alert', message: 'Keep an eye on your sodium intake.', type: 'info' });
        }
        localStorage.setItem('lastHealthAlert', today);
      }
    }

    if (newNotifications.length > 0) {
      setNotifications(prev => [...prev, ...newNotifications]);
    }
  }, [profile, caloriesToday]);

  useEffect(() => {
    // Meal reminders
    const checkMealTimes = () => {
      const now = new Date();
      const hours = now.getHours();
      
      const lastMealReminder = localStorage.getItem('lastMealReminder');
      const today = new Date().toISOString().split('T')[0];
      
      const addMealReminder = (id: string, title: string, message: string) => {
        setNotifications(prev => [...prev, { id: `${id}-${today}`, title, message, type: 'info' }]);
        localStorage.setItem('lastMealReminder', `${id}-${today}`);
      };

      // Breakfast reminder at 8:00
      if (hours === 8 && lastMealReminder !== `breakfast-${today}`) {
        addMealReminder('breakfast', 'Breakfast Time', "Time for breakfast! Don't forget to log your meal.");
      }
      // Lunch reminder at 13:00
      else if (hours === 13 && lastMealReminder !== `lunch-${today}`) {
        addMealReminder('lunch', 'Lunch Time', "Time for lunch! Keep your macros balanced.");
      }
      // Dinner reminder at 19:00
      else if (hours === 19 && lastMealReminder !== `dinner-${today}`) {
        addMealReminder('dinner', 'Dinner Time', "Time for dinner! Log your final meal of the day.");
      }
    };

    const interval = setInterval(checkMealTimes, 60000); // Check every minute
    checkMealTimes(); // Check immediately on mount

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleTest = () => {
      setNotifications(prev => [...prev, {
        id: `test-${Date.now()}`,
        title: 'Sample Notification',
        message: 'This is how your meal reminders and health alerts will appear!',
        type: 'info'
      }]);
    };
    
    window.addEventListener('test-notification', handleTest);
    
    // Trigger one immediately on mount for demonstration
    const timer = setTimeout(() => {
      handleTest();
    }, 1000);

    return () => {
      window.removeEventListener('test-notification', handleTest);
      clearTimeout(timer);
    };
  }, []);

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map(note => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md ${
              note.type === 'warning' 
                ? 'bg-red-50/90 border-red-200 text-red-800' 
                : 'bg-white/90 border-gray-200 text-gray-800'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {note.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              ) : (
                <Bell className="w-5 h-5 text-teal-500" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">{note.title}</h4>
              <p className="text-xs opacity-90 mt-0.5">{note.message}</p>
            </div>
            <button 
              onClick={() => dismiss(note.id)}
              className="p-1 hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-4 h-4 opacity-50" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
