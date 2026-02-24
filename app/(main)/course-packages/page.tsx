"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Loader2, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCoursePackages } from "@/hooks/query/use-course-packages";
import {
  useCreateCoursePackage,
  useUpdateCoursePackage,
  useDeleteCoursePackage,
} from "@/hooks/mutation/use-course-package-mutations";
import { CoursePackage } from "@/lib/api/course-packages";
import { showToast } from "@/lib/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PackageFormData {
  name: string;
  numberOfCourses: string;
}

export default function CoursePackagesPage() {
  const { data: packages = [], isLoading } = useCoursePackages();
  const { mutate: createPackage, isPending: isCreating } = useCreateCoursePackage();
  const { mutate: updatePackage, isPending: isUpdating } = useUpdateCoursePackage();
  const { mutate: deletePackage, isPending: isDeleting } = useDeleteCoursePackage();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CoursePackage | null>(null);
  const [form, setForm] = useState<PackageFormData>({ name: "", numberOfCourses: "" });

  const resetForm = () => setForm({ name: "", numberOfCourses: "" });

  const handleCreate = () => {
    const n = parseInt(form.numberOfCourses);
    if (!form.name.trim()) { showToast.error("Name is required"); return; }
    if (!form.numberOfCourses || isNaN(n) || n < 1) { showToast.error("Number of classes must be at least 1"); return; }
    createPackage(
      { name: form.name.trim(), numberOfCourses: n },
      { onSuccess: () => { setCreateDialogOpen(false); resetForm(); } }
    );
  };

  const handleEdit = (pkg: CoursePackage) => {
    setEditingPackage(pkg);
    setForm({ name: pkg.name, numberOfCourses: pkg.numberOfCourses.toString() });
    setEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingPackage) return;
    const n = parseInt(form.numberOfCourses);
    if (!form.name.trim()) { showToast.error("Name is required"); return; }
    if (!form.numberOfCourses || isNaN(n) || n < 1) { showToast.error("Number of classes must be at least 1"); return; }
    updatePackage(
      { id: editingPackage.id, data: { name: form.name.trim(), numberOfCourses: n } },
      { onSuccess: () => { setEditDialogOpen(false); setEditingPackage(null); resetForm(); } }
    );
  };

  const handleDelete = (pkg: CoursePackage) => {
    if (!confirm(`Delete package "${pkg.name}"? This cannot be undone.`)) return;
    deletePackage(pkg.id);
  };

  const isSubmitting = isCreating || isUpdating || isDeleting;

  return (
    <div className="p-6">
      <PageHeader title="Course Packages" />

      <div className="flex justify-end mb-6">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Package
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Create Course Package</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Package Name <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="e.g. Summer Special 5-Pack"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Number of Classes <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 5"
                  value={form.numberOfCourses}
                  onChange={(e) => setForm((f) => ({ ...f, numberOfCourses: e.target.value }))}
                />
                <p className="text-xs text-gray-500">
                  This is the number of TBC class slots that will be created when this package is assigned to a student.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600"
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Package className="h-12 w-12 mb-3" />
          <p className="text-lg font-medium">No course packages yet</p>
          <p className="text-sm">Create your first package template above.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto bg-white rounded-2xl shadow-sm border" style={{ maxWidth: '100vw' }}>
          <Table className="min-w-max w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[50px]">
                  No.
                </TableHead>
                <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[200px]">
                  Package Name
                </TableHead>
                <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[150px]">
                  No. of Classes
                </TableHead>
                <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[150px]">
                  Created Date
                </TableHead>
                <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[100px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg, index) => (
                <TableRow key={pkg.id}>
                  <TableCell className="border-2 h-20 border-gray-300 text-center whitespace-nowrap px-2 min-w-[50px]">
                    {index + 1}
                  </TableCell>
                  <TableCell className="border-2 h-20 border-gray-300 text-center whitespace-nowrap px-2 min-w-[200px]">
                    {pkg.name}
                  </TableCell>
                  <TableCell className="border-2 h-20 border-gray-300 text-center whitespace-nowrap px-2 min-w-[150px]">
                    {pkg.numberOfCourses}
                  </TableCell>
                  <TableCell className="border-2 h-20 border-gray-300 text-center whitespace-nowrap px-2 min-w-[150px]">
                    {new Date(pkg.createdAt).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell className="border-2 h-20 border-gray-300 text-center px-2 min-w-[100px]">
                    <div className="flex justify-center gap-2 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(pkg)} disabled={isSubmitting}>
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(pkg)} disabled={isSubmitting}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Course Package</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Package Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. Summer Special 5-Pack"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Number of Classes <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 5"
                value={form.numberOfCourses}
                onChange={(e) => setForm((f) => ({ ...f, numberOfCourses: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingPackage(null); resetForm(); }}>Cancel</Button>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600"
              onClick={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Pencil className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
