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
import { Search, RefreshCw, BookOpen, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/hooks/use-toast";
import Unauthorized from "../_components/Unauthorized";

interface Tutor {
  id: string;
  userId: string | null;
  userName: string | null;
  src: string | null;
  name: string | null;
  description: string | null;
  instructions: string | null;
  seed: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  categoryId: string | null;
  categoryName: string | null;
}

interface Category {
  id: string;
  name: string | null;
}

function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    categoryId: "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/tutors");
      const data = await response.json();
      if (response.status === 401 || response.status === 403 || data.error) {
        setUnauthorized(true);
        setTutors([]);
      } else if (Array.isArray(data)) {
        setTutors(data);
      } else {
        setTutors([]);
      }
    } catch (error) {
      console.error("Failed to fetch tutors:", error);
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchTutors();
    fetchCategories();
  }, []);

  const handleDelete = async (tutorId: string) => {
    try {
      const response = await fetch(`/api/admin/tutors/${tutorId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Tutor deleted successfully",
        });
        fetchTutors();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tutor",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setEditForm({
      name: tutor.name || "",
      description: tutor.description || "",
      categoryId: tutor.categoryId || "",
    });
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedTutor) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/tutors/${selectedTutor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          categoryId: editForm.categoryId || null,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Tutor updated successfully",
        });
        setIsEditOpen(false);
        setSelectedTutor(null);
        fetchTutors();
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tutor",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredTutors = tutors.filter(
    (tutor) =>
      tutor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (unauthorized) {
    return <Unauthorized />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          AI Tutors Management
        </h1>
        <p className="text-gray-500">View and manage all AI tutors</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tutors</p>
              <p className="text-2xl font-bold">{tutors.length}</p>
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
            <div className="bg-indigo-100 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
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
              placeholder="Search tutors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={fetchTutors}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Tutor</DialogTitle>
              <DialogDescription>
                Update tutor details and configuration.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Tutor Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="mt-2"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Subject/Category</Label>
                <Select
                  value={editForm.categoryId}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, categoryId: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedTutor(null);
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
                  <TableHead>Tutor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTutors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No tutors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTutors.map((tutor) => (
                    <TableRow key={tutor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={tutor.src || ""} />
                            <AvatarFallback>
                              {tutor.name?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{tutor.name}</p>
                            <p className="text-xs text-gray-500 max-w-[200px] truncate">
                              {tutor.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {tutor.categoryName || "Uncategorized"}
                        </span>
                      </TableCell>
                      <TableCell>{tutor.userName || "-"}</TableCell>
                      <TableCell>
                        {tutor.createdAt
                          ? new Date(tutor.createdAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(tutor)}
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Tutor
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{tutor.name}
                                  "? This action cannot be undone and will also
                                  delete all associated messages.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(tutor.id)}
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

export default TutorsPage;
