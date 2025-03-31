import { Tenant } from "./Tenant";
import { Landlord } from "./Landlord";
import { UnpaidAmount } from "./UnpaidAmount";
import { StatusTracking } from "./StatusTracking";

export type DossierStatus =
  | "en_attente"
  | "en_cours"
  | "procedure_judiciaire"
  | "plan_apurement"
  | "resolu"
  | "expulsion_programmee";

export interface Dossier {
  id: string;
  dossierNumber: string;
  creationDate: string;
  status: DossierStatus;
  tenant: Tenant;
  landlord: Landlord;
  unpaidAmount: UnpaidAmount;
  statusHistory: StatusTracking[];
  nextDeadline?: string;
  nextAction?: string;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DossierCreate {
  dossierNumber: string;
  creationDate: string;
  status: DossierStatus;
  tenant: Omit<Tenant, "id">;
  landlord: Omit<Landlord, "id">;
  unpaidAmount: Omit<UnpaidAmount, "id">;
  nextDeadline?: string;
  nextAction?: string;
  additionalNotes?: string;
}

export interface DossierUpdate {
  status?: DossierStatus;
  tenant?: Partial<Tenant>;
  landlord?: Partial<Landlord>;
  unpaidAmount?: Partial<UnpaidAmount>;
  nextDeadline?: string;
  nextAction?: string;
  additionalNotes?: string;
}
