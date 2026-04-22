import mongoose from "mongoose";

let isConnected = false;
let connectionPromise: Promise<void> | null = null;

const MONGODB_TIMEOUT = 5000; // 5 segundos timeout

export async function connectDB() {
  if (isConnected) {
    return;
  }

  // Reutilizar conexión en progreso
  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI no configurado");
  }

  connectionPromise = (async () => {
    try {
      await Promise.race([
        mongoose.connect(mongoUri),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("MongoDB timeout")), MONGODB_TIMEOUT)
        ),
      ]);
      isConnected = true;
      console.log("✓ MongoDB conectado");
    } catch (error) {
      connectionPromise = null;
      console.error("✗ MongoDB no disponible", error instanceof Error ? error.message : "Error desconocido");
      throw error;
    }
  })();

  return connectionPromise;
}

export function isDBConnected() {
  return isConnected;
}
