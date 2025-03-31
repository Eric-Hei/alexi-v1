"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import {
  CalendarDays,
  Home,
  Phone,
  Mail,
  AlertCircle,
  Clock,
  FileText,
} from "lucide-react";

interface DossierInfoCardProps {
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
}

const statusConfig = {
  en_attente: { label: "En attente", variant: "secondary" },
  en_cours: { label: "En cours de traitement", variant: "default" },
  procedure_judiciaire: {
    label: "Procédure judiciaire",
    variant: "destructive",
  },
  plan_apurement: { label: "Plan d'apurement", variant: "outline" },
  resolu: { label: "Résolu", variant: "secondary" },
  expulsion_programmee: {
    label: "Expulsion programmée",
    variant: "destructive",
  },
};

const DossierInfoCard = ({
  dossierNumber = "EXP-2023-1234",
  creationDate = "15/04/2023",
  status = "en_cours",
  tenant = {
    name: "Jean Dupont",
    phone: "06 12 34 56 78",
    email: "jean.dupont@email.com",
    address: "123 Avenue de la République, 75011 Paris",
  },
  landlord = {
    name: "Immobilière du Centre",
    phone: "01 23 45 67 89",
    email: "contact@immobiliere-centre.fr",
  },
  unpaidAmount = 3450,
  unpaidMonths = 3,
  nextDeadline = "30/06/2023",
  nextAction = "Audience au tribunal",
}: DossierInfoCardProps) => {
  const statusInfo = statusConfig[status];

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">
              Dossier {dossierNumber}
            </CardTitle>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <CalendarDays className="h-4 w-4 mr-1" />
              <span>Créé le {creationDate}</span>
            </div>
          </div>
          <Badge
            variant={
              statusInfo.variant as
                | "default"
                | "secondary"
                | "destructive"
                | "outline"
            }
          >
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Locataire */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm uppercase text-gray-500">
            Locataire
          </h4>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tenant.name}`}
                alt={tenant.name}
              />
              <AvatarFallback>
                {tenant.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{tenant.name}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Home className="h-3.5 w-3.5 mr-1" />
                <span>{tenant.address}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <Phone className="h-3.5 w-3.5 mr-1 text-gray-400" />
              <span>{tenant.phone}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-3.5 w-3.5 mr-1 text-gray-400" />
              <span>{tenant.email}</span>
            </div>
          </div>
        </div>

        {/* Bailleur */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm uppercase text-gray-500">
            Bailleur
          </h4>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${landlord.name}`}
                alt={landlord.name}
              />
              <AvatarFallback>
                {landlord.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{landlord.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <Phone className="h-3.5 w-3.5 mr-1 text-gray-400" />
              <span>{landlord.phone}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-3.5 w-3.5 mr-1 text-gray-400" />
              <span>{landlord.email}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t pt-4 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div className="flex items-center gap-2 bg-amber-50 p-3 rounded-md">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm font-medium">Impayés</p>
              <p className="text-sm">
                {unpaidAmount} € ({unpaidMonths} mois)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-md">
            <Clock className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Prochaine échéance</p>
              <p className="text-sm">{nextDeadline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-purple-50 p-3 rounded-md">
            <FileText className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Prochaine action</p>
              <p className="text-sm">{nextAction}</p>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DossierInfoCard;
