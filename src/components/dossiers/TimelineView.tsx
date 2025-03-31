"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "../../lib/utils";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
} from "lucide-react";

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "document" | "communication" | "deadline" | "status" | "alert";
  status?: "completed" | "pending" | "overdue";
  actor?: string;
}

interface TimelineViewProps {
  events?: TimelineEvent[];
  dossierRef?: string;
  onEventClick?: (eventId: string) => void;
}

const TimelineView = ({
  events = [
    {
      id: "1",
      date: "2023-10-15",
      title: "Signalement d'impayés",
      description: "Premier signalement d'impayés de loyer par le bailleur",
      type: "status",
      status: "completed",
      actor: "Bailleur Social",
    },
    {
      id: "2",
      date: "2023-10-20",
      title: "Envoi du commandement de payer",
      description: "Document officiel envoyé au locataire",
      type: "document",
      status: "completed",
      actor: "Huissier",
    },
    {
      id: "3",
      date: "2023-11-05",
      title: "Diagnostic social",
      description: "Évaluation de la situation sociale du locataire",
      type: "status",
      status: "completed",
      actor: "Service Social",
    },
    {
      id: "4",
      date: "2023-12-10",
      title: "Assignation en justice",
      description: "Convocation du locataire devant le tribunal",
      type: "document",
      status: "pending",
      actor: "Tribunal",
    },
    {
      id: "5",
      date: "2024-01-15",
      title: "Audience au tribunal",
      description: "Décision du juge concernant l'expulsion",
      type: "deadline",
      status: "pending",
      actor: "Tribunal",
    },
    {
      id: "6",
      date: "2023-11-25",
      title: "Alerte de risque élevé",
      description: "Situation critique nécessitant une intervention rapide",
      type: "alert",
      status: "overdue",
      actor: "Système",
    },
  ],
  dossierRef = "EXP-2023-1542",
  onEventClick = () => {},
}: TimelineViewProps) => {
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // Function to get icon based on event type
  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "document":
        return <FileText className="h-5 w-5" />;
      case "communication":
        return <MessageSquare className="h-5 w-5" />;
      case "deadline":
        return <Calendar className="h-5 w-5" />;
      case "status":
        return <CheckCircle className="h-5 w-5" />;
      case "alert":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  // Function to get color based on event status
  const getStatusColor = (status?: TimelineEvent["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-amber-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Chronologie du dossier {dossierRef}</span>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            <span>Ajouter une échéance</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Timeline events */}
          <div className="space-y-6">
            {sortedEvents.map((event, index) => (
              <div
                key={event.id}
                className="relative pl-10 cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors"
                onClick={() => onEventClick(event.id)}
              >
                {/* Event dot */}
                <div className="absolute left-2.5 top-2 -translate-x-1/2 transform">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full border-2 border-white",
                            getStatusColor(event.status),
                          )}
                        >
                          {getEventIcon(event.type)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {event.type.charAt(0).toUpperCase() +
                            event.type.slice(1)}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Event content */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{event.title}</h4>
                    <span className="text-xs text-gray-500">
                      {formatDate(event.date)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">
                    {event.description}
                  </p>
                  {event.actor && (
                    <span className="mt-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {event.actor}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimelineView;
