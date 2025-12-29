"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Eye,
  EyeOff,
  GripVertical,
  Copy,
  ExternalLink,
  FolderPlus,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/hooks/use-toast";
import Image from "next/image";

interface FormField {
  label: string;
  field: string;
  name: string;
  required?: boolean;
}

interface CourseworkTemplate {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  slug: string;
  aiPrompt: string;
  formFields: string;
  isActive: string | boolean;
  sortOrder: number | null;
  createdBy: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface CourseworkCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number | null;
  isActive: string | boolean;
  createdAt: Date | null;
}

// Helper function to check if isActive is truthy (handles both boolean and string)
const isActiveTrue = (value: string | boolean | null | undefined): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  return false;
};

// Popular icon sources for reference
const iconSources = [
  {
    name: "Icons8",
    url: "https://icons8.com/icons",
    example: "https://img.icons8.com/color/96/document.png",
    description:
      "Free icons with direct image URLs. Search, click icon, right-click → Copy image address",
  },
  {
    name: "Flaticon",
    url: "https://www.flaticon.com",
    example: "https://cdn-icons-png.flaticon.com/128/2991/2991148.png",
    description: "Large icon library. Download or copy CDN link",
  },
  {
    name: "IconFinder",
    url: "https://www.iconfinder.com",
    example:
      "https://cdn0.iconfinder.com/data/icons/education-340/64/book-256.png",
    description: "Premium and free icons with direct URLs",
  },
];

// Example icons for quick selection
const exampleIcons = [
  { name: "Document", url: "https://img.icons8.com/color/96/document.png" },
  {
    name: "Edit",
    url: "https://img.icons8.com/external-kiranshastry-gradient-kiranshastry/64/external-edit-interface-kiranshastry-gradient-kiranshastry-1.png",
  },
  {
    name: "Book",
    url: "https://img.icons8.com/pulsar-gradient/96/literature-1.png",
  },
  { name: "Math", url: "https://img.icons8.com/nolan/96/math.png" },
  {
    name: "Science",
    url: "https://img.icons8.com/pulsar-gradient/96/round-bottom-flask.png",
  },
  { name: "Code", url: "https://img.icons8.com/color/96/code.png" },
  { name: "Writing", url: "https://img.icons8.com/color/96/pencil.png" },
  { name: "Research", url: "https://img.icons8.com/color/96/search.png" },
  { name: "Study", url: "https://img.icons8.com/color/96/graduation-cap.png" },
  { name: "Business", url: "https://img.icons8.com/color/96/briefcase.png" },
  {
    name: "AI",
    url: "https://img.icons8.com/color/96/artificial-intelligence.png",
  },
  { name: "Chat", url: "https://img.icons8.com/color/96/chat.png" },
];

