export interface DiagnosticSocialFinancier {
  id?: string;
  dossierId: string;
  createdAt?: string;
  updatedAt?: string;

  // Section 1: Situation du locataire
  locataire: {
    nom: string;
    prenom: string;
    dateNaissance?: string;
    adresse: string;
    codePostal: string;
    commune: string;
    situationProfessionnelle?: string;
    depuisLe?: string;
    email?: string;
    telephone?: string;
    situationFamiliale?: string;
    typeLogement?: string;
    personnesACharge?: number;
    mesureProtection?: "tutelle" | "curatelle" | null;
    tuteurNom?: string;
    tuteurPrenom?: string;
    tuteurEmail?: string;
    tuteurTelephone?: string;
  };

  // Section 2: Situation financière du ménage
  situationFinanciere: {
    ressources: {
      salaireLocataire?: number;
      salaireConjoint?: number;
      salaireAutres?: number;
      indemnitesJournalieres?: number;
      indemnitesChomage?: number;
      rsa?: number;
      retraites?: number;
      autresRevenus?: number;
      allocationsLogement?: number;
      autresAllocations?: number;
      pensionsAlimentaires?: number;
      autresRessources?: number;
    };
    charges: {
      loyer?: number;
      chargesLocatives?: number;
      autresChargesLogement?: number;
      assuranceHabitation?: number;
      telephone?: number;
      transports?: number;
      autresAssurances?: number;
      mutuelle?: number;
      pensionsAlimentaires?: number;
      fraisGarde?: number;
      impots?: number;
      credits?: number;
      autresCharges?: number[];
    };
    bilanFinancier?: {
      totalRessources?: number;
      totalCharges?: number;
      resteAVivre?: number;
      tauxEffort?: number;
    };
  };

  // Section 3: Dette locative
  detteLocative: {
    montantDette?: number;
    presenceGarantie?: boolean;
    datePremierImpaye?: string;
    causesImpaye?: string[];
    aidesLogementVersees?: boolean;
    montantAidesLogement?: number;
    aidesLogementSuspendues?: boolean;
    dateAidesLogementSuspendues?: string;
  };

  // Section 4: Solutions d'apurement de la dette
  solutionsApurement: {
    repriseLoyer?: {
      statut: "total" | "partiel" | "irregulier" | "non";
      depuis?: string;
      montantPartiel?: number;
    };
    capaciteRemboursement?: boolean;
    montantRemboursementMensuel?: number;
    dureeRemboursement?: number;
    informationsComplementaires?: string;
    dossierSurendettement?: {
      statut:
        | "nonSouhaite"
        | "envisage"
        | "depose"
        | "refuse"
        | "recevable"
        | "planTraitement"
        | "suspensionCreances"
        | "retablissementPersonnel";
      dateDepot?: string;
      duree?: number;
    };
    dossierFSL?: {
      statut:
        | "nonSouhaite"
        | "enCours"
        | "depose"
        | "refuse"
        | "recevable"
        | "verse";
      dateDepot?: string;
    };
    autresMesures?: string;
  };

  // Section 5: Logement actuel et perspectives de relogement
  logement: {
    typeLogement?: "social" | "prive";
    nombrePieces?: number;
    dateEntree?: string;
    assuranceHabitation?: boolean;
    arreteInsalubrite?: boolean;
    certificatNonDecence?: boolean | null;
    precisions?: string;
    souhaiteMaintien?: boolean;
    demandeLogementSocial?: {
      dateDepot?: string;
      dateRenouvellement?: string;
    };
  };

  // Section 6: Évaluation sociale
  evaluationSociale: {
    bailleurInvite?: boolean;
    locataireParticipe?: boolean;
    contenu?: string;
  };

  // Section 7: Préparation à l'audience
  audience: {
    date?: string;
    heure?: string;
    lieu?: string;
    locataireInformePresence?: boolean;
    locataireInformeJustificatifs?: boolean;
    aideJuridictionnelle?:
      | "nonDemandee"
      | "enCours"
      | "demandee"
      | "accordee"
      | "refusee";
    detteContestee?: {
      loyersNonDus?: boolean;
      chargesNonDues?: boolean;
      fraisHuissiers?: boolean;
      autre?: string;
    };
    saisineCCAPEX?: "nonEnvisagee" | "envisagee" | "realisee";
  };

  // Section 8: Coordonnées du rédacteur
  redacteur?: {
    nom?: string;
    prenom?: string;
    organisme?: string;
    email?: string;
    telephone?: string;
  };
}
