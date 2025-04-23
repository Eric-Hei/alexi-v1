"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DiagnosticSocialFinancier } from "@/models/DiagnosticSocialFinancier";
import { Dossier } from "@/models/Dossier";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ArrowLeft, Save, FileText, Printer } from "lucide-react";

// Import des données préchargées (à l'extérieur du composant)
import { diagnosticsSociaux } from "@/data/diagnosticsSociaux";

interface DiagnosticSocialFormProps {
  dossier?: Dossier;
  dossierId: string;
  onBack?: () => void;
  onSave?: (data: DiagnosticSocialFinancier) => void;
}

const DiagnosticSocialForm = ({
  dossier,
  dossierId,
  onBack = () => {},
  onSave = () => {},
}: DiagnosticSocialFormProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Initialiser le formulaire avec les données du dossier si disponibles
  const defaultValues: Partial<DiagnosticSocialFinancier> = diagnosticsSociaux[
    dossierId
  ] || {
    dossierId,
    locataire: {
      nom: dossier?.tenant?.lastName || "",
      prenom: dossier?.tenant?.firstName || "",
      adresse: dossier?.tenant?.address || "",
      codePostal: dossier?.tenant?.postalCode || "",
      commune: dossier?.tenant?.city || "",
      email: dossier?.tenant?.email || "",
      telephone: dossier?.tenant?.phone || "",
    },
    detteLocative: {
      montantDette: dossier?.unpaidAmount?.amount || 0,
      datePremierImpaye: dossier?.unpaidAmount?.since || "",
    },
    solutionsApurement: {
      repriseLoyer: {
        statut: "non",
      },
      dossierSurendettement: {
        statut: "nonSouhaite",
      },
      dossierFSL: {
        statut: "nonSouhaite",
      },
    },
    evaluationSociale: {
      bailleurInvite: false,
      locataireParticipe: true,
    },
    audience: {
      locataireInformePresence: false,
      locataireInformeJustificatifs: false,
      aideJuridictionnelle: "nonDemandee",
      saisineCCAPEX: "nonEnvisagee",
    },
  };

  const form = useForm<DiagnosticSocialFinancier>({
    defaultValues,
  });

  // Calculer automatiquement les totaux financiers
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("situationFinanciere")) {
        const ressources = value.situationFinanciere?.ressources || {};
        const charges = value.situationFinanciere?.charges || {};

        // Calculer le total des ressources
        const totalRessources = Object.values(ressources).reduce(
          (sum, val) => sum + (typeof val === "number" ? val : 0),
          0,
        );

        // Calculer le total des charges
        const totalCharges = Object.values(charges).reduce((sum, val) => {
          if (Array.isArray(val)) {
            return (
              sum + val.reduce((s, v) => s + (typeof v === "number" ? v : 0), 0)
            );
          }
          return sum + (typeof val === "number" ? val : 0);
        }, 0);

        // Calculer le reste à vivre et le taux d'effort
        const resteAVivre = totalRessources - totalCharges;
        const tauxEffort =
          totalRessources > 0 ? (charges.loyer || 0) / totalRessources : 0;

        form.setValue("situationFinanciere.bilanFinancier", {
          totalRessources,
          totalCharges,
          resteAVivre,
          tauxEffort,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (data: DiagnosticSocialFinancier) => {
    try {
      // Ajouter les timestamps
      data.createdAt = new Date().toISOString();
      data.updatedAt = new Date().toISOString();

      // Appeler la fonction onSave pour sauvegarder les données
      onSave(data);

      // Ici, vous pourriez ajouter une notification de succès
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du DSF:", error);
      // Ici, vous pourriez ajouter une notification d'erreur
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);

    try {
      const formData = form.getValues();

      // Créer un conteneur temporaire pour le rendu du PDF
      const reportContainer = document.createElement("div");
      reportContainer.style.padding = "20px";
      reportContainer.style.position = "absolute";
      reportContainer.style.left = "-9999px";
      reportContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h1 style="text-align: center; color: #333;">Diagnostic Social et Financier</h1>
          <h2 style="color: #555;">Dossier N° ${dossier?.dossierNumber || dossierId}</h2>
          
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="margin-top: 0;">Informations du locataire</h3>
            <p><strong>Nom:</strong> ${formData.locataire.nom}</p>
            <p><strong>Prénom:</strong> ${formData.locataire.prenom}</p>
            <p><strong>Adresse:</strong> ${formData.locataire.adresse}, ${formData.locataire.codePostal} ${formData.locataire.commune}</p>
            <p><strong>Téléphone:</strong> ${formData.locataire.telephone || "Non renseigné"}</p>
            <p><strong>Email:</strong> ${formData.locataire.email || "Non renseigné"}</p>
          </div>
          
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="margin-top: 0;">Situation financière</h3>
            <p><strong>Total des ressources:</strong> ${formData.situationFinanciere?.bilanFinancier?.totalRessources || 0} €</p>
            <p><strong>Total des charges:</strong> ${formData.situationFinanciere?.bilanFinancier?.totalCharges || 0} €</p>
            <p><strong>Reste à vivre:</strong> ${formData.situationFinanciere?.bilanFinancier?.resteAVivre || 0} €</p>
            <p><strong>Taux d'effort:</strong> ${((formData.situationFinanciere?.bilanFinancier?.tauxEffort || 0) * 100).toFixed(2)} %</p>
          </div>
          
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="margin-top: 0;">Dette locative</h3>
            <p><strong>Montant de la dette:</strong> ${formData.detteLocative?.montantDette || 0} €</p>
            <p><strong>Date du premier impayé:</strong> ${formData.detteLocative?.datePremierImpaye || "Non renseigné"}</p>
          </div>
          
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="margin-top: 0;">Évaluation sociale</h3>
            <p>${formData.evaluationSociale?.contenu || "Aucune évaluation sociale renseignée."}</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #777;">
            <p>Document généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}</p>
            <p>Plateforme de Gestion des Expulsions Locatives</p>
          </div>
        </div>
      `;

      document.body.appendChild(reportContainer);

      // Convertir le HTML en canvas
      const canvas = await html2canvas(reportContainer);

      // Supprimer le conteneur temporaire
      document.body.removeChild(reportContainer);

      // Créer le PDF à partir du canvas
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // Largeur A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // Télécharger le PDF
      pdf.save(
        `DSF_${dossier?.dossierNumber || dossierId}_${new Date().toISOString().split("T")[0]}.pdf`,
      );
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert(
        "Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.",
      );
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-gray-50 p-6 rounded-lg">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Diagnostic Social et Financier</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generatePDF}
            disabled={isGeneratingPDF}
          >
            <FileText className="h-4 w-4 mr-2" />{" "}
            {isGeneratingPDF ? "Génération..." : "Générer PDF"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Imprimer
          </Button>
          <Button onClick={form.handleSubmit(handleSubmit)}>
            <Save className="h-4 w-4 mr-2" /> Enregistrer
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <Tabs defaultValue="locataire" className="w-full">
            <TabsList className="grid grid-cols-8 w-full">
              <TabsTrigger value="locataire">1. Locataire</TabsTrigger>
              <TabsTrigger value="finances">2. Finances</TabsTrigger>
              <TabsTrigger value="dette">3. Dette</TabsTrigger>
              <TabsTrigger value="solutions">4. Solutions</TabsTrigger>
              <TabsTrigger value="logement">5. Logement</TabsTrigger>
              <TabsTrigger value="evaluation">6. Évaluation</TabsTrigger>
              <TabsTrigger value="audience">7. Audience</TabsTrigger>
              <TabsTrigger value="redacteur">8. Rédacteur</TabsTrigger>
            </TabsList>

            {/* Section 1: Situation du locataire */}
            <TabsContent value="locataire" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Identité du locataire</CardTitle>
                  <CardDescription>
                    Informations personnelles du locataire concerné par la
                    procédure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="locataire.nom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="locataire.prenom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="locataire.dateNaissance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de naissance</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="locataire.situationProfessionnelle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Situation professionnelle</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="CDI, CDD, chômage..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="locataire.adresse"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="locataire.codePostal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code postal</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="locataire.commune"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commune</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="locataire.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="locataire.telephone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Situation familiale</CardTitle>
                  <CardDescription>
                    Composition du ménage et situation familiale
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="locataire.situationFamiliale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Situation familiale</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="celibataire">
                                Célibataire
                              </SelectItem>
                              <SelectItem value="concubinage">
                                En concubinage
                              </SelectItem>
                              <SelectItem value="pacse">Pacsé(e)</SelectItem>
                              <SelectItem value="marie">Marié(e)</SelectItem>
                              <SelectItem value="divorce">
                                Divorcé(e)
                              </SelectItem>
                              <SelectItem value="separation">
                                En cours de séparation
                              </SelectItem>
                              <SelectItem value="veuf">Veuf/Veuve</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="locataire.personnesACharge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Personnes à charge</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mesure de protection juridique</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="locataire.mesureProtection"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Mesure de protection</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value || null}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="tutelle" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Tutelle
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="curatelle" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Curatelle
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={null} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Aucune
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch("locataire.mesureProtection") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <FormField
                        control={form.control}
                        name="locataire.tuteurNom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom du tuteur/curateur</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="locataire.tuteurPrenom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom du tuteur/curateur</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="locataire.tuteurEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email du tuteur/curateur</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="locataire.tuteurTelephone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone du tuteur/curateur</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Section 2: Situation financière */}
            <TabsContent value="finances" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ressources mensuelles du ménage</CardTitle>
                  <CardDescription>
                    Indiquez les ressources du dernier mois connu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Locataire assigné</h3>
                      <FormField
                        control={form.control}
                        name="situationFinanciere.ressources.salaireLocataire"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salaire net</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="situationFinanciere.ressources.indemnitesJournalieres"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Indemnités journalières</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="situationFinanciere.ressources.indemnitesChomage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Indemnités chômage</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="situationFinanciere.ressources.rsa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>RSA</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Conjoint</h3>
                      <FormField
                        control={form.control}
                        name="situationFinanciere.ressources.salaireConjoint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salaire net</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Autres ressources</h3>
                      <FormField
                        control={form.control}
                        name="situationFinanciere.ressources.retraites"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Retraites</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="situationFinanciere.ressources.allocationsLogement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allocations logement</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="situationFinanciere.ressources.autresAllocations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Autres allocations</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="situationFinanciere.ressources.pensionsAlimentaires"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pensions alimentaires</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Charges mensuelles du ménage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Logement</h3>
                      <FormField
                        control={form.control}
                        name="situationFinanciere.charges.loyer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loyer</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="situationFinanciere.charges.chargesLocatives"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Charges locatives</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="situationFinanciere.charges.autresChargesLogement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Autres charges logement</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="situationFinanciere.charges.assuranceHabitation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assurance habitation</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Autres charges</h3>
                      <FormField
                        control={form.control}
                        name="situationFinanciere.charges.telephone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone et internet</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="situationFinanciere.charges.transports"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transports</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="situationFinanciere.charges.impots"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Impôts</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="situationFinanciere.charges.credits"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Crédits</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bilan financier</CardTitle>
                  <CardDescription>
                    Récapitulatif de la situation financière (calculé
                    automatiquement)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-100 rounded-md">
                      <p className="font-medium">Total des ressources</p>
                      <p className="text-2xl font-bold">
                        {form.watch(
                          "situationFinanciere.bilanFinancier.totalRessources",
                        ) || 0}{" "}
                        €
                      </p>
                    </div>
                    <div className="p-4 bg-gray-100 rounded-md">
                      <p className="font-medium">Total des charges</p>
                      <p className="text-2xl font-bold">
                        {form.watch(
                          "situationFinanciere.bilanFinancier.totalCharges",
                        ) || 0}{" "}
                        €
                      </p>
                    </div>
                    <div className="p-4 bg-gray-100 rounded-md">
                      <p className="font-medium">Reste à vivre</p>
                      <p className="text-2xl font-bold">
                        {form.watch(
                          "situationFinanciere.bilanFinancier.resteAVivre",
                        ) || 0}{" "}
                        €
                      </p>
                    </div>
                    <div className="p-4 bg-gray-100 rounded-md">
                      <p className="font-medium">Taux d'effort</p>
                      <p className="text-2xl font-bold">
                        {(
                          (form.watch(
                            "situationFinanciere.bilanFinancier.tauxEffort",
                          ) || 0) * 100
                        ).toFixed(2)}{" "}
                        %
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Section 3: Dette locative */}
            <TabsContent value="dette" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Nature et origine de la dette</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="detteLocative.montantDette"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant de la dette (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="detteLocative.presenceGarantie"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Présence d'une garantie (physique ou morale)
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="detteLocative.datePremierImpaye"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date du 1er impayé</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-6">
                    <FormLabel>Causes de l'impayé</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {[
                        { id: "loyerTropEleve", label: "Loyer trop élevé" },
                        {
                          id: "augmentationLoyer",
                          label: "Augmentation du loyer ou des charges",
                        },
                        { id: "perteEmploi", label: "Perte d'emploi" },
                        {
                          id: "changementSituation",
                          label: "Changement de la situation familiale",
                        },
                        {
                          id: "difficulteBudget",
                          label: "Difficulté de gestion du budget",
                        },
                        {
                          id: "suspensionAides",
                          label: "Suspension d'allocations ou d'aides",
                        },
                        { id: "maladie", label: "Maladie, raisons médicales" },
                        { id: "detention", label: "Placement en détention" },
                        {
                          id: "litigeBailleur",
                          label: "Litige avec le bailleur",
                        },
                        { id: "retraite", label: "Passage à la retraite" },
                      ].map((cause) => (
                        <FormItem
                          key={cause.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={form
                                .watch("detteLocative.causesImpaye")
                                ?.includes(cause.id)}
                              onCheckedChange={(checked) => {
                                const currentCauses =
                                  form.watch("detteLocative.causesImpaye") ||
                                  [];
                                if (checked) {
                                  form.setValue("detteLocative.causesImpaye", [
                                    ...currentCauses,
                                    cause.id,
                                  ]);
                                } else {
                                  form.setValue(
                                    "detteLocative.causesImpaye",
                                    currentCauses.filter(
                                      (id) => id !== cause.id,
                                    ),
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {cause.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <FormField
                      control={form.control}
                      name="detteLocative.aidesLogementVersees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Les aides au logement sont-elles versées au bailleur
                            ?
                          </FormLabel>
                          <div className="flex items-center space-x-4">
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  checked={field.value === true}
                                  onChange={() => field.onChange(true)}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">Oui</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  checked={field.value === false}
                                  onChange={() => field.onChange(false)}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">Non</FormLabel>
                            </FormItem>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("detteLocative.aidesLogementVersees") && (
                      <FormField
                        control={form.control}
                        name="detteLocative.montantAidesLogement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Montant des aides au logement (€)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="detteLocative.aidesLogementSuspendues"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Les aides au logement sont-elles suspendues ?
                          </FormLabel>
                          <div className="flex items-center space-x-4">
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  checked={field.value === true}
                                  onChange={() => field.onChange(true)}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">Oui</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  checked={field.value === false}
                                  onChange={() => field.onChange(false)}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">Non</FormLabel>
                            </FormItem>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("detteLocative.aidesLogementSuspendues") && (
                      <FormField
                        control={form.control}
                        name="detteLocative.dateAidesLogementSuspendues"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date de suspension des aides</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Section 4: Solutions d'apurement */}
            <TabsContent value="solutions" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Remboursement de la dette</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="solutionsApurement.repriseLoyer.statut"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Le locataire a-t-il repris le paiement de son loyer
                            ?
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="total">
                                Oui, en totalité
                              </SelectItem>
                              <SelectItem value="partiel">
                                Oui, partiellement
                              </SelectItem>
                              <SelectItem value="irregulier">
                                Oui, de façon irrégulière
                              </SelectItem>
                              <SelectItem value="non">Non</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("solutionsApurement.repriseLoyer.statut") ===
                      "total" && (
                      <FormField
                        control={form.control}
                        name="solutionsApurement.repriseLoyer.depuis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Depuis le</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {form.watch("solutionsApurement.repriseLoyer.statut") ===
                      "partiel" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="solutionsApurement.repriseLoyer.montantPartiel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Montant mensuel (€)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="solutionsApurement.repriseLoyer.depuis"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Depuis le</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="solutionsApurement.capaciteRemboursement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Le locataire est-il en capacité de rembourser tout
                            ou une partie de la dette ?
                          </FormLabel>
                          <div className="flex items-center space-x-4">
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  checked={field.value === true}
                                  onChange={() => field.onChange(true)}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">Oui</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  checked={field.value === false}
                                  onChange={() => field.onChange(false)}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">Non</FormLabel>
                            </FormItem>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("solutionsApurement.capaciteRemboursement") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="solutionsApurement.montantRemboursementMensuel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Montant mensuel maximum (€)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="solutionsApurement.dureeRemboursement"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sur combien de mois</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="solutionsApurement.informationsComplementaires"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Informations complémentaires</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Précisez toute information utile concernant le remboursement"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mesures d'apurement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Dossier de surendettement</h3>
                      <FormField
                        control={form.control}
                        name="solutionsApurement.dossierSurendettement.statut"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Statut du dossier</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="nonSouhaite">
                                  Le ménage ne souhaite pas demander
                                </SelectItem>
                                <SelectItem value="envisage">
                                  Dispositif envisagé
                                </SelectItem>
                                <SelectItem value="depose">
                                  Dossier déposé
                                </SelectItem>
                                <SelectItem value="refuse">
                                  Dossier refusé
                                </SelectItem>
                                <SelectItem value="recevable">
                                  Dossier jugé recevable
                                </SelectItem>
                                <SelectItem value="planTraitement">
                                  Plan de traitement accordé
                                </SelectItem>
                                <SelectItem value="suspensionCreances">
                                  Suspension des créances
                                </SelectItem>
                                <SelectItem value="retablissementPersonnel">
                                  Rétablissement personnel
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {[
                        "depose",
                        "refuse",
                        "recevable",
                        "planTraitement",
                        "suspensionCreances",
                        "retablissementPersonnel",
                      ].includes(
                        form.watch(
                          "solutionsApurement.dossierSurendettement.statut",
                        ),
                      ) && (
                        <FormField
                          control={form.control}
                          name="solutionsApurement.dossierSurendettement.dateDepot"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date de dépôt</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {["planTraitement", "suspensionCreances"].includes(
                        form.watch(
                          "solutionsApurement.dossierSurendettement.statut",
                        ),
                      ) && (
                        <FormField
                          control={form.control}
                          name="solutionsApurement.dossierSurendettement.duree"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Durée (en mois)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Dossier FSL</h3>
                      <FormField
                        control={form.control}
                        name="solutionsApurement.dossierFSL.statut"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Statut du dossier</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="nonSouhaite">
                                  Le ménage ne souhaite pas le demander
                                </SelectItem>
                                <SelectItem value="enCours">
                                  Dossier en cours de constitution
                                </SelectItem>
                                <SelectItem value="depose">
                                  Dossier déposé
                                </SelectItem>
                                <SelectItem value="refuse">
                                  Dossier refusé
                                </SelectItem>
                                <SelectItem value="recevable">
                                  Dossier jugé recevable
                                </SelectItem>
                                <SelectItem value="verse">
                                  Aide versée
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {["depose", "refuse", "recevable", "verse"].includes(
                        form.watch("solutionsApurement.dossierFSL.statut"),
                      ) && (
                        <FormField
                          control={form.control}
                          name="solutionsApurement.dossierFSL.dateDepot"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date de dépôt</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="solutionsApurement.autresMesures"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Autres mesures d'apurement et d'ouverture de droits
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Précisez les autres dispositifs mobilisés"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Section 5: Logement actuel et perspectives de relogement */}
            <TabsContent value="logement" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Logement actuel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="logement.typeLogement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de logement</FormLabel>
                          <div className="flex items-center space-x-4">
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  checked={field.value === "social"}
                                  onChange={() => field.onChange("social")}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Social
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  checked={field.value === "prive"}
                                  onChange={() => field.onChange("prive")}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Privé
                              </FormLabel>
                            </FormItem>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="logement.nombrePieces"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de pièces</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="logement.dateEntree"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date d'entrée dans les lieux</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="logement.assuranceHabitation"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Assurance habitation en cours de validité
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="logement.arreteInsalubrite"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Présence d'un arrêté de mise en sécurité ou de
                              traitement de l'insalubrité
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="logement.certificatNonDecence"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Présence d'un certificat de non décence
                          </FormLabel>
                          <div className="flex items-center space-x-4">
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  checked={field.value === true}
                                  onChange={() => field.onChange(true)}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">Oui</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  checked={field.value === false}
                                  onChange={() => field.onChange(false)}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">Non</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  checked={field.value === null}
                                  onChange={() => field.onChange(null)}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Ne sait pas
                              </FormLabel>
                            </FormItem>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="logement.precisions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Précisions supplémentaires sur le logement actuel
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Précisez l'état du logement, les problèmes éventuels..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relogement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="logement.souhaiteMaintien"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Le locataire souhaite-t-il rester dans les lieux ?
                          </FormLabel>
                          <div className="flex items-center space-x-4">
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  checked={field.value === true}
                                  onChange={() => field.onChange(true)}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">Oui</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <input
                                  type="radio"
                                  checked={field.value === false}
                                  onChange={() => field.onChange(false)}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">Non</FormLabel>
                            </FormItem>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="logement.demandeLogementSocial.dateDepot"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Demande de logement social déposée le
                            </FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="logement.demandeLogementSocial.dateRenouvellement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Date du dernier renouvellement
                            </FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Section 6: Évaluation sociale */}
            <TabsContent value="evaluation" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Évaluation sociale</CardTitle>
                  <CardDescription>
                    Le décret du 5 janvier 2021 prévoit que le bailleur et le
                    locataire puissent présenter leurs observations sur le
                    contenu du diagnostic
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="evaluationSociale.bailleurInvite"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Le bailleur a-t-il été invité à apporter des
                              observations pour ce diagnostic ?
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="evaluationSociale.locataireParticipe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Le locataire a-t-il participé à la rédaction du
                              DSF ?
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="evaluationSociale.contenu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Évaluation sociale</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Rédigez ici l'évaluation sociale du ménage"
                              className="min-h-[300px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Décrivez la situation sociale du ménage, les causes
                            de l'impayé, les démarches entreprises, les
                            perspectives de résolution...
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Section 7: Préparation à l'audience */}
            <TabsContent value="audience" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations sur l'audience</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="audience.date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de l'audience</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="audience.heure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Heure</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="audience.lieu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lieu</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 mt-6">
                    <FormField
                      control={form.control}
                      name="audience.locataireInformePresence"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Le locataire a été informé de l'importance de se
                              présenter à l'audience
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="audience.locataireInformeJustificatifs"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Le locataire a été informé de l'importance
                              d'apporter ses justificatifs à l'audience
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Orientation vers l'aide juridictionnelle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="audience.aideJuridictionnelle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aide juridictionnelle</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="nonDemandee">
                              Non demandée ou non souhaitée
                            </SelectItem>
                            <SelectItem value="enCours">
                              Dossier en cours de constitution
                            </SelectItem>
                            <SelectItem value="demandee">Demandée</SelectItem>
                            <SelectItem value="accordee">Accordée</SelectItem>
                            <SelectItem value="refusee">Refusée</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Décompte de la dette</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      Le locataire indique que la dette actuelle comprend
                      (plusieurs options possibles) :
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        {
                          id: "loyersNonDus",
                          label: "Loyers non dus ou déjà réglés",
                        },
                        { id: "chargesNonDues", label: "Charges non dues" },
                        { id: "fraisHuissiers", label: "Frais d'huissiers" },
                      ].map((item) => (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={form.watch(
                                `audience.detteContestee.${item.id}`,
                              )}
                              onCheckedChange={(checked) => {
                                form.setValue(
                                  `audience.detteContestee.${item.id}`,
                                  !!checked,
                                );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormField
                      control={form.control}
                      name="audience.detteContestee.autre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Autre (précisez)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Saisine de la CCAPEX</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="audience.saisineCCAPEX"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Étude de la situation par la CCAPEX
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="nonEnvisagee">
                              Non envisagée
                            </SelectItem>
                            <SelectItem value="envisagee">Envisagée</SelectItem>
                            <SelectItem value="realisee">Réalisée</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Section 8: Coordonnées du rédacteur */}
            <TabsContent value="redacteur" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Coordonnées du rédacteur</CardTitle>
                  <CardDescription>
                    Renseigner ces informations permet à la CCAPEX de vous
                    contacter si besoin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="redacteur.nom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="redacteur.prenom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="redacteur.organisme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organisme de rattachement</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="redacteur.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="redacteur.telephone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default DiagnosticSocialForm;
