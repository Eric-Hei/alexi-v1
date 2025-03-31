import { useState, useEffect } from "react";
import { Dossier, DossierUpdate } from "@/models/Dossier";

export function useDossier(dossierId?: string) {
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dossierId) return;

    const fetchDossier = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if dossierId is a valid UUID format
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            dossierId,
          );

        // If it's not a UUID, try to fetch by dossier number instead
        const endpoint = isUUID
          ? `/api/dossiers/${dossierId}`
          : `/api/dossiers?dossierNumber=${dossierId}`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("Failed to fetch dossier");
        }

        const data = await response.json();
        // If we queried by dossier number, we might get an array, so take the first item
        setDossier(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        console.error("Error fetching dossier:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDossier();
  }, [dossierId]);

  const updateDossier = async (updates: DossierUpdate) => {
    if (!dossierId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dossiers/${dossierId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update dossier");
      }

      const updatedDossier = await response.json();
      setDossier(updatedDossier);
      return updatedDossier;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      console.error("Error updating dossier:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteDossier = async () => {
    if (!dossierId) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dossiers/${dossierId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete dossier");
      }

      setDossier(null);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      console.error("Error deleting dossier:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    dossier,
    loading,
    error,
    updateDossier,
    deleteDossier,
  };
}

export function useDossiers() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDossiers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dossiers");

      if (!response.ok) {
        throw new Error("Failed to fetch dossiers");
      }

      const data = await response.json();
      setDossiers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      console.error("Error fetching dossiers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossiers();
  }, []);

  return {
    dossiers,
    loading,
    error,
    refetch: fetchDossiers,
  };
}
