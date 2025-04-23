"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function DatabaseConnectionTest() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const [details, setDetails] = useState<any>(null);

  const testConnection = async () => {
    try {
      setStatus("loading");
      setMessage("Test de connexion en cours...");

      const response = await fetch("/api/test-db-connection");
      const result = await response.json();

      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
      }

      setMessage(result.message);
      setDetails(result.details);
    } catch (error) {
      setStatus("error");
      setMessage("Erreur lors du test de connexion");
      setDetails(error instanceof Error ? error.message : "Erreur inconnue");
    }
  };

  useEffect(() => {
    // Test connection on component mount
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto bg-white">
      <CardHeader>
        <CardTitle>Test de connexion à la base de données</CardTitle>
        <CardDescription>
          Vérification de la connexion à Supabase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 p-4 rounded-lg border">
          {status === "loading" && (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
              <span>Test en cours...</span>
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>{message}</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{message}</span>
              </div>
              {details && (
                <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-800 overflow-auto max-h-32">
                  <pre>{JSON.stringify(details, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={testConnection}
          disabled={status === "loading"}
          className="w-full"
        >
          {status === "loading" ? "Test en cours..." : "Tester à nouveau"}
        </Button>
      </CardFooter>
    </Card>
  );
}
