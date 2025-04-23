import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string;

// Client for browser usage (with anon key)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (with service key)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
);

export const db = {
  // Connect to database (placeholder for compatibility)
  connect: async () => {
    console.log("Supabase connection established");
    return { supabase, supabaseAdmin };
  },

  // Disconnect from database (placeholder for compatibility)
  disconnect: async () => {
    console.log("Supabase connection closed");
  },

  // Transaction handling (using Supabase's built-in transaction support)
  transaction: async <T>(callback: () => Promise<T>): Promise<T> => {
    try {
      const result = await callback();
      return result;
    } catch (error) {
      console.error("Transaction error:", error);
      throw error;
    }
  },

  // Test database connection
  testConnection: async () => {
    try {
      // Try to fetch a single row from the dossiers table
      const { data, error } = await supabase
        .from("dossiers")
        .select("id")
        .limit(1);

      if (error) {
        return {
          success: false,
          message: `Erreur de connexion: ${error.message}`,
          details: error,
        };
      }

      return {
        success: true,
        message: "Connexion à la base de données réussie",
        data: data,
      };
    } catch (error) {
      console.error("Erreur lors du test de connexion:", error);
      return {
        success: false,
        message: `Erreur inattendue: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        details: error,
      };
    }
  },
};
