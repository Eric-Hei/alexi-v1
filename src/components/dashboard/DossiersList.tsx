"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "../ui/dropdown-menu";
import {
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

interface Dossier {
  id: string;
  reference: string;
  locataire: string;
  bailleur: string;
  adresse: string;
  dateCreation: string;
  statut:
    | "en_attente"
    | "en_cours"
    | "procedure_judiciaire"
    | "plan_apurement"
    | "resolu"
    | "expulsion_programmee";
  montantImpayes: number;
  echeance?: string;
}

interface DossiersListProps {
  dossiers?: Dossier[];
  onViewDossier?: (id: string) => void;
  onCreateDossier?: () => void;
}

const getStatusBadge = (statut: Dossier["statut"]) => {
  const statusConfig: Record<
    Dossier["statut"],
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    en_attente: { label: "En attente", variant: "secondary" },
    en_cours: { label: "En cours", variant: "default" },
    procedure_judiciaire: {
      label: "Procédure judiciaire",
      variant: "destructive",
    },
    plan_apurement: { label: "Plan d'apurement", variant: "outline" },
    resolu: { label: "Résolu", variant: "default" },
    expulsion_programmee: {
      label: "Expulsion programmée",
      variant: "destructive",
    },
  };

  const config = statusConfig[statut];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

type SortField =
  | "reference"
  | "locataire"
  | "bailleur"
  | "dateCreation"
  | "montantImpayes"
  | "echeance"
  | "statut";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  montantMin?: number;
  montantMax?: number;
  dateCreationDebut?: string;
  dateCreationFin?: string;
  echeanceDebut?: string;
  echeanceFin?: string;
  adresse?: string;
}

