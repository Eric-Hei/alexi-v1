import { NextRequest, NextResponse } from "next/server";
import {
  createDossier,
  getAllDossiers,
  getDossierById,
  updateDossier,
  deleteDossier,
} from "@/services/dossierService";
import { DossierCreate, DossierUpdate } from "@/models/Dossier";

// GET all dossiers
export async function GET() {
  try {
    const dossiers = await getAllDossiers();
    return NextResponse.json(dossiers);
  } catch (error) {
    console.error("Error fetching dossiers:", error);
    return NextResponse.json(
      { error: "Failed to fetch dossiers" },
      { status: 500 },
    );
  }
}

// POST create a new dossier
export async function POST(request: NextRequest) {
  try {
    const data: DossierCreate = await request.json();
    const dossier = await createDossier(data);
    return NextResponse.json(dossier, { status: 201 });
  } catch (error) {
    console.error("Error creating dossier:", error);
    return NextResponse.json(
      { error: "Failed to create dossier" },
      { status: 500 },
    );
  }
}
