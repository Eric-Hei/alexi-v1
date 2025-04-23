import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db.testConnection();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur lors du test de connexion:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors du test de connexion",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}
