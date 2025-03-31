"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle,
  X,
  MessageSquare,
  FileText,
} from "lucide-react";

interface Alert {
  id: string;
  type: "impaye" | "echeance" | "procedure";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  date: string;
  locataire: string;
  adresse: string;
  dossier_id: string;
}

interface AlertsSectionProps {
  alerts?: Alert[];
  onAlertAction?: (
    alertId: string,
    action: "ignore" | "contact" | "create",
  ) => void;
}

const AlertsSection = ({
  alerts = [
    {
      id: "alert-1",
      type: "impaye",
      severity: "high",
      title: "Impayés répétés",
      description: "3 mois consécutifs d'impayés détectés",
      date: "2023-05-15",
      locataire: "Martin Dupont",
      adresse: "15 rue des Lilas, 75020 Paris",
      dossier_id: "DOS-2023-1542",
    },
    {
      id: "alert-2",
      type: "echeance",
      severity: "medium",
      title: "Échéance approchante",
      description: "Audience prévue dans 7 jours",
      date: "2023-05-20",
      locataire: "Sophie Moreau",
      adresse: "8 avenue Victor Hugo, 69003 Lyon",
      dossier_id: "DOS-2023-1356",
    },
    {
      id: "alert-3",
      type: "procedure",
      severity: "low",
      title: "Document manquant",
      description: "Diagnostic social non fourni",
      date: "2023-05-10",
      locataire: "Jean Leroy",
      adresse: "22 boulevard Gambetta, 33000 Bordeaux",
      dossier_id: "DOS-2023-1128",
    },
  ],
  onAlertAction = (alertId, action) =>
    console.log(`Action ${action} sur alerte ${alertId}`),
}: AlertsSectionProps) => {
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(alerts);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filterAlerts = (filter: string) => {
    setActiveFilter(filter);
    if (filter === "all") {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(
        alerts.filter((alert) =>
          filter === "high"
            ? alert.severity === "high"
            : filter === "medium"
              ? alert.severity === "medium"
              : filter === "low"
                ? alert.severity === "low"
                : alert.type === filter,
        ),
      );
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "impaye":
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      case "echeance":
        return <Clock className="h-4 w-4 mr-1" />;
      case "procedure":
        return <FileText className="h-4 w-4 mr-1" />;
      default:
        return <Bell className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold">
              Alertes Préventives
            </CardTitle>
            <CardDescription>
              Situations à risque nécessitant une attention
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={activeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => filterAlerts("all")}
            >
              Toutes
            </Button>
            <Button
              variant={activeFilter === "high" ? "destructive" : "outline"}
              size="sm"
              onClick={() => filterAlerts("high")}
            >
              Urgentes
            </Button>
            <Button
              variant={activeFilter === "impaye" ? "default" : "outline"}
              size="sm"
              onClick={() => filterAlerts("impaye")}
            >
              Impayés
            </Button>
            <Button
              variant={activeFilter === "echeance" ? "default" : "outline"}
              size="sm"
              onClick={() => filterAlerts("echeance")}
            >
              Échéances
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune alerte correspondant aux critères sélectionnés
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="border rounded-lg p-4 bg-background"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">{getTypeIcon(alert.type)}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity === "high"
                            ? "Urgent"
                            : alert.severity === "medium"
                              ? "Important"
                              : "Information"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.description}
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        <p>
                          <span className="font-medium">Locataire:</span>{" "}
                          {alert.locataire}
                        </p>
                        <p>
                          <span className="font-medium">Adresse:</span>{" "}
                          {alert.adresse}
                        </p>
                        <p>
                          <span className="font-medium">Dossier:</span>{" "}
                          {alert.dossier_id}
                        </p>
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {new Date(alert.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAlertAction(alert.id, "ignore")}
                      title="Ignorer l'alerte"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAlertAction(alert.id, "contact")}
                      title="Contacter le locataire"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onAlertAction(alert.id, "create")}
                      title="Créer un dossier"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredAlerts.length} alerte{filteredAlerts.length !== 1 ? "s" : ""}{" "}
          affichée{filteredAlerts.length !== 1 ? "s" : ""}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => console.log("Configurer les seuils d'alerte")}
        >
          Configurer les seuils d'alerte
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AlertsSection;
