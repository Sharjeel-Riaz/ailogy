"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Search,
  RefreshCw,
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/hooks/use-toast";
import Unauthorized from "../_components/Unauthorized";

interface Category {
  id: string;
  name: string | null;
  tutorsCount?: number;
}

function SubjectsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [categoryName, setCategoryName] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (response.status === 401 || response.status === 403 || data.error) {
        setUnauthorized(true);
        setCategories([]);
      } else if (Array.isArray(data)) {
        // Fetch tutor counts for each category
        const categoriesWithCounts = await Promise.all(
          data.map(async (cat: Category) => {
            try {
              const detailRes = await fetch(`/api/admin/categories/${cat.id}`);
              const detail = await detailRes.json();
              return { ...cat, tutorsCount: detail.tutorsCount || 0 };
            } catch {
              return { ...cat, tutorsCount: 0 };
            }
          })
        );
        setCategories(categoriesWithCounts);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subject created successfully",
        });
        setIsCreateOpen(false);
        setCategoryName("");
        fetchCategories();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to create");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create subject",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory || !categoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `/api/admin/categories/${selectedCategory.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: categoryName }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subject updated successfully",
        });
        setIsEditOpen(false);
        setSelectedCategory(null);
        setCategoryName("");
        fetchCategories();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update subject",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subject deleted successfully",
        });
        fetchCategories();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setCategoryName(category.name || "");
    setIsEditOpen(true);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (unauthorized) {
    return <Unauthorized />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Subjects & Categories
        </h1>
        <p className="text-gray-500">
          Manage coursework subjects and categories
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <FolderOpen className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Subjects</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tutors</p>
              <p className="text-2xl font-bold">
                {categories.reduce(
                  (acc, cat) => acc + (cat.tutorsCount || 0),
                  0
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border p-6"
      >
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchCategories}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Subject</DialogTitle>
                  <DialogDescription>
                    Add a new subject category for tutors and coursework.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="name">Subject Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Mathematics, Physics, History"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setCategoryName("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={saving}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {saving ? "Creating..." : "Create Subject"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
              <DialogDescription>Update the subject name.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="edit-name">Subject Name</Label>
              <Input
                id="edit-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedCategory(null);
                  setCategoryName("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEdit}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Tutors</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No subjects found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-100 p-2 rounded-lg">
                            <FolderOpen className="h-4 w-4 text-indigo-600" />
                          </div>
                          <span className="font-medium">
                            {category.name || "Unnamed"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {category.tutorsCount || 0} tutors
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-500">
                        {category.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(category)}
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={(category.tutorsCount || 0) > 0}
                              >
                                <Trash2
                                  className={`h-4 w-4 ${
                                    (category.tutorsCount || 0) > 0
                                      ? "text-gray-300"
                                      : "text-red-500"
                                  }`}
                                />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Subject
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {category.name}"? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default SubjectsPage;
