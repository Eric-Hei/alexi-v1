import { NextRequest, NextResponse } from "next/server";
import {
  getDossierById,
  updateDossier,
  deleteDossier,
} from "@/services/dossierService";
import { DossierUpdate } from "@/models/Dossier";

// GET a dossier by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const dossier = await getDossierById(params.id);

    if (!dossier) {
      return NextResponse.json({ error: "Dossier not found" }, { status: 404 });
    }

    return NextResponse.json(dossier);
  } catch (error) {
    console.error(`Error fetching dossier ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch dossier" },
      { status: 500 },
    );
  }
}

// PATCH update a dossier
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const data: DossierUpdate = await request.json();
    const updatedDossier = await updateDossier(params.id, data);

    if (!updatedDossier) {
      return NextResponse.json({ error: "Dossier not found" }, { status: 404 });
    }

    return NextResponse.json(updatedDossier);
  } catch (error) {
    console.error(`Error updating dossier ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update dossier" },
      { status: 500 },
    );
  }
}

// DELETE a dossier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const success = await deleteDossier(params.id);

    if (!success) {
      return NextResponse.json({ error: "Dossier not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Dossier deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Error deleting dossier ${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete dossier" },
      { status: 500 },
    );
  }
}
