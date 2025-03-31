import { supabase, supabaseAdmin } from "../lib/db";
import {
  Dossier,
  DossierCreate,
  DossierUpdate,
  DossierStatus,
} from "../models/Dossier";
import { Tenant, TenantCreate, TenantUpdate } from "../models/Tenant";
import {
  Landlord,
  LandlordCreate,
  LandlordUpdate,
  LandlordType,
} from "../models/Landlord";
import {
  UnpaidAmount,
  UnpaidAmountCreate,
  UnpaidAmountUpdate,
  UnpaidReason,
} from "../models/UnpaidAmount";
import { StatusTracking } from "../models/StatusTracking";

// Helper function to get current date in ISO format
const getCurrentDate = (): string => {
  return new Date().toISOString();
};

// Helper function to convert snake_case to camelCase
const snakeToCamel = (obj: any): any => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  return Object.keys(obj).reduce((result, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase(),
    );
    result[camelKey] = snakeToCamel(obj[key]);
    return result;
  }, {} as any);
};

// Helper function to convert camelCase to snake_case
const camelToSnake = (obj: any): any => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }

  return Object.keys(obj).reduce((result, key) => {
    const snakeKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`,
    );
    result[snakeKey] = camelToSnake(obj[key]);
    return result;
  }, {} as any);
};

// Create a new dossier
export const createDossier = async (data: DossierCreate): Promise<Dossier> => {
  const now = getCurrentDate();

  // Start a transaction using supabaseAdmin for server-side operations
  const { data: dossierData, error: dossierError } = await supabaseAdmin
    .from("dossiers")
    .insert({
      dossier_number: data.dossierNumber,
      creation_date: data.creationDate,
      status: data.status,
      next_deadline: data.nextDeadline || null,
      next_action: data.nextAction || null,
      additional_notes: data.additionalNotes || null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (dossierError) throw dossierError;

  const dossierId = dossierData.id;

  // Create tenant
  const { data: tenantData, error: tenantError } = await supabaseAdmin
    .from("tenants")
    .insert({
      first_name: data.tenant.firstName,
      last_name: data.tenant.lastName,
      email: data.tenant.email,
      phone: data.tenant.phone,
      address: data.tenant.address,
      city: data.tenant.city,
      postal_code: data.tenant.postalCode,
      dossier_id: dossierId,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (tenantError) throw tenantError;

  // Create landlord
  const { data: landlordData, error: landlordError } = await supabaseAdmin
    .from("landlords")
    .insert({
      type: data.landlord.type,
      name: data.landlord.name,
      email: data.landlord.email,
      phone: data.landlord.phone,
      dossier_id: dossierId,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (landlordError) throw landlordError;

  // Create unpaid amount
  const { data: unpaidData, error: unpaidError } = await supabaseAdmin
    .from("unpaid_amounts")
    .insert({
      amount: data.unpaidAmount.amount,
      months: data.unpaidAmount.months,
      since: data.unpaidAmount.since,
      reason: data.unpaidAmount.reason,
      previous_actions: data.unpaidAmount.previousActions || null,
      dossier_id: dossierId,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (unpaidError) throw unpaidError;

  // Create initial status tracking
  const { data: statusData, error: statusError } = await supabaseAdmin
    .from("status_tracking")
    .insert({
      status: data.status,
      date: now,
      dossier_id: dossierId,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (statusError) throw statusError;

  // Format the tenant data to match the Tenant interface
  const tenant: Tenant = {
    id: tenantData.id,
    firstName: tenantData.first_name,
    lastName: tenantData.last_name,
    email: tenantData.email,
    phone: tenantData.phone,
    address: tenantData.address,
    city: tenantData.city,
    postalCode: tenantData.postal_code,
    dossierId: tenantData.dossier_id,
    createdAt: tenantData.created_at,
    updatedAt: tenantData.updated_at,
  };

  // Format the landlord data to match the Landlord interface
  const landlord: Landlord = {
    id: landlordData.id,
    type: landlordData.type as LandlordType,
    name: landlordData.name,
    email: landlordData.email,
    phone: landlordData.phone,
    dossierId: landlordData.dossier_id,
    createdAt: landlordData.created_at,
    updatedAt: landlordData.updated_at,
  };

  // Format the unpaid amount data to match the UnpaidAmount interface
  const unpaidAmount: UnpaidAmount = {
    id: unpaidData.id,
    amount: unpaidData.amount,
    months: unpaidData.months,
    since: unpaidData.since,
    reason: unpaidData.reason as UnpaidReason,
    previousActions: unpaidData.previous_actions,
    dossierId: unpaidData.dossier_id,
    createdAt: unpaidData.created_at,
    updatedAt: unpaidData.updated_at,
  };

  // Format the status tracking data to match the StatusTracking interface
  const statusTracking: StatusTracking = {
    id: statusData.id,
    status: statusData.status as DossierStatus,
    date: statusData.date,
    dossierId: statusData.dossier_id,
    createdAt: statusData.created_at,
    updatedAt: statusData.updated_at,
  };

  // Construct and return the complete dossier object
  return {
    id: dossierData.id,
    dossierNumber: dossierData.dossier_number,
    creationDate: dossierData.creation_date,
    status: dossierData.status as DossierStatus,
    tenant,
    landlord,
    unpaidAmount,
    statusHistory: [statusTracking],
    nextDeadline: dossierData.next_deadline,
    nextAction: dossierData.next_action,
    additionalNotes: dossierData.additional_notes,
    createdAt: dossierData.created_at,
    updatedAt: dossierData.updated_at,
  };
};

// Get all dossiers
export const getAllDossiers = async (): Promise<Dossier[]> => {
  // Get all dossiers
  const { data: dossiersData, error: dossiersError } = await supabase
    .from("dossiers")
    .select()
    .order("created_at", { ascending: false });

  if (dossiersError) throw dossiersError;
  if (!dossiersData) return [];

  // Get related data for each dossier
  const dossiers = await Promise.all(
    dossiersData.map(async (dossier) => {
      const dossierId = dossier.id;

      // Get tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from("tenants")
        .select()
        .eq("dossier_id", dossierId)
        .single();

      if (tenantError && tenantError.code !== "PGRST116") throw tenantError;

      // Get landlord
      const { data: landlordData, error: landlordError } = await supabase
        .from("landlords")
        .select()
        .eq("dossier_id", dossierId)
        .single();

      if (landlordError && landlordError.code !== "PGRST116")
        throw landlordError;

      // Get unpaid amount
      const { data: unpaidData, error: unpaidError } = await supabase
        .from("unpaid_amounts")
        .select()
        .eq("dossier_id", dossierId)
        .single();

      if (unpaidError && unpaidError.code !== "PGRST116") throw unpaidError;

      // Get status history
      const { data: statusData, error: statusError } = await supabase
        .from("status_tracking")
        .select()
        .eq("dossier_id", dossierId)
        .order("date", { ascending: false });

      if (statusError) throw statusError;

      // Format the tenant data
      const tenant: Tenant | null = tenantData
        ? {
            id: tenantData.id,
            firstName: tenantData.first_name,
            lastName: tenantData.last_name,
            email: tenantData.email,
            phone: tenantData.phone,
            address: tenantData.address,
            city: tenantData.city,
            postalCode: tenantData.postal_code,
            dossierId: tenantData.dossier_id,
            createdAt: tenantData.created_at,
            updatedAt: tenantData.updated_at,
          }
        : null;

      // Format the landlord data
      const landlord: Landlord | null = landlordData
        ? {
            id: landlordData.id,
            type: landlordData.type as LandlordType,
            name: landlordData.name,
            email: landlordData.email,
            phone: landlordData.phone,
            dossierId: landlordData.dossier_id,
            createdAt: landlordData.created_at,
            updatedAt: landlordData.updated_at,
          }
        : null;

      // Format the unpaid amount data
      const unpaidAmount: UnpaidAmount | null = unpaidData
        ? {
            id: unpaidData.id,
            amount: unpaidData.amount,
            months: unpaidData.months,
            since: unpaidData.since,
            reason: unpaidData.reason as UnpaidReason,
            previousActions: unpaidData.previous_actions,
            dossierId: unpaidData.dossier_id,
            createdAt: unpaidData.created_at,
            updatedAt: unpaidData.updated_at,
          }
        : null;

      // Format the status tracking data
      const statusHistory: StatusTracking[] = statusData
        ? statusData.map((status) => ({
            id: status.id,
            status: status.status as DossierStatus,
            date: status.date,
            dossierId: status.dossier_id,
            createdAt: status.created_at,
            updatedAt: status.updated_at,
          }))
        : [];

      // Skip dossiers with missing related data
      if (!tenant || !landlord || !unpaidAmount) {
        console.warn(`Dossier ${dossierId} has missing related data`);
        return null;
      }

      // Return the complete dossier object
      return {
        id: dossier.id,
        dossierNumber: dossier.dossier_number,
        creationDate: dossier.creation_date,
        status: dossier.status as DossierStatus,
        tenant,
        landlord,
        unpaidAmount,
        statusHistory,
        nextDeadline: dossier.next_deadline,
        nextAction: dossier.next_action,
        additionalNotes: dossier.additional_notes,
        createdAt: dossier.created_at,
        updatedAt: dossier.updated_at,
      };
    }),
  );

  // Filter out null values (dossiers with missing related data)
  return dossiers.filter((dossier): dossier is Dossier => dossier !== null);
};

// Get a dossier by ID
export const getDossierById = async (id: string): Promise<Dossier | null> => {
  // Get the dossier
  const { data: dossierData, error: dossierError } = await supabase
    .from("dossiers")
    .select()
    .eq("id", id)
    .single();

  if (dossierError) {
    if (dossierError.code === "PGRST116") return null; // Not found
    throw dossierError;
  }

  // Get tenant
  const { data: tenantData, error: tenantError } = await supabase
    .from("tenants")
    .select()
    .eq("dossier_id", id)
    .single();

  if (tenantError && tenantError.code !== "PGRST116") throw tenantError;

  // Get landlord
  const { data: landlordData, error: landlordError } = await supabase
    .from("landlords")
    .select()
    .eq("dossier_id", id)
    .single();

  if (landlordError && landlordError.code !== "PGRST116") throw landlordError;

  // Get unpaid amount
  const { data: unpaidData, error: unpaidError } = await supabase
    .from("unpaid_amounts")
    .select()
    .eq("dossier_id", id)
    .single();

  if (unpaidError && unpaidError.code !== "PGRST116") throw unpaidError;

  // Get status history
  const { data: statusData, error: statusError } = await supabase
    .from("status_tracking")
    .select()
    .eq("dossier_id", id)
    .order("date", { ascending: false });

  if (statusError) throw statusError;

  // If any required related data is missing, return null
  if (!tenantData || !landlordData || !unpaidData) {
    console.warn(`Dossier ${id} has missing related data`);
    return null;
  }

  // Format the tenant data
  const tenant: Tenant = {
    id: tenantData.id,
    firstName: tenantData.first_name,
    lastName: tenantData.last_name,
    email: tenantData.email,
    phone: tenantData.phone,
    address: tenantData.address,
    city: tenantData.city,
    postalCode: tenantData.postal_code,
    dossierId: tenantData.dossier_id,
    createdAt: tenantData.created_at,
    updatedAt: tenantData.updated_at,
  };

  // Format the landlord data
  const landlord: Landlord = {
    id: landlordData.id,
    type: landlordData.type as LandlordType,
    name: landlordData.name,
    email: landlordData.email,
    phone: landlordData.phone,
    dossierId: landlordData.dossier_id,
    createdAt: landlordData.created_at,
    updatedAt: landlordData.updated_at,
  };

  // Format the unpaid amount data
  const unpaidAmount: UnpaidAmount = {
    id: unpaidData.id,
    amount: unpaidData.amount,
    months: unpaidData.months,
    since: unpaidData.since,
    reason: unpaidData.reason as UnpaidReason,
    previousActions: unpaidData.previous_actions,
    dossierId: unpaidData.dossier_id,
    createdAt: unpaidData.created_at,
    updatedAt: unpaidData.updated_at,
  };

  // Format the status tracking data
  const statusHistory: StatusTracking[] = statusData
    ? statusData.map((status) => ({
        id: status.id,
        status: status.status as DossierStatus,
        date: status.date,
        dossierId: status.dossier_id,
        createdAt: status.created_at,
        updatedAt: status.updated_at,
      }))
    : [];

  // Return the complete dossier object
  return {
    id: dossierData.id,
    dossierNumber: dossierData.dossier_number,
    creationDate: dossierData.creation_date,
    status: dossierData.status as DossierStatus,
    tenant,
    landlord,
    unpaidAmount,
    statusHistory,
    nextDeadline: dossierData.next_deadline,
    nextAction: dossierData.next_action,
    additionalNotes: dossierData.additional_notes,
    createdAt: dossierData.created_at,
    updatedAt: dossierData.updated_at,
  };
};

// Update a dossier
export const updateDossier = async (
  id: string,
  data: DossierUpdate,
): Promise<Dossier | null> => {
  const now = getCurrentDate();

  // Get the existing dossier to make sure it exists
  const existingDossier = await getDossierById(id);
  if (!existingDossier) return null;

  // Update dossier
  if (
    data.status ||
    data.nextDeadline !== undefined ||
    data.nextAction !== undefined ||
    data.additionalNotes !== undefined
  ) {
    const { error: dossierError } = await supabaseAdmin
      .from("dossiers")
      .update({
        status: data.status || undefined,
        next_deadline:
          data.nextDeadline !== undefined ? data.nextDeadline : undefined,
        next_action:
          data.nextAction !== undefined ? data.nextAction : undefined,
        additional_notes:
          data.additionalNotes !== undefined ? data.additionalNotes : undefined,
        updated_at: now,
      })
      .eq("id", id);

    if (dossierError) throw dossierError;
  }

  // Update tenant if provided
  if (data.tenant) {
    const { error: tenantError } = await supabaseAdmin
      .from("tenants")
      .update({
        first_name: data.tenant.firstName,
        last_name: data.tenant.lastName,
        email: data.tenant.email,
        phone: data.tenant.phone,
        address: data.tenant.address,
        city: data.tenant.city,
        postal_code: data.tenant.postalCode,
        updated_at: now,
      })
      .eq("dossier_id", id);

    if (tenantError) throw tenantError;
  }

  // Update landlord if provided
  if (data.landlord) {
    const { error: landlordError } = await supabaseAdmin
      .from("landlords")
      .update({
        type: data.landlord.type,
        name: data.landlord.name,
        email: data.landlord.email,
        phone: data.landlord.phone,
        updated_at: now,
      })
      .eq("dossier_id", id);

    if (landlordError) throw landlordError;
  }

  // Update unpaid amount if provided
  if (data.unpaidAmount) {
    const { error: unpaidError } = await supabaseAdmin
      .from("unpaid_amounts")
      .update({
        amount: data.unpaidAmount.amount,
        months: data.unpaidAmount.months,
        since: data.unpaidAmount.since,
        reason: data.unpaidAmount.reason,
        previous_actions: data.unpaidAmount.previousActions,
        updated_at: now,
      })
      .eq("dossier_id", id);

    if (unpaidError) throw unpaidError;
  }

  // Add new status tracking entry if status changed
  if (data.status && data.status !== existingDossier.status) {
    const { error: statusError } = await supabaseAdmin
      .from("status_tracking")
      .insert({
        status: data.status,
        date: now,
        dossier_id: id,
        created_at: now,
        updated_at: now,
      });

    if (statusError) throw statusError;
  }

  // Get the updated dossier
  return getDossierById(id);
};

// Delete a dossier
export const deleteDossier = async (id: string): Promise<boolean> => {
  // Check if the dossier exists
  const existingDossier = await getDossierById(id);
  if (!existingDossier) return false;

  // Delete the dossier (related records will be deleted via CASCADE)
  const { error } = await supabaseAdmin.from("dossiers").delete().eq("id", id);

  if (error) throw error;

  return true;
};
