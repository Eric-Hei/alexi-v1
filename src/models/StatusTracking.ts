import { DossierStatus } from "./Dossier";

export interface StatusTracking {
  id: string;
  status: DossierStatus;
  date: string;
  notes?: string;
  dossierId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusTrackingCreate {
  status: DossierStatus;
  date: string;
  notes?: string;
  dossierId: string;
}

export interface StatusTrackingUpdate {
  notes?: string;
}
