"use client";

import React from "react";
import { useForm as useHookForm } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  CalendarIcon,
  FileText,
  Home,
  User,
  Users,
  Euro,
  AlertTriangle,
} from "lucide-react";

interface NewDossierFormProps {
  onSubmit?: (data: DossierFormData) => void;
  initialData?: Partial<DossierFormData>;
}

interface DossierFormData {
  // Locataire
  tenantFirstName: string;
  tenantLastName: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantAddress: string;
  tenantCity: string;
  tenantPostalCode: string;

  // Bailleur
  landlordType: string;
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;

  // Logement
  housingType: string;
  housingArea: string;
  housingRent: string;
  housingCharges: string;
  housingDeposit: string;
  leaseStartDate: string;

  // Impayés
  unpaidAmount: string;
  unpaidSince: string;
  unpaidReason: string;
  previousActions: string;

  // Notes
  additionalNotes: string;
}

const defaultFormValues: DossierFormData = {
  tenantFirstName: "",
  tenantLastName: "",
  tenantEmail: "",
  tenantPhone: "",
  tenantAddress: "",
  tenantCity: "",
  tenantPostalCode: "",

  landlordType: "private",
  landlordName: "",
  landlordEmail: "",
  landlordPhone: "",

  housingType: "apartment",
  housingArea: "",
  housingRent: "",
  housingCharges: "",
  housingDeposit: "",
  leaseStartDate: "",

  unpaidAmount: "",
  unpaidSince: "",
  unpaidReason: "",
  previousActions: "",

  additionalNotes: "",
};

const NewDossierForm = ({
  onSubmit = () => {},
  initialData = {},
}: NewDossierFormProps) => {
  const form = useHookForm<DossierFormData>({
    defaultValues: { ...defaultFormValues, ...initialData },
  });

  const handleSubmit = async (data: DossierFormData) => {
    try {
      // Format the data according to our API schema
      const dossierData = {
        dossierNumber: `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        creationDate: new Date().toISOString().split("T")[0],
        status: "en_attente" as const,
        tenant: {
          firstName: data.tenantFirstName,
          lastName: data.tenantLastName,
          email: data.tenantEmail,
          phone: data.tenantPhone,
          address: data.tenantAddress,
          city: data.tenantCity,
          postalCode: data.tenantPostalCode,
        },
        landlord: {
          type: data.landlordType as "private" | "social" | "company",
          name: data.landlordName,
          email: data.landlordEmail,
          phone: data.landlordPhone,
        },
        unpaidAmount: {
          amount: parseFloat(data.unpaidAmount) || 0,
          months: Math.ceil(
            (parseFloat(data.unpaidAmount) || 0) /
              (parseFloat(data.housingRent) || 1),
          ),
          since: data.unpaidSince,
          reason: data.unpaidReason as
            | "unemployment"
            | "health"
            | "separation"
            | "financial"
            | "other",
          previousActions: data.previousActions,
        },
        nextDeadline: "",
        nextAction: "",
        additionalNotes: data.additionalNotes,
      };

      // Send the data to the API
      console.log("Sending data to API:", dossierData);
      const response = await fetch("/api/dossiers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dossierData),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to create dossier");
      }

      const result = await response.json();

      // Call the onSubmit callback with the original form data
      onSubmit(data);

      // You could also redirect to the new dossier detail page
      // window.location.href = `/dossiers/${result.id}`;
    } catch (error) {
      console.error("Error creating dossier:", error);
      // Handle error (could show a toast notification)
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-background">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Nouveau Dossier d'Expulsion
          </CardTitle>
          <CardDescription>
            Créez un nouveau dossier en renseignant les informations du
            locataire, du bailleur et des impayés.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8"
            >
              <Tabs defaultValue="tenant" className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger
                    value="tenant"
                    className="flex items-center gap-2"
                  >
                    <User size={16} />
                    <span>Locataire</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="landlord"
                    className="flex items-center gap-2"
                  >
                    <Users size={16} />
                    <span>Bailleur</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="housing"
                    className="flex items-center gap-2"
                  >
                    <Home size={16} />
                    <span>Logement</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="unpaid"
                    className="flex items-center gap-2"
                  >
                    <Euro size={16} />
                    <span>Impayés</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="notes"
                    className="flex items-center gap-2"
                  >
                    <FileText size={16} />
                    <span>Notes</span>
                  </TabsTrigger>
                </TabsList>

                {/* Section Locataire */}
                <TabsContent value="tenant" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="tenantFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input placeholder="Jean" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tenantLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder="Dupont" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tenantEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="jean.dupont@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tenantPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="06 12 34 56 78" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tenantAddress"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123 rue de la République"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tenantCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville</FormLabel>
                          <FormControl>
                            <Input placeholder="Paris" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tenantPostalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code Postal</FormLabel>
                          <FormControl>
                            <Input placeholder="75001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Section Bailleur */}
                <TabsContent value="landlord" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="landlordType"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Type de bailleur</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez le type de bailleur" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="private">
                                Bailleur privé
                              </SelectItem>
                              <SelectItem value="social">
                                Bailleur social
                              </SelectItem>
                              <SelectItem value="company">Société</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="landlordName"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Nom du bailleur</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nom du bailleur ou de la société"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="landlordEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="contact@bailleur.fr"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="landlordPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="01 23 45 67 89" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Section Logement */}
                <TabsContent value="housing" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="housingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de logement</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez le type de logement" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="apartment">
                                Appartement
                              </SelectItem>
                              <SelectItem value="house">Maison</SelectItem>
                              <SelectItem value="studio">Studio</SelectItem>
                              <SelectItem value="other">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="housingArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Surface (m²)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="60" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="housingRent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loyer mensuel (€)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="800" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="housingCharges"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Charges mensuelles (€)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="housingDeposit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dépôt de garantie (€)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="800" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="leaseStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de début du bail</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Section Impayés */}
                <TabsContent value="unpaid" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="unpaidAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant des impayés (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unpaidSince"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date du premier impayé</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unpaidReason"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Raison des impayés</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez la raison principale" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unemployment">
                                  Perte d'emploi
                                </SelectItem>
                                <SelectItem value="health">
                                  Problèmes de santé
                                </SelectItem>
                                <SelectItem value="separation">
                                  Séparation/Divorce
                                </SelectItem>
                                <SelectItem value="financial">
                                  Difficultés financières
                                </SelectItem>
                                <SelectItem value="other">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="previousActions"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Actions déjà entreprises</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Décrivez les actions déjà entreprises (relances, médiations, etc.)"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
                    <AlertTriangle
                      className="text-amber-500 mt-0.5"
                      size={20}
                    />
                    <div>
                      <h4 className="font-medium text-amber-800">
                        Rappel important
                      </h4>
                      <p className="text-sm text-amber-700">
                        Assurez-vous d'avoir tenté une médiation amiable avant
                        de poursuivre la procédure d'expulsion. Les services
                        sociaux peuvent être sollicités pour aider le locataire
                        à trouver des solutions.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* Section Notes */}
                <TabsContent value="notes" className="space-y-4 mt-6">
                  <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes complémentaires</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ajoutez toute information complémentaire utile au dossier"
                            className="min-h-[250px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Ces notes seront visibles par tous les intervenants
                          sur le dossier.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <CardFooter className="flex justify-between px-0">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
                <Button type="submit">Créer le dossier</Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewDossierForm;
