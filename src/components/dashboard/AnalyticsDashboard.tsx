"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useDossiers } from "@/hooks/useDossier";
import { DossierStatus } from "@/models/Dossier";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down" | "neutral";
  change?: string;
}

const AnalyticsCard = ({
  title,
  value,
  description,
  trend = "neutral",
  change,
}: AnalyticsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline">
          <p className="text-2xl font-semibold">{value}</p>
          {change && (
            <p
              className={`ml-2 text-sm font-medium ${
                trend === "up"
                  ? "text-green-600"
                  : trend === "down"
                    ? "text-red-600"
                    : "text-gray-500"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard = ({ className }: AnalyticsDashboardProps) => {
  const { dossiers, loading, error } = useDossiers();
  const [analytics, setAnalytics] = useState({
    totalDossiers: 0,
    activeCount: 0,
    resolvedCount: 0,
    resolutionRate: 0,
    avgProcessingDays: 0,
    statusDistribution: {} as Record<DossierStatus, number>,
  });

  useEffect(() => {
    if (dossiers.length > 0) {
      // Calculate analytics from dossiers data
      const total = dossiers.length;
      const active = dossiers.filter(
        (d) => d.status !== "resolu" && d.status !== "expulsion_programmee",
      ).length;
      const resolved = dossiers.filter((d) => d.status === "resolu").length;

      // Calculate status distribution
      const distribution = dossiers.reduce(
        (acc, dossier) => {
          acc[dossier.status] = (acc[dossier.status] || 0) + 1;
          return acc;
        },
        {} as Record<DossierStatus, number>,
      );

      // Calculate average processing time (in days) for resolved dossiers
      let totalDays = 0;
      let resolvedWithDates = 0;

      dossiers.forEach((dossier) => {
        if (dossier.status === "resolu" && dossier.creationDate) {
          const creationDate = new Date(dossier.creationDate);
          const resolutionDate = new Date(dossier.updatedAt);
          const days = Math.floor(
            (resolutionDate.getTime() - creationDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );

          if (!isNaN(days)) {
            totalDays += days;
            resolvedWithDates++;
          }
        }
      });

      const avgDays =
        resolvedWithDates > 0 ? Math.round(totalDays / resolvedWithDates) : 0;

      setAnalytics({
        totalDossiers: total,
        activeCount: active,
        resolvedCount: resolved,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
        avgProcessingDays: avgDays,
        statusDistribution: distribution,
      });
    }
  }, [dossiers]);

  if (loading) {
    return <div className="p-4">Chargement des données analytiques...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Erreur: {error}</div>;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnalyticsCard
          title="Dossiers actifs"
          value={analytics.activeCount}
          description="Dossiers en cours de traitement"
        />
        <AnalyticsCard
          title="Dossiers résolus"
          value={analytics.resolvedCount}
          description="Dossiers avec statut résolu"
        />
        <AnalyticsCard
          title="Taux de résolution"
          value={`${analytics.resolutionRate}%`}
          description="Pourcentage de dossiers résolus"
          trend={analytics.resolutionRate > 50 ? "up" : "down"}
        />
        <AnalyticsCard
          title="Temps moyen de traitement"
          value={`${analytics.avgProcessingDays} jours`}
          description="Pour les dossiers résolus"
        />
        <AnalyticsCard
          title="Total des dossiers"
          value={analytics.totalDossiers}
          description="Nombre total de dossiers"
        />
        <AnalyticsCard
          title="Dossiers en procédure judiciaire"
          value={analytics.statusDistribution["procedure_judiciaire"] || 0}
          description="Dossiers en phase judiciaire"
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
