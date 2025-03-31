"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import DossiersList from "./DossiersList";
import AlertsSection from "./AlertsSection";
import { Card } from "../ui/card";

interface DashboardContentProps {
  userType?: "bailleur" | "service_social" | "administration";
  onViewDossier?: (id: string) => void;
  onCreateDossier?: () => void;
  onAlertAction?: (
    alertId: string,
    action: "ignore" | "contact" | "create",
  ) => void;
}

const DashboardContent = ({
  userType = "bailleur",
  onViewDossier = () => {},
  onCreateDossier = () => {},
  onAlertAction = () => {},
}: DashboardContentProps) => {
  const [activeTab, setActiveTab] = useState("dossiers");

  return (
    <div className="w-full h-full p-6 bg-gray-50">
      <Tabs
        defaultValue="dossiers"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="dossiers">Dossiers d'expulsion</TabsTrigger>
          <TabsTrigger value="alertes">Alertes préventives</TabsTrigger>
          <TabsTrigger value="statistiques">Statistiques</TabsTrigger>
          {userType === "administration" && (
            <TabsTrigger value="rapports">Rapports</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="dossiers" className="space-y-6">
          <DossiersList
            onViewDossier={onViewDossier}
            onCreateDossier={onCreateDossier}
          />
        </TabsContent>

        <TabsContent value="alertes" className="space-y-6">
          <AlertsSection onAlertAction={onAlertAction} />
        </TabsContent>

        <TabsContent value="statistiques" className="space-y-6">
          <Card className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Dossiers actifs"
                value="124"
                change="+12%"
                trend="up"
              />
              <StatCard
                title="Expulsions évitées"
                value="78"
                change="+23%"
                trend="up"
              />
              <StatCard
                title="Délai moyen de résolution"
                value="45 jours"
                change="-8%"
                trend="down"
              />
              <StatCard
                title="Taux de médiation réussie"
                value="68%"
                change="+5%"
                trend="up"
              />
              <StatCard
                title="Montant moyen des impayés"
                value="3 450 €"
                change="+2%"
                trend="up"
              />
              <StatCard
                title="Alertes préventives"
                value="32"
                change="-15%"
                trend="down"
              />
            </div>
          </Card>
        </TabsContent>

        {userType === "administration" && (
          <TabsContent value="rapports" className="space-y-6">
            <Card className="p-6 bg-white">
              <h3 className="text-xl font-semibold mb-4">
                Rapports administratifs
              </h3>
              <div className="space-y-4">
                <ReportItem
                  title="Rapport trimestriel CCAPEX"
                  date="15/04/2023"
                  status="disponible"
                />
                <ReportItem
                  title="Statistiques départementales"
                  date="01/04/2023"
                  status="disponible"
                />
                <ReportItem
                  title="Bilan annuel des expulsions"
                  date="31/12/2022"
                  status="disponible"
                />
                <ReportItem
                  title="Rapport d'efficacité des mesures préventives"
                  date="15/06/2023"
                  status="en_attente"
                />
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

const StatCard = ({
  title = "Statistique",
  value = "0",
  change = "0%",
  trend = "up",
}: StatCardProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold">{value}</p>
        <p
          className={`ml-2 text-sm font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}
        >
          {change}
        </p>
      </div>
    </div>
  );
};

interface ReportItemProps {
  title: string;
  date: string;
  status: "disponible" | "en_attente";
}

const ReportItem = ({
  title = "Rapport",
  date = "01/01/2023",
  status = "disponible",
}: ReportItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-md">
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-gray-500">Date: {date}</p>
      </div>
      <div className="flex items-center">
        <span
          className={`inline-block w-2 h-2 rounded-full mr-2 ${status === "disponible" ? "bg-green-500" : "bg-amber-500"}`}
        ></span>
        <span className="text-sm">
          {status === "disponible" ? "Disponible" : "En attente"}
        </span>
        {status === "disponible" && (
          <button className="ml-4 text-sm text-blue-600 hover:text-blue-800">
            Télécharger
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
