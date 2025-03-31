"use client";

import React, { useState } from "react";
import {
  Send,
  FileText,
  Phone,
  Video,
  User,
  Users,
  Filter,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { cn } from "../../lib/utils";

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
}

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  lastActive?: Date;
  status?: "online" | "offline" | "away";
}

interface CommunicationPanelProps {
  dossierID?: string;
  messages?: Message[];
  contacts?: Contact[];
  onSendMessage?: (message: string, attachments?: File[]) => void;
  onStartCall?: (contactID: string, isVideo: boolean) => void;
}

const CommunicationPanel = ({
  dossierID = "DOS-2023-001",
  messages: initialMessages = [
    {
      id: "1",
      sender: {
        id: "user1",
        name: "Marie Dupont",
        role: "Assistante Sociale",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie",
      },
      content:
        "Bonjour, j'ai contacté le locataire concernant les impayés. Il souhaite mettre en place un plan d'apurement.",
      timestamp: new Date(2023, 5, 15, 10, 30),
    },
    {
      id: "2",
      sender: {
        id: "user2",
        name: "Jean Martin",
        role: "Bailleur",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jean",
      },
      content:
        "Merci pour cette information. Pouvez-vous me transmettre sa proposition de plan d'apurement ?",
      timestamp: new Date(2023, 5, 15, 11, 45),
    },
    {
      id: "3",
      sender: {
        id: "user3",
        name: "Sophie Leclerc",
        role: "CCAPEX",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
      },
      content:
        "Une réunion de la commission est prévue le 25 juin. Nous examinerons ce dossier en priorité.",
      timestamp: new Date(2023, 5, 16, 9, 15),
      attachments: [
        {
          id: "att1",
          name: "convocation_commission.pdf",
          type: "application/pdf",
          url: "#",
        },
      ],
    },
  ],
  contacts: initialContacts = [
    {
      id: "user1",
      name: "Marie Dupont",
      role: "Assistante Sociale",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie",
      status: "online",
    },
    {
      id: "user2",
      name: "Jean Martin",
      role: "Bailleur",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jean",
      status: "offline",
    },
    {
      id: "user3",
      name: "Sophie Leclerc",
      role: "CCAPEX",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
      status: "away",
    },
    {
      id: "user4",
      name: "Thomas Bernard",
      role: "Préfecture",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
      status: "offline",
    },
  ],
  onSendMessage = () => {},
  onStartCall = () => {},
}: CommunicationPanelProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("messages");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      sender: {
        id: "currentUser",
        name: "Vous",
        role: "Utilisateur actuel",
      },
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
    onSendMessage(newMessage);
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId],
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="w-full h-full bg-white shadow-md">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Communications</CardTitle>
            <CardDescription>Dossier {dossierID}</CardDescription>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <TabsContent value="messages" className="m-0">
        <div className="flex flex-col h-[350px]">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 max-w-[80%]",
                  message.sender.id === "currentUser"
                    ? "ml-auto flex-row-reverse"
                    : "",
                )}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {message.sender.avatar ? (
                    <AvatarImage
                      src={message.sender.avatar}
                      alt={message.sender.name}
                    />
                  ) : (
                    <AvatarFallback>
                      {message.sender.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div
                    className={cn(
                      "rounded-lg p-3",
                      message.sender.id === "currentUser"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                    )}
                  >
                    <div className="font-semibold text-xs flex justify-between">
                      <span>{message.sender.name}</span>
                      <span className="text-xs opacity-70">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{message.content}</p>
                  </div>

                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-1 text-xs bg-muted rounded-full px-3 py-1"
                        >
                          <FileText size={12} />
                          <span>{attachment.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>

          <CardFooter className="border-t p-3">
            <div className="flex w-full gap-2">
              <Button variant="outline" size="icon" className="flex-shrink-0">
                <FileText size={18} />
              </Button>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrivez votre message ici..."
                className="min-h-[40px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="flex-shrink-0"
              >
                <Send size={18} />
              </Button>
            </div>
          </CardFooter>
        </div>
      </TabsContent>

      <TabsContent value="contacts" className="m-0">
        <div className="flex flex-col h-[350px]">
          <div className="p-3 border-b flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex gap-1 items-center"
              >
                <Filter size={14} />
                <span>Filtrer</span>
              </Button>
              {selectedContacts.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex gap-1 items-center"
                  >
                    <Phone size={14} />
                    <span>Appel</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex gap-1 items-center"
                  >
                    <Video size={14} />
                    <span>Visio</span>
                  </Button>
                </>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {initialContacts.filter((c) => c.status === "online").length} en
              ligne
            </div>
          </div>

          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y">
              {initialContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={cn(
                    "flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer",
                    selectedContacts.includes(contact.id) ? "bg-muted/70" : "",
                  )}
                  onClick={() => toggleContactSelection(contact.id)}
                >
                  <div className="relative">
                    <Avatar>
                      {contact.avatar ? (
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                      ) : (
                        <AvatarFallback>
                          {contact.name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                        contact.status === "online"
                          ? "bg-green-500"
                          : contact.status === "away"
                            ? "bg-yellow-500"
                            : "bg-gray-300",
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {contact.role}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartCall(contact.id, false);
                      }}
                    >
                      <Phone size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartCall(contact.id, true);
                      }}
                    >
                      <Video size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      </TabsContent>
    </Card>
  );
};

export default CommunicationPanel;
