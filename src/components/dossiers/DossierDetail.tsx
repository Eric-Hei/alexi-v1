"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Button } from "../ui/button";
import { ArrowLeft, Save, Printer, Share2, FileText } from "lucide-react";
import DossierInfoCard from "./DossierInfoCard";
import DocumentsManager from "./DocumentsManager";
import CommunicationPanel from "./CommunicationPanel";
import TimelineView from "./TimelineView";
import { useDossier } from "@/hooks/useDossier";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface DossierDetailProps {
  dossierId?: string;
  onBack?: () => void;
  onSave?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  dossierData?: {
    dossierNumber?: string;
    creationDate?: string;
    status?:
      | "en_attente"
      | "en_cours"
      | "procedure_judiciaire"
      | "plan_apurement"
      | "resolu"
      | "expulsion_programmee";
    tenant?: {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
    };
    landlord?: {
      name?: string;
      phone?: string;
      email?: string;
    };
    unpaidAmount?: number;
    unpaidMonths?: number;
    nextDeadline?: string;
    nextAction?: string;
  };
}

const defaultDossierData = {
  dossierNumber: "EXP-2023-1234",
  creationDate: "15/04/2023",
  status: "en_cours" as const,
  tenant: {
    name: "Jean Dupont",
    phone: "06 12 34 56 78",
    email: "jean.dupont@email.com",
    address: "123 Avenue de la République, 75011 Paris",
  },
  landlord: {
    name: "Immobilière du Centre",
    phone: "01 23 45 67 89",
    email: "contact@immobiliere-centre.fr",
  },
  unpaidAmount: 3450,
  unpaidMonths: 3,
  nextDeadline: "30/06/2023",
  nextAction: "Audience au tribunal",
};

const DossierDetail = ({
  dossierId = "1", // Default to a simple ID for demo purposes
  onBack = () => {},
  onSave = () => {},
  onPrint = () => {},
  onShare = () => {},
  dossierData = defaultDossierData,
}: DossierDetailProps) => {
  // Use our custom hook to fetch and manage dossier data
  const { dossier, loading, error, updateDossier } = useDossier(dossierId);

  // Use the fetched data or fall back to the prop data
  const displayData = dossier || dossierData;

  // Client-side event handlers
  const handleBack = () => onBack();

  const handleSave = async () => {
    // In a real implementation, you would collect the changes and save them
    if (dossier?.id) {
      await updateDossier({
        // Example update
        nextAction: "Updated action",
      });
    }
    onSave();
  };

  const handlePrint = () => onPrint();
  const handleShare = () => onShare();

  // PDF generation state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Function to generate and download PDF report
  const generatePDFReport = async () => {
    if (!displayData) return;

    setIsGeneratingPDF(true);

    try {
      // Create a container to hold the content we want to convert to PDF
      const reportContainer = document.createElement("div");
      reportContainer.style.padding = "20px";
      reportContainer.style.position = "absolute";
      reportContainer.style.left = "-9999px";
      reportContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h1 style="text-align: center; color: #333;">Rapport de Dossier d'Expulsion</h1>
          <h2 style="color: #555;">Dossier N° ${displayData.dossierNumber}</h2>
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="margin-top: 0;">Informations Générales</h3>
            <p><strong>Date de création:</strong> ${displayData.creationDate}</p>
            <p><strong>Statut:</strong> ${displayData.status}</p>
            <p><strong>Montant impayé:</strong> ${displayData.unpaidAmount} €</p>
            <p><strong>Mois impayés:</strong> ${displayData.unpaidMonths}</p>
            <p><strong>Prochaine échéance:</strong> ${displayData.nextDeadline || "Non définie"}</p>
            <p><strong>Prochaine action:</strong> ${displayData.nextAction || "Non définie"}</p>
          </div>
          
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="margin-top: 0;">Informations du Locataire</h3>
            <p><strong>Nom:</strong> ${displayData.tenant?.name || "Non renseigné"}</p>
            <p><strong>Téléphone:</strong> ${displayData.tenant?.phone || "Non renseigné"}</p>
            <p><strong>Email:</strong> ${displayData.tenant?.email || "Non renseigné"}</p>
            <p><strong>Adresse:</strong> ${displayData.tenant?.address || "Non renseignée"}</p>
          </div>
          
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="margin-top: 0;">Informations du Bailleur</h3>
            <p><strong>Nom:</strong> ${displayData.landlord?.name || "Non renseigné"}</p>
            <p><strong>Téléphone:</strong> ${displayData.landlord?.phone || "Non renseigné"}</p>
            <p><strong>Email:</strong> ${displayData.landlord?.email || "Non renseigné"}</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #777;">
            <p>Document généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}</p>
            <p>Plateforme de Gestion des Expulsions Locatives</p>
          </div>
        </div>
      `;

      document.body.appendChild(reportContainer);

      // Convert the HTML to canvas
      const canvas = await html2canvas(reportContainer);

      // Remove the temporary container
      document.body.removeChild(reportContainer);

      // Create PDF from canvas
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Download the PDF
      pdf.save(
        `Rapport_Dossier_${displayData.dossierNumber}_${new Date().toISOString().split("T")[0]}.pdf`,
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(
        "Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.",
      );
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-gray-50 p-6 rounded-lg">
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Détails du dossier {dossierId}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generatePDFReport}
            disabled={isGeneratingPDF}
          >
            <FileText className="h-4 w-4 mr-2" />{" "}
            {isGeneratingPDF ? "Génération..." : "Générer PDF"}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Imprimer
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" /> Partager
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> Enregistrer
          </Button>
        </div>
      </div>

      {/* Main dossier info card */}
      <div className="mb-6">
        <DossierInfoCard
          dossierNumber={displayData.dossierNumber}
          creationDate={displayData.creationDate}
          status={displayData.status}
          tenant={displayData.tenant}
          landlord={displayData.landlord}
          unpaidAmount={displayData.unpaidAmount}
          unpaidMonths={displayData.unpaidMonths}
          nextDeadline={displayData.nextDeadline}
          nextAction={displayData.nextAction}
        />
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="timeline">Chronologie</TabsTrigger>
        </TabsList>

        {/* Documents tab */}
        <TabsContent value="documents" className="mt-0">
          <DocumentsManager dossierId={dossierId} />
        </TabsContent>

        {/* Communications tab */}
        <TabsContent value="communications" className="mt-0">
          <CommunicationPanel dossierID={dossierId} />
        </TabsContent>

        {/* Timeline tab */}
        <TabsContent value="timeline" className="mt-0">
          <TimelineView dossierRef={dossierId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DossierDetail;
