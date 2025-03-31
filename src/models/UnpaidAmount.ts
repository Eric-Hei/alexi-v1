export type UnpaidReason =
  | "unemployment"
  | "health"
  | "separation"
  | "financial"
  | "other";

export interface UnpaidAmount {
  id: string;
  amount: number;
  months: number;
  since: string;
  reason: UnpaidReason;
  previousActions?: string;
  dossierId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnpaidAmountCreate {
  amount: number;
  months: number;
  since: string;
  reason: UnpaidReason;
  previousActions?: string;
  dossierId: string;
}

export interface UnpaidAmountUpdate {
  amount?: number;
  months?: number;
  since?: string;
  reason?: UnpaidReason;
  previousActions?: string;
}
