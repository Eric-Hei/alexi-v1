export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      dossiers: {
        Row: {
          id: string;
          dossier_number: string;
          creation_date: string;
          status: string;
          next_deadline: string | null;
          next_action: string | null;
          additional_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dossier_number: string;
          creation_date: string;
          status: string;
          next_deadline?: string | null;
          next_action?: string | null;
          additional_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dossier_number?: string;
          creation_date?: string;
          status?: string;
          next_deadline?: string | null;
          next_action?: string | null;
          additional_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tenants: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          address: string;
          city: string;
          postal_code: string;
          dossier_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          address: string;
          city: string;
          postal_code: string;
          dossier_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          address?: string;
          city?: string;
          postal_code?: string;
          dossier_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      landlords: {
        Row: {
          id: string;
          type: string;
          name: string;
          email: string;
          phone: string;
          dossier_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          name: string;
          email: string;
          phone: string;
          dossier_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          name?: string;
          email?: string;
          phone?: string;
          dossier_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      unpaid_amounts: {
        Row: {
          id: string;
          amount: number;
          months: number;
          since: string;
          reason: string;
          previous_actions: string | null;
          dossier_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          amount: number;
          months: number;
          since: string;
          reason: string;
          previous_actions?: string | null;
          dossier_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          amount?: number;
          months?: number;
          since?: string;
          reason?: string;
          previous_actions?: string | null;
          dossier_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      status_tracking: {
        Row: {
          id: string;
          status: string;
          date: string;
          dossier_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          status: string;
          date: string;
          dossier_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          status?: string;
          date?: string;
          dossier_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
