import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post("/api/predict", async (req, res) => {
    try {
      const { image } = req.body; // base64 image
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      const hfToken = process.env.HF_TOKEN;
      if (!hfToken) {
        return res.status(500).json({ error: "HF_TOKEN not configured" });
      }

      // Call Hugging Face API using native fetch
      const imageBuffer = Buffer.from(image, 'base64');
      
      let predictions = null;
      let retries = 5;

      while (retries > 0) {
        try {
          const response = await fetch(
            "https://api-inference.huggingface.co/models/Lisongming/food_type_image_detection_new",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${hfToken}`,
                "Content-Type": "application/octet-stream",
              },
              body: imageBuffer,
            }
          );

          const data = await response.json();

          if (response.ok) {
            predictions = data;
            break;
          } else if (response.status === 503 && data.estimated_time) {
            // Model is loading, wait and retry
            const waitTime = Math.min(data.estimated_time * 1000, 10000);
            console.log(`Model is loading. Retrying in ${waitTime / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retries--;
          } else {
            throw new Error(data.error || `Hugging Face API error: ${response.status}`);
          }
        } catch (fetchError: any) {
          if (fetchError.name === 'AbortError' || fetchError.message.includes('stream has been aborted') || fetchError.message.includes('fetch failed')) {
            console.warn(`Fetch failed (${fetchError.message}), retrying...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            retries--;
          } else {
            throw fetchError;
          }
        }
      }

      if (!predictions) {
        return res.status(503).json({ error: "Model is currently loading or unavailable. Please try again." });
      }

      // Top-K logic and normalization
      // The model returns a list of { label, score }
      // Sort and take top 3
      const topK = predictions
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 3);

      res.json({ predictions: topK });
    } catch (error: any) {
      console.error("Prediction error:", error.message || error);
      res.status(500).json({ error: error.message || "Failed to process image" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
