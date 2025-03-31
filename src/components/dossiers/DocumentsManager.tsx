"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Edit,
  FolderPlus,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  uploadDate: string;
  size: string;
  status: "Validé" | "En attente" | "Rejeté";
}

interface DocumentsManagerProps {
  dossierId?: string;
  documents?: Document[];
  onUpload?: (file: File) => void;
  onDelete?: (documentId: string) => void;
  onView?: (documentId: string) => void;
  onDownload?: (documentId: string) => void;
  onCategorize?: (documentId: string, category: string) => void;
}

export default function DocumentsManager({
  dossierId = "DOC-2023-001",
  documents = [
    {
      id: "doc1",
      name: "Assignation_tribunal.pdf",
      type: "PDF",
      category: "Procédure judiciaire",
      uploadDate: "2023-10-15",
      size: "1.2 MB",
      status: "Validé",
    },
    {
      id: "doc2",
      name: "Diagnostic_social.docx",
      type: "DOCX",
      category: "Évaluation sociale",
      uploadDate: "2023-10-10",
      size: "850 KB",
      status: "En attente",
    },
    {
      id: "doc3",
      name: "Demande_delai_paiement.pdf",
      type: "PDF",
      category: "Correspondance",
      uploadDate: "2023-09-28",
      size: "420 KB",
      status: "Validé",
    },
    {
      id: "doc4",
      name: "Rapport_visite_logement.pdf",
      type: "PDF",
      category: "Évaluation technique",
      uploadDate: "2023-09-15",
      size: "1.5 MB",
      status: "Rejeté",
    },
  ],
  onUpload = () => {},
  onDelete = () => {},
  onView = () => {},
  onDownload = () => {},
  onCategorize = () => {},
}: DocumentsManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(
    "Procédure judiciaire",
  );

  const categories = [
    "Procédure judiciaire",
    "Évaluation sociale",
    "Correspondance",
    "Évaluation technique",
    "Documents administratifs",
    "Aides financières",
  ];

  const filteredDocuments = documents.filter((doc) => {
    // Filter by search term
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "validated" && doc.status === "Validé") ||
      (activeTab === "pending" && doc.status === "En attente") ||
      (activeTab === "rejected" && doc.status === "Rejeté");

    return matchesSearch && matchesTab;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
      setIsUploadDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Validé":
        return "text-green-600 bg-green-100";
      case "En attente":
        return "text-amber-600 bg-amber-100";
      case "Rejeté":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getFileIcon = (type: string) => {
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>Documents du dossier {dossierId}</CardTitle>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Ajouter un document
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un document..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" /> Filtrer
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FolderPlus className="mr-2 h-4 w-4" /> Catégories
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {categories.map((category) => (
                      <DropdownMenuItem key={category}>
                        {category}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-4 w-full max-w-md">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="validated">Validés</TabsTrigger>
                <TabsTrigger value="pending">En attente</TabsTrigger>
                <TabsTrigger value="rejected">Rejetés</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-3">Document</th>
                        <th className="px-4 py-3">Catégorie</th>
                        <th className="px-4 py-3">Date d'ajout</th>
                        <th className="px-4 py-3">Taille</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((doc) => (
                          <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {getFileIcon(doc.type)}
                                <span className="ml-2 font-medium">
                                  {doc.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {doc.category}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {doc.uploadDate}
                            </td>
                            <td className="px-4 py-3 text-sm">{doc.size}</td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(doc.status)}`}
                              >
                                {doc.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onView(doc.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDownload(doc.id)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => onView(doc.id)}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />{" "}
                                      Visualiser
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => onDownload(doc.id)}
                                    >
                                      <Download className="mr-2 h-4 w-4" />{" "}
                                      Télécharger
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 h-4 w-4" /> Modifier
                                      la catégorie
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => onDelete(doc.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />{" "}
                                      Supprimer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-sm text-gray-500"
                          >
                            Aucun document trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="validated" className="mt-4">
                <div className="overflow-x-auto">
                  {/* Same table structure as above, filtered for validated documents */}
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-3">Document</th>
                        <th className="px-4 py-3">Catégorie</th>
                        <th className="px-4 py-3">Date d'ajout</th>
                        <th className="px-4 py-3">Taille</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((doc) => (
                          <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {getFileIcon(doc.type)}
                                <span className="ml-2 font-medium">
                                  {doc.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {doc.category}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {doc.uploadDate}
                            </td>
                            <td className="px-4 py-3 text-sm">{doc.size}</td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(doc.status)}`}
                              >
                                {doc.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onView(doc.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDownload(doc.id)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => onView(doc.id)}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />{" "}
                                      Visualiser
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => onDownload(doc.id)}
                                    >
                                      <Download className="mr-2 h-4 w-4" />{" "}
                                      Télécharger
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 h-4 w-4" /> Modifier
                                      la catégorie
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => onDelete(doc.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />{" "}
                                      Supprimer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-sm text-gray-500"
                          >
                            Aucun document validé trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                {/* Similar table structure for pending documents */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-3">Document</th>
                        <th className="px-4 py-3">Catégorie</th>
                        <th className="px-4 py-3">Date d'ajout</th>
                        <th className="px-4 py-3">Taille</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((doc) => (
                          <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {getFileIcon(doc.type)}
                                <span className="ml-2 font-medium">
                                  {doc.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {doc.category}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {doc.uploadDate}
                            </td>
                            <td className="px-4 py-3 text-sm">{doc.size}</td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(doc.status)}`}
                              >
                                {doc.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onView(doc.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDownload(doc.id)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => onView(doc.id)}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />{" "}
                                      Visualiser
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => onDownload(doc.id)}
                                    >
                                      <Download className="mr-2 h-4 w-4" />{" "}
                                      Télécharger
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 h-4 w-4" /> Modifier
                                      la catégorie
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => onDelete(doc.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />{" "}
                                      Supprimer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-sm text-gray-500"
                          >
                            Aucun document en attente trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="rejected" className="mt-4">
                {/* Similar table structure for rejected documents */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-3">Document</th>
                        <th className="px-4 py-3">Catégorie</th>
                        <th className="px-4 py-3">Date d'ajout</th>
                        <th className="px-4 py-3">Taille</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((doc) => (
                          <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {getFileIcon(doc.type)}
                                <span className="ml-2 font-medium">
                                  {doc.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {doc.category}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {doc.uploadDate}
                            </td>
                            <td className="px-4 py-3 text-sm">{doc.size}</td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(doc.status)}`}
                              >
                                {doc.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onView(doc.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDownload(doc.id)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => onView(doc.id)}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />{" "}
                                      Visualiser
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => onDownload(doc.id)}
                                    >
                                      <Download className="mr-2 h-4 w-4" />{" "}
                                      Télécharger
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 h-4 w-4" /> Modifier
                                      la catégorie
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => onDelete(doc.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />{" "}
                                      Supprimer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-sm text-gray-500"
                          >
                            Aucun document rejeté trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Upload Document Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="file-upload" className="text-sm font-medium">
                Sélectionner un fichier
              </label>
              <Input id="file-upload" type="file" onChange={handleFileChange} />
              {selectedFile && (
                <p className="text-sm text-gray-500">
                  Fichier sélectionné: {selectedFile.name} (
                  {Math.round(selectedFile.size / 1024)} KB)
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium">
                Catégorie du document
              </label>
              <select
                id="category"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile}>
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