const DossiersList = ({
  dossiers = defaultDossiers,
  onViewDossier = () => {},
  onCreateDossier = () => {},
}: DossiersListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("dateCreation");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Update active filters count when filters change
  useEffect(() => {
    let count = 0;
    if (advancedFilters.montantMin) count++;
    if (advancedFilters.montantMax) count++;
    if (advancedFilters.dateCreationDebut) count++;
    if (advancedFilters.dateCreationFin) count++;
    if (advancedFilters.echeanceDebut) count++;
    if (advancedFilters.echeanceFin) count++;
    if (advancedFilters.adresse) count++;
    setActiveFiltersCount(count);
  }, [advancedFilters]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setAdvancedFilters({});
  };

  // Apply sorting
  const sortedDossiers = [...dossiers].sort((a, b) => {
    if (sortField === "montantImpayes") {
      return sortDirection === "asc"
        ? a.montantImpayes - b.montantImpayes
        : b.montantImpayes - a.montantImpayes;
    }

    // Handle date fields
    if (sortField === "dateCreation" || sortField === "echeance") {
      const aValue = sortField === "echeance" ? a.echeance || "" : a[sortField];
      const bValue = sortField === "echeance" ? b.echeance || "" : b[sortField];

      // Convert DD/MM/YYYY to YYYY-MM-DD for proper comparison
      const aDate = aValue
        ? new Date(aValue.split("/").reverse().join("-"))
        : new Date(0);
      const bDate = bValue
        ? new Date(bValue.split("/").reverse().join("-"))
        : new Date(0);

      return sortDirection === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    // Handle string fields
    const aValue = a[sortField].toLowerCase();
    const bValue = b[sortField].toLowerCase();

    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  // Apply filters
  const filteredDossiers = sortedDossiers.filter((dossier) => {
    // Basic search filter
    const matchesSearch =
      searchTerm === "" ||
      dossier.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.locataire.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.bailleur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.adresse.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" || dossier.statut === statusFilter;

    // Advanced filters
    const matchesMontantMin =
      !advancedFilters.montantMin ||
      dossier.montantImpayes >= advancedFilters.montantMin;
    const matchesMontantMax =
      !advancedFilters.montantMax ||
      dossier.montantImpayes <= advancedFilters.montantMax;

    // Date filters - convert DD/MM/YYYY to Date objects for comparison
    const dossierDateCreation = new Date(
      dossier.dateCreation.split("/").reverse().join("-"),
    );
    const matchesDateCreationDebut =
      !advancedFilters.dateCreationDebut ||
      dossierDateCreation >= new Date(advancedFilters.dateCreationDebut);
    const matchesDateCreationFin =
      !advancedFilters.dateCreationFin ||
      dossierDateCreation <= new Date(advancedFilters.dateCreationFin);

    // Echeance filters
    let matchesEcheanceDebut = true;
    let matchesEcheanceFin = true;

    if (dossier.echeance && advancedFilters.echeanceDebut) {
      const dossierEcheance = new Date(
        dossier.echeance.split("/").reverse().join("-"),
      );
      matchesEcheanceDebut =
        dossierEcheance >= new Date(advancedFilters.echeanceDebut);
    } else if (advancedFilters.echeanceDebut && !dossier.echeance) {
      matchesEcheanceDebut = false;
    }

    if (dossier.echeance && advancedFilters.echeanceFin) {
      const dossierEcheance = new Date(
        dossier.echeance.split("/").reverse().join("-"),
      );
      matchesEcheanceFin =
        dossierEcheance <= new Date(advancedFilters.echeanceFin);
    } else if (advancedFilters.echeanceFin && !dossier.echeance) {
      matchesEcheanceFin = false;
    }

    // Address filter
    const matchesAdresse =
      !advancedFilters.adresse ||
      dossier.adresse
        .toLowerCase()
        .includes(advancedFilters.adresse.toLowerCase());

    return (
      matchesSearch &&
      matchesStatus &&
      matchesMontantMin &&
      matchesMontantMax &&
      matchesDateCreationDebut &&
      matchesDateCreationFin &&
      matchesEcheanceDebut &&
      matchesEcheanceFin &&
      matchesAdresse
    );
  });

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Dossiers d'expulsion</CardTitle>
            <CardDescription>
              Liste des dossiers d'expulsion en cours de traitement
            </CardDescription>
          </div>
          <Button onClick={onCreateDossier}>
            <Plus className="mr-2 h-4 w-4" /> Nouveau dossier
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un dossier..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="procedure_judiciaire">
                    Procédure judiciaire
                  </SelectItem>
                  <SelectItem value="plan_apurement">
                    Plan d'apurement
                  </SelectItem>
                  <SelectItem value="resolu">Résolu</SelectItem>
                  <SelectItem value="expulsion_programmee">
                    Expulsion programmée
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Advanced Filters Popover */}
              <Popover
                open={showFilterPopover}
                onOpenChange={setShowFilterPopover}
              >
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Filter className="h-4 w-4" />
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-4" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filtres avancés</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="h-8 px-2 text-xs"
                      >
                        Réinitialiser
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      {/* Montant impayés range */}
                      <div className="space-y-2">
                        <Label>Montant des impayés</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={advancedFilters.montantMin || ""}
                            onChange={(e) =>
                              setAdvancedFilters({
                                ...advancedFilters,
                                montantMin: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              })
                            }
                            className="w-full"
                          />
                          <span>à</span>
                          <Input
                            type="number"
                            placeholder="Max"
                            value={advancedFilters.montantMax || ""}
                            onChange={(e) =>
                              setAdvancedFilters({
                                ...advancedFilters,
                                montantMax: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              })
                            }
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Date de création range */}
                      <div className="space-y-2">
                        <Label>Date de création</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="date"
                            value={advancedFilters.dateCreationDebut || ""}
                            onChange={(e) =>
                              setAdvancedFilters({
                                ...advancedFilters,
                                dateCreationDebut: e.target.value || undefined,
                              })
                            }
                            className="w-full"
                          />
                          <span>à</span>
                          <Input
                            type="date"
                            value={advancedFilters.dateCreationFin || ""}
                            onChange={(e) =>
                              setAdvancedFilters({
                                ...advancedFilters,
                                dateCreationFin: e.target.value || undefined,
                              })
                            }
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Échéance range */}
                      <div className="space-y-2">
                        <Label>Échéance</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="date"
                            value={advancedFilters.echeanceDebut || ""}
                            onChange={(e) =>
                              setAdvancedFilters({
                                ...advancedFilters,
                                echeanceDebut: e.target.value || undefined,
                              })
                            }
                            className="w-full"
                          />
                          <span>à</span>
                          <Input
                            type="date"
                            value={advancedFilters.echeanceFin || ""}
                            onChange={(e) =>
                              setAdvancedFilters({
                                ...advancedFilters,
                                echeanceFin: e.target.value || undefined,
                              })
                            }
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Adresse */}
                      <div className="space-y-2">
                        <Label>Adresse</Label>
                        <Input
                          placeholder="Rechercher par adresse"
                          value={advancedFilters.adresse || ""}
                          onChange={(e) =>
                            setAdvancedFilters({
                              ...advancedFilters,
                              adresse: e.target.value || undefined,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowFilterPopover(false)}
                      >
                        Annuler
                      </Button>
                      <Button onClick={() => setShowFilterPopover(false)}>
                        Appliquer
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Sorting Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Trier par</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleSort("reference")}
                    className="flex justify-between"
                  >
                    Référence {getSortIcon("reference")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSort("locataire")}
                    className="flex justify-between"
                  >
                    Locataire {getSortIcon("locataire")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSort("bailleur")}
                    className="flex justify-between"
                  >
                    Bailleur {getSortIcon("bailleur")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSort("dateCreation")}
                    className="flex justify-between"
                  >
                    Date de création {getSortIcon("dateCreation")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSort("statut")}
                    className="flex justify-between"
                  >
                    Statut {getSortIcon("statut")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSort("montantImpayes")}
                    className="flex justify-between"
                  >
                    Montant impayés {getSortIcon("montantImpayes")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSort("echeance")}
                    className="flex justify-between"
                  >
                    Échéance {getSortIcon("echeance")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Active filters display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {advancedFilters.montantMin && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Montant min: {advancedFilters.montantMin}€
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        montantMin: undefined,
                      })
                    }
                  />
                </Badge>
              )}
              {advancedFilters.montantMax && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Montant max: {advancedFilters.montantMax}€
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        montantMax: undefined,
                      })
                    }
                  />
                </Badge>
              )}
              {advancedFilters.dateCreationDebut && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Date début:{" "}
                  {new Date(
                    advancedFilters.dateCreationDebut,
                  ).toLocaleDateString("fr-FR")}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        dateCreationDebut: undefined,
                      })
                    }
                  />
                </Badge>
              )}
              {advancedFilters.dateCreationFin && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Date fin:{" "}
                  {new Date(advancedFilters.dateCreationFin).toLocaleDateString(
                    "fr-FR",
                  )}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        dateCreationFin: undefined,
                      })
                    }
                  />
                </Badge>
              )}
              {advancedFilters.echeanceDebut && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Échéance début:{" "}
                  {new Date(advancedFilters.echeanceDebut).toLocaleDateString(
                    "fr-FR",
                  )}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        echeanceDebut: undefined,
                      })
                    }
                  />
                </Badge>
              )}
              {advancedFilters.echeanceFin && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Échéance fin:{" "}
                  {new Date(advancedFilters.echeanceFin).toLocaleDateString(
                    "fr-FR",
                  )}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        echeanceFin: undefined,
                      })
                    }
                  />
                </Badge>
              )}
              {advancedFilters.adresse && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Adresse: {advancedFilters.adresse}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        adresse: undefined,
                      })
                    }
                  />
                </Badge>
              )}
              {activeFiltersCount > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-6 px-2 text-xs"
                >
                  Effacer tout
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("reference")}
                >
                  <div className="flex items-center">
                    Référence
                    {getSortIcon("reference")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("locataire")}
                >
                  <div className="flex items-center">
                    Locataire
                    {getSortIcon("locataire")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("bailleur")}
                >
                  <div className="flex items-center">
                    Bailleur
                    {getSortIcon("bailleur")}
                  </div>
                </TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("dateCreation")}
                >
                  <div className="flex items-center">
                    Date de création
                    {getSortIcon("dateCreation")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("statut")}
                >
                  <div className="flex items-center">
                    Statut
                    {getSortIcon("statut")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("montantImpayes")}
                >
                  <div className="flex items-center">
                    Montant impayés
                    {getSortIcon("montantImpayes")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("echeance")}
                >
                  <div className="flex items-center">
                    Échéance
                    {getSortIcon("echeance")}
                  </div>
                </TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDossiers.length > 0 ? (
                filteredDossiers.map((dossier) => (
                  <TableRow
                    key={dossier.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onViewDossier(dossier.id)}
                  >
                    <TableCell className="font-medium">
                      {dossier.reference}
                    </TableCell>
                    <TableCell>{dossier.locataire}</TableCell>
                    <TableCell>{dossier.bailleur}</TableCell>
                    <TableCell>{dossier.adresse}</TableCell>
                    <TableCell>{dossier.dateCreation}</TableCell>
                    <TableCell>{getStatusBadge(dossier.statut)}</TableCell>
                    <TableCell>
                      {dossier.montantImpayes.toLocaleString("fr-FR")} €
                    </TableCell>
                    <TableCell>{dossier.echeance || "-"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDossier(dossier.id);
                            }}
                          >
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => e.stopPropagation()}
                          >
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => e.stopPropagation()}
                          >
                            Ajouter un document
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => e.stopPropagation()}
                          >
                            Envoyer un message
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    Aucun dossier trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// Données par défaut pour l'affichage
const defaultDossiers: Dossier[] = [
  {
    id: "1",
    reference: "DOS-2023-001",
    locataire: "Martin Dupont",
    bailleur: "SCI Les Oliviers",
    adresse: "15 rue des Lilas, 75020 Paris",
    dateCreation: "15/01/2023",
    statut: "en_cours",
    montantImpayes: 2450,
    echeance: "30/06/2023",
  },
  {
    id: "2",
    reference: "DOS-2023-002",
    locataire: "Sophie Moreau",
    bailleur: "Immobilière du Centre",
    adresse: "8 avenue Victor Hugo, 69003 Lyon",
    dateCreation: "22/02/2023",
    statut: "procedure_judiciaire",
    montantImpayes: 4800,
    echeance: "15/07/2023",
  },
  {
    id: "3",
    reference: "DOS-2023-003",
    locataire: "Jean Leroy",
    bailleur: "OPAC Sud",
    adresse: "24 boulevard Gambetta, 13001 Marseille",
    dateCreation: "10/03/2023",
    statut: "plan_apurement",
    montantImpayes: 1850,
    echeance: "05/08/2023",
  },
  {
    id: "4",
    reference: "DOS-2023-004",
    locataire: "Camille Petit",
    bailleur: "Habitat Social",
    adresse: "3 rue de la Paix, 44000 Nantes",
    dateCreation: "05/04/2023",
    statut: "en_attente",
    montantImpayes: 950,
  },
  {
    id: "5",
    reference: "DOS-2023-005",
    locataire: "Thomas Bernard",
    bailleur: "Résidences Modernes",
    adresse: "17 rue des Fleurs, 67000 Strasbourg",
    dateCreation: "18/04/2023",
    statut: "expulsion_programmee",
    montantImpayes: 6200,
    echeance: "10/06/2023",
  },
  {
    id: "6",
    reference: "DOS-2023-006",
    locataire: "Émilie Roux",
    bailleur: "Groupe Logement",
    adresse: "42 rue du Commerce, 33000 Bordeaux",
    dateCreation: "02/05/2023",
    statut: "resolu",
    montantImpayes: 1200,
  },
];

export default DossiersList;
