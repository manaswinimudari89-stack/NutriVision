import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Camera, Loader2, CheckCircle2, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { auth, db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { GoogleGenAI, Type } from '@google/genai';

interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface AnalysisResult {
  isFood: boolean;
  foodName: string;
  confidence: number;
  nutrition: Nutrition;
  otherPossibilities: string[];
  detectionDetails: string;
}

export default function FoodRecognition() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
        setSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image || !file) return;
    setLoading(true);
    setError(null);
    try {
      const base64Image = image.split(',')[1];
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [
          {
            inlineData: {
              data: base64Image,
              mimeType: file.type,
            }
          },
          "Analyze this image. First, determine if it contains food. If it does not contain food, set 'isFood' to false and explain why in 'detectionDetails'. If it is food, set 'isFood' to true, identify the main dish, and provide its estimated nutritional value per standard serving. Return a JSON object with 'isFood' (boolean), 'foodName', 'confidence' (0-1), 'calories', 'protein' (g), 'carbs' (g), and 'fats' (g). Also provide a list of 'otherPossibilities' (strings) and 'detectionDetails' (string explaining what was detected)."
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isFood: { type: Type.BOOLEAN },
              foodName: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER },
              otherPossibilities: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              detectionDetails: { type: Type.STRING }
            },
            required: ["isFood", "foodName", "confidence", "calories", "protein", "carbs", "fats", "otherPossibilities", "detectionDetails"]
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setResult({
          isFood: data.isFood,
          foodName: data.foodName,
          confidence: data.confidence,
          nutrition: {
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fats: data.fats
          },
          otherPossibilities: data.otherPossibilities,
          detectionDetails: data.detectionDetails
        });
      } else {
        throw new Error("No response from AI");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveMeal = async () => {
    if (!auth.currentUser || !result || !file) return;
    setLoading(true);
    try {
      // Upload image to storage
      const storageRef = ref(storage, `meals/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      // Save to firestore
      await addDoc(collection(db, `users/${auth.currentUser.uid}/meals`), {
        userId: auth.currentUser.uid,
        foodName: result.foodName,
        calories: result.nutrition.calories,
        protein: result.nutrition.protein,
        carbs: result.nutrition.carbs,
        fats: result.nutrition.fats,
        confidence: result.confidence,
        imageUrl,
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp()
      });
      setSaved(true);
    } catch (err) {
      setError("Failed to save meal log.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Analyze Your Meal</h2>
            <p className="text-gray-500">Upload a photo of your food to get instant nutritional insights.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Upload Section */}
            <div className="space-y-6">
              <div
                className={cn(
                  "relative aspect-square rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden",
                  image ? "border-black/10 bg-gray-50" : "border-gray-200 hover:border-black/20 hover:bg-gray-50"
                )}
              >
                {image ? (
                  <>
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImage(null)}
                      className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <AlertCircle className="w-5 h-5 text-gray-600" />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-black/40" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Click to upload or drag & drop</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              <button
                onClick={analyzeImage}
                disabled={!image || loading}
                className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                Analyze Image
              </button>
            </div>

            {/* Results Section */}
            <div className="space-y-8">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {!result.isFood ? (
                      <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertCircle className="w-6 h-6 text-red-500" />
                          <h3 className="text-xl font-bold text-red-900">No Food Detected</h3>
                        </div>
                        <p className="text-red-700">{result.detectionDetails}</p>
                      </div>
                    ) : (
                      <>
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 capitalize">{result.foodName}</h3>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                              {Math.round(result.confidence * 100)}% Confidence
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-6">{result.detectionDetails}</p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Calories</span>
                              <p className="text-2xl font-bold text-gray-900">{result.nutrition.calories} kcal</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Protein</span>
                              <p className="text-2xl font-bold text-gray-900">{result.nutrition.protein}g</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Carbs</span>
                              <p className="text-2xl font-bold text-gray-900">{result.nutrition.carbs}g</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Fats</span>
                              <p className="text-2xl font-bold text-gray-900">{result.nutrition.fats}g</p>
                            </div>
                          </div>
                        </div>

                        {result.otherPossibilities.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Other Possibilities</h4>
                            {result.otherPossibilities.map((res, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                                <span className="text-sm font-medium text-gray-700 capitalize">{res}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={saveMeal}
                          disabled={loading || saved}
                          className={cn(
                            "w-full py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                            saved 
                              ? "bg-green-50 text-green-700 border border-green-100 cursor-default"
                              : "bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10"
                          )}
                        >
                          {saved ? (
                            <>
                              <CheckCircle2 className="w-5 h-5" />
                              Meal Logged Successfully
                            </>
                          ) : (
                            <>
                              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                              Log This Meal
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <Info className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-medium">Results will appear here after analysis</p>
                  </div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