export default function CourseworkPage() {
  const [templates, setTemplates] = useState<CourseworkTemplate[]>([]);
  const [categories, setCategories] = useState<CourseworkCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isIconHelperOpen, setIsIconHelperOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<CourseworkTemplate | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    category: "",
    slug: "",
    aiPrompt: "",
    formFields: "[]",
    isActive: "true",
    sortOrder: 0,
  });
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/admin/coursework");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/coursework-categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/coursework-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category created successfully",
        });
        setNewCategory({ name: "", description: "" });
        setIsCategoryModalOpen(false);
        fetchCategories();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to create category",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const handleCreateTemplate = async () => {
    try {
      if (!formData.name || !formData.slug || !formData.aiPrompt) {
        toast({
          title: "Validation Error",
          description: "Name, slug, and AI prompt are required",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/admin/coursework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          formFields: JSON.stringify(formFields),
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Template created successfully",
        });
        setIsCreateOpen(false);
        resetForm();
        fetchTemplates();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to create template",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const response = await fetch(
        `/api/admin/coursework/${selectedTemplate.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            formFields: JSON.stringify(formFields),
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Template updated successfully",
        });
        setIsEditOpen(false);
        resetForm();
        fetchTemplates();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update template",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating template:", error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/coursework/${templateId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Template deleted successfully",
        });
        fetchTemplates();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete template",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (template: CourseworkTemplate) => {
    try {
      const currentlyActive = isActiveTrue(template.isActive);
      const response = await fetch(`/api/admin/coursework/${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: currentlyActive ? "false" : "true",
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Template ${
            currentlyActive ? "disabled" : "enabled"
          } successfully`,
        });
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error toggling template:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "",
      category: "",
      slug: "",
      aiPrompt: "",
      formFields: "[]",
      isActive: "true",
      sortOrder: 0,
    });
    setFormFields([]);
    setSelectedTemplate(null);
  };

  const openEditModal = (template: CourseworkTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      icon: template.icon || "",
      category: template.category || "",
      slug: template.slug,
      aiPrompt: template.aiPrompt,
      formFields: template.formFields,
      isActive: isActiveTrue(template.isActive) ? "true" : "false",
      sortOrder: template.sortOrder || 0,
    });
    try {
      setFormFields(JSON.parse(template.formFields || "[]"));
    } catch {
      setFormFields([]);
    }
    setIsEditOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const addFormField = () => {
    setFormFields([
      ...formFields,
      { label: "", field: "input", name: "", required: true },
    ]);
  };

  const removeFormField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const updateFormField = (index: number, key: keyof FormField, value: any) => {
    const updated = [...formFields];
    updated[index] = { ...updated[index], [key]: value };
    setFormFields(updated);
  };

  const duplicateTemplate = (template: CourseworkTemplate) => {
    setFormData({
      name: `${template.name} (Copy)`,
      description: template.description || "",
      icon: template.icon || "",
      category: template.category || "",
      slug: `${template.slug}-copy`,
      aiPrompt: template.aiPrompt,
      formFields: template.formFields,
      isActive: "true",
      sortOrder: (template.sortOrder || 0) + 1,
    });
    try {
      setFormFields(JSON.parse(template.formFields || "[]"));
    } catch {
      setFormFields([]);
    }
    setIsCreateOpen(true);
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TemplateFormModal = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Template Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => {
              setFormData({
                ...formData,
                name: e.target.value,
                slug: isEdit ? formData.slug : generateSlug(e.target.value),
              });
            }}
            placeholder="e.g., Essay Writer"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e.g., essay-writer"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Brief description of this template..."
          rows={2}
        />
      </div>

      {/* Icon Section with Helper */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="icon">Icon URL</Label>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => setIsIconHelperOpen(true)}
            className="text-red-600 h-auto p-0"
          >
            <ImageIcon className="h-3 w-3 mr-1" /> How to get icon URLs?
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="https://img.icons8.com/color/96/document.png"
            className="flex-1"
          />
          {formData.icon && (
            <div className="flex items-center justify-center w-10 h-10 border rounded bg-gray-50">
              <img
                src={formData.icon}
                alt="Preview"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://img.icons8.com/color/96/file.png";
                }}
              />
            </div>
          )}
        </div>
        {/* Quick Icon Selection */}
        <div className="flex flex-wrap gap-1 mt-2">
          {exampleIcons.slice(0, 6).map((icon) => (
            <button
              key={icon.name}
              type="button"
              onClick={() => setFormData({ ...formData, icon: icon.url })}
              className={`p-1 border rounded hover:bg-gray-100 ${
                formData.icon === icon.url ? "border-red-500 bg-red-50" : ""
              }`}
              title={icon.name}
            >
              <img src={icon.url} alt={icon.name} className="w-6 h-6" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsIconHelperOpen(true)}
            className="p-1 border rounded hover:bg-gray-100 text-xs text-gray-500 px-2"
          >
            More...
          </button>
        </div>
      </div>

      {/* Category with Create Option */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="category">Category</Label>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => setIsCategoryModalOpen(true)}
              className="text-red-600 h-auto p-0"
            >
              <FolderPlus className="h-3 w-3 mr-1" /> New Category
            </Button>
          </div>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="Writing">Writing</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Study">Study</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Coding">Coding</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) =>
              setFormData({
                ...formData,
                sortOrder: parseInt(e.target.value) || 0,
              })
            }
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="isActive">Status</Label>
        <Select
          value={formData.isActive}
          onValueChange={(value) =>
            setFormData({ ...formData, isActive: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="aiPrompt">AI Prompt *</Label>
        <Textarea
          id="aiPrompt"
          value={formData.aiPrompt}
          onChange={(e) =>
            setFormData({ ...formData, aiPrompt: e.target.value })
          }
          placeholder="Enter the AI prompt template. Use placeholders like {topic}, {subject}, etc."
          rows={5}
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          Use {"{fieldName}"} to reference form field values in your prompt.
          Example: "Write an essay about {"{topic}"} covering {"{keyPoints}"}"
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Form Fields</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFormField}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Field
          </Button>
        </div>
        <div className="space-y-3 border rounded-lg p-3 bg-gray-50">
          {formFields.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No form fields added. Click "Add Field" to create form inputs that
              users will fill in.
            </p>
          ) : (
            formFields.map((field, index) => (
              <div
                key={index}
                className="flex items-start gap-2 bg-white p-3 rounded border"
              >
                <GripVertical className="h-5 w-5 text-gray-400 mt-2 cursor-move" />
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Label (e.g., Essay Topic)"
                    value={field.label}
                    onChange={(e) =>
                      updateFormField(index, "label", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Field name (e.g., topic)"
                    value={field.name}
                    onChange={(e) =>
                      updateFormField(index, "name", e.target.value)
                    }
                  />
                  <Select
                    value={field.field}
                    onValueChange={(value) =>
                      updateFormField(index, "field", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="input">Text Input</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFormField(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Coursework Templates
          </h1>
          <p className="text-gray-600">
            Manage AI coursework templates for the user dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            <FolderPlus className="h-4 w-4 mr-2" /> New Category
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => resetForm()}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Add a new AI coursework template for users
                </DialogDescription>
              </DialogHeader>
              <TemplateFormModal />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleCreateTemplate}
                >
                  Create Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-2">
            Total: {templates.length}
          </Badge>
          <Badge
            variant="outline"
            className="px-3 py-2 bg-green-50 text-green-700"
          >
            Active: {templates.filter((t) => isActiveTrue(t.isActive)).length}
          </Badge>
          <Badge
            variant="outline"
            className="px-3 py-2 bg-gray-50 text-gray-700"
          >
            Inactive:{" "}
            {templates.filter((t) => !isActiveTrue(t.isActive)).length}
          </Badge>
        </div>
      </div>

      {/* Info Banner */}
      {templates.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">Getting Started</h3>
          <p className="text-blue-700 text-sm mb-2">
            Create your first coursework template to replace the hardcoded
            templates. Templates you create here will appear in the user
            dashboard.
          </p>
          <p className="text-blue-700 text-sm">
            <strong>Tip:</strong> Use the "How to get icon URLs?" link when
            creating a template to learn where to find free icon images.
          </p>
        </div>
      )}

      {/* Templates Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Fields</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTemplates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  {searchQuery
                    ? "No templates found matching your search"
                    : "No templates created yet. Click 'Add Template' to create one."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates.map((template, index) => {
                let fieldCount = 0;
                try {
                  fieldCount = JSON.parse(template.formFields || "[]").length;
                } catch {
                  fieldCount = 0;
                }

                return (
                  <TableRow key={template.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-500">
                      {template.sortOrder || index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {template.icon && (
                          <img
                            src={template.icon}
                            alt=""
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        )}
                        <div>
                          <div className="font-medium">{template.name}</div>
                          {template.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {template.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {template.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {template.category || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{fieldCount} fields</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          isActiveTrue(template.isActive)
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {isActiveTrue(template.isActive)
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(template)}
                          title={
                            isActiveTrue(template.isActive)
                              ? "Disable"
                              : "Enable"
                          }
                        >
                          {isActiveTrue(template.isActive) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateTemplate(template)}
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Template
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{template.name}
                                "? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() =>
                                  handleDeleteTemplate(template.id)
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Categories List */}
      {categories.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Your Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge key={cat.id} variant="outline" className="px-3 py-1">
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update the template details and form fields
            </DialogDescription>
          </DialogHeader>
          <TemplateFormModal isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleUpdateTemplate}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a custom category to organize your templates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="catName">Category Name *</Label>
              <Input
                id="catName"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                placeholder="e.g., Mathematics, Science, History"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catDesc">Description (optional)</Label>
              <Textarea
                id="catDesc"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
                placeholder="Brief description of this category..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleCreateCategory}
            >
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Icon Helper Modal */}
      <Dialog open={isIconHelperOpen} onOpenChange={setIsIconHelperOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>How to Get Icon URLs</DialogTitle>
            <DialogDescription>
              Use free icon websites to find and copy icon URLs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Icon Sources */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">
                Recommended Icon Sources
              </h4>
              {iconSources.map((source) => (
                <div key={source.name} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{source.name}</h5>
                      <p className="text-sm text-gray-500">
                        {source.description}
                      </p>
                    </div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="mt-2 bg-gray-50 rounded p-2">
                    <code className="text-xs break-all text-gray-600">
                      {source.example}
                    </code>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Icons */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Quick Select Icons</h4>
              <div className="grid grid-cols-4 gap-2">
                {exampleIcons.map((icon) => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, icon: icon.url });
                      setIsIconHelperOpen(false);
                    }}
                    className="flex flex-col items-center gap-1 p-2 border rounded hover:bg-gray-50"
                  >
                    <img src={icon.url} alt={icon.name} className="w-8 h-8" />
                    <span className="text-xs text-gray-600">{icon.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h5 className="font-medium text-yellow-800 mb-1">
                How to Copy Icon URL
              </h5>
              <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                <li>Go to one of the icon websites above</li>
                <li>
                  Search for the icon you want (e.g., "document", "book",
                  "math")
                </li>
                <li>Right-click on the icon image</li>
                <li>Select "Copy image address" or "Copy image URL"</li>
                <li>Paste the URL in the Icon URL field</li>
              </ol>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsIconHelperOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
