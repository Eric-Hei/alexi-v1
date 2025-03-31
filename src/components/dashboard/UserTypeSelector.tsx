"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";

export type UserType = "bailleur" | "service-social" | "administration";

interface UserTypeSelectorProps {
  selectedType?: UserType;
  onTypeChange?: (type: UserType) => void;
}

const UserTypeSelector = ({
  selectedType = "bailleur",
  onTypeChange = () => {},
}: UserTypeSelectorProps) => {
  const [activeType, setActiveType] = useState<UserType>(selectedType);

  const handleTypeChange = (type: UserType) => {
    setActiveType(type);
    onTypeChange(type);
  };

  return (
    <div className="w-full bg-background border-b border-border py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground hidden sm:block">
          Vue par profil utilisateur
        </h2>

        <Tabs
          value={activeType}
          onValueChange={(value) => handleTypeChange(value as UserType)}
          className="w-full sm:w-auto"
        >
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex gap-1">
            <TabsTrigger
              value="bailleur"
              className={cn(
                "flex-1 sm:flex-initial",
                activeType === "bailleur"
                  ? "bg-primary text-primary-foreground"
                  : "",
              )}
            >
              Bailleur
            </TabsTrigger>
            <TabsTrigger
              value="service-social"
              className={cn(
                "flex-1 sm:flex-initial",
                activeType === "service-social"
                  ? "bg-primary text-primary-foreground"
                  : "",
              )}
            >
              Service Social
            </TabsTrigger>
            <TabsTrigger
              value="administration"
              className={cn(
                "flex-1 sm:flex-initial",
                activeType === "administration"
                  ? "bg-primary text-primary-foreground"
                  : "",
              )}
            >
              Administration
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default UserTypeSelector;
