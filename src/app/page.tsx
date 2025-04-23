"use client";

import React, { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import UserTypeSelector from "@/components/dashboard/UserTypeSelector";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DossierDetail from "@/components/dossiers/DossierDetail";
import NewDossierForm from "@/components/dossiers/NewDossierForm";

type UserType = "bailleur" | "service-social" | "administration";

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userType, setUserType] = useState<UserType>("bailleur");
  const [currentView, setCurrentView] = useState<
    "dashboard" | "dossier-detail" | "new-dossier"
  >("dashboard");
  const [selectedDossierId, setSelectedDossierId] = useState<string | null>(
    null,
  );

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
  };

  const handleViewDossier = (id: string) => {
    console.log("Viewing dossier with ID:", id);
    setSelectedDossierId(id);
    setCurrentView("dossier-detail");
  };

  const handleCreateDossier = () => {
    setCurrentView("new-dossier");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedDossierId(null);
  };

  const handleAlertAction = (
    alertId: string,
    action: "ignore" | "contact" | "create",
  ) => {
    if (action === "create") {
      handleCreateDossier();
    }
    // Other actions would be implemented here
  };

  React.useEffect(() => {
    const handleNavItemClicked = (event: CustomEvent) => {
      const { view } = event.detail;

      if (
        view === "dashboard" ||
        view === "dossiers" ||
        view === "alertes" ||
        view === "communications" ||
        view === "calendrier" ||
        view === "statistiques" ||
        view === "intervenants" ||
        view === "parametres"
      ) {
        // For now, just go back to dashboard for all views except 'new-dossier'
        setCurrentView("dashboard");
      }
    };

    const handleCreateDossier = () => {
      setCurrentView("new-dossier");
    };

    window.addEventListener("nav-item-clicked", handleNavItemClicked);
    window.addEventListener("create-dossier", handleCreateDossier);

    return () => {
      window.removeEventListener("nav-item-clicked", handleNavItemClicked);
      window.removeEventListener("create-dossier", handleCreateDossier);
    };
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background">
      <DashboardHeader
        onMenuToggle={handleSidebarToggle}
        title="Plateforme de Gestion des Expulsions Locatives"
      />

      <UserTypeSelector
        selectedType={userType}
        onTypeChange={handleUserTypeChange}
      />

      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleSidebarToggle}
        />

        <main className="flex-1 overflow-y-auto">
          {currentView === "dashboard" && (
            <DashboardContent
              userType={
                userType === "service-social" ? "service_social" : userType
              }
              onViewDossier={handleViewDossier}
              onCreateDossier={handleCreateDossier}
              onAlertAction={handleAlertAction}
            />
          )}

          {currentView === "dossier-detail" && selectedDossierId && (
            <DossierDetail
              dossierId={selectedDossierId}
              onBack={handleBackToDashboard}
            />
          )}

          {currentView === "new-dossier" && (
            <div className="p-6">
              <button
                onClick={handleBackToDashboard}
                className="mb-4 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Retour au tableau de bord
              </button>
              <NewDossierForm
                onSubmit={(data) => {
                  console.log("Form submitted:", data);
                  // Attendre un court instant pour permettre à l'API de traiter la demande
                  setTimeout(() => {
                    handleBackToDashboard();
                  }, 500);
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
