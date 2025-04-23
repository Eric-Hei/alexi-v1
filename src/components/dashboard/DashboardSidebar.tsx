"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  FileText,
  Bell,
  MessageSquare,
  Settings,
  PlusCircle,
  Calendar,
  BarChart3,
  Users,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}

const NavItem = ({
  icon,
  label,
  active = false,
  href = "#",
  onClick,
}: NavItemProps) => {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick && onClick();
      }}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <div className="flex h-5 w-5 items-center justify-center">{icon}</div>
      <span>{label}</span>
    </a>
  );
};

interface DashboardSidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const DashboardSidebar = ({
  className,
  collapsed = false,
  onToggleCollapse = () => {},
}: DashboardSidebarProps) => {
  const [activeItem, setActiveItem] = useState("dossiers");
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onToggleCollapse();
  };

  const handleNavClick = (itemId: string) => {
    setActiveItem(itemId);
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64 lg:w-72",
        className,
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-3">
        {!isCollapsed && (
          <div className="font-semibold text-lg">Gestion Expulsions</div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleCollapse}
          className="ml-auto"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          <TooltipProvider delayDuration={0}>
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeItem === "dashboard" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => handleNavClick("dashboard")}
                      className="h-9 w-9"
                    >
                      <Home className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Tableau de bord</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeItem === "dossiers" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => handleNavClick("dossiers")}
                      className="h-9 w-9"
                    >
                      <FileText className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Dossiers</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeItem === "alertes" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => handleNavClick("alertes")}
                      className="h-9 w-9"
                    >
                      <Bell className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Alertes</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        activeItem === "communications" ? "default" : "ghost"
                      }
                      size="icon"
                      onClick={() => handleNavClick("communications")}
                      className="h-9 w-9"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Communications</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        activeItem === "calendrier" ? "default" : "ghost"
                      }
                      size="icon"
                      onClick={() => handleNavClick("calendrier")}
                      className="h-9 w-9"
                    >
                      <Calendar className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Calendrier</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        activeItem === "statistiques" ? "default" : "ghost"
                      }
                      size="icon"
                      onClick={() => handleNavClick("statistiques")}
                      className="h-9 w-9"
                    >
                      <BarChart3 className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Statistiques</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        activeItem === "intervenants" ? "default" : "ghost"
                      }
                      size="icon"
                      onClick={() => handleNavClick("intervenants")}
                      className="h-9 w-9"
                    >
                      <Users className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Intervenants</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        activeItem === "parametres" ? "default" : "ghost"
                      }
                      size="icon"
                      onClick={() => handleNavClick("parametres")}
                      className="h-9 w-9"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Paramètres</TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <>
                <NavItem
                  icon={<Home className="h-5 w-5" />}
                  label="Tableau de bord"
                  active={activeItem === "dashboard"}
                  onClick={() => handleNavClick("dashboard")}
                />
                <NavItem
                  icon={<FileText className="h-5 w-5" />}
                  label="Dossiers"
                  active={activeItem === "dossiers"}
                  onClick={() => handleNavClick("dossiers")}
                />
                <NavItem
                  icon={<Bell className="h-5 w-5" />}
                  label="Alertes"
                  active={activeItem === "alertes"}
                  onClick={() => handleNavClick("alertes")}
                />
                <NavItem
                  icon={<MessageSquare className="h-5 w-5" />}
                  label="Communications"
                  active={activeItem === "communications"}
                  onClick={() => handleNavClick("communications")}
                />
                <NavItem
                  icon={<Calendar className="h-5 w-5" />}
                  label="Calendrier"
                  active={activeItem === "calendrier"}
                  onClick={() => handleNavClick("calendrier")}
                />
                <NavItem
                  icon={<BarChart3 className="h-5 w-5" />}
                  label="Statistiques"
                  active={activeItem === "statistiques"}
                  onClick={() => handleNavClick("statistiques")}
                />
                <NavItem
                  icon={<Users className="h-5 w-5" />}
                  label="Intervenants"
                  active={activeItem === "intervenants"}
                  onClick={() => handleNavClick("intervenants")}
                />
                <NavItem
                  icon={<Settings className="h-5 w-5" />}
                  label="Paramètres"
                  active={activeItem === "parametres"}
                  onClick={() => handleNavClick("parametres")}
                />
              </>
            )}
          </TooltipProvider>
        </div>
      </ScrollArea>

      <div className="border-t p-3">
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  className="w-full"
                  onClick={() => {
                    const event = new CustomEvent("createDossier");
                    window.dispatchEvent(event);
                  }}
                >
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Nouveau dossier</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            className="w-full"
            onClick={() => {
              const event = new CustomEvent("createDossier");
              window.dispatchEvent(event);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Nouveau dossier
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardSidebar;
