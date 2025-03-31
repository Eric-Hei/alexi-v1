export type LandlordType = "private" | "social" | "company";

export interface Landlord {
  id: string;
  type: LandlordType;
  name: string;
  email: string;
  phone: string;
  dossierId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LandlordCreate {
  type: LandlordType;
  name: string;
  email: string;
  phone: string;
  dossierId: string;
}

export interface LandlordUpdate {
  type?: LandlordType;
  name?: string;
  email?: string;
  phone?: string;
}
