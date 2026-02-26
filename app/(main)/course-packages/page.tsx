"use client";

import { useState } from "react";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Loader2, Package, PowerOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  useDeactivateCoursePackage,
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

interface CreateFormData {
  name: string;
  numberOfCourses: string;
  effectiveStartDate: string;
}

const isExpired = (pkg: CoursePackage): boolean => {
  if (!pkg.effectiveEndDate) return false;
  return new Date(pkg.effectiveEndDate) < new Date();
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function CoursePackagesPage() {
  const { data: packages = [], isLoading } = useCoursePackages();
  const { mutate: createPackage, isPending: isCreating } = useCreateCoursePackage();
  const { mutate: deactivatePackage, isPending: isDeactivating } = useDeactivateCoursePackage();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deactivatingPackage, setDeactivatingPackage] = useState<CoursePackage | null>(null);
  const [form, setForm] = useState<CreateFormData>({
    name: "",
    numberOfCourses: "",
    effectiveStartDate: new Date().toISOString().split("T")[0],
  });

  const resetForm = () =>
    setForm({
      name: "",
      numberOfCourses: "",
      effectiveStartDate: new Date().toISOString().split("T")[0],
    });

  const handleCreate = () => {
    const n = parseInt(form.numberOfCourses);
    if (!form.name.trim()) { showToast.error("Name is required"); return; }
    if (!form.numberOfCourses || isNaN(n) || n < 1) { showToast.error("Number of classes must be at least 1"); return; }
    if (!form.effectiveStartDate) { showToast.error("Effective start date is required"); return; }
    createPackage(
      { name: form.name.trim(), numberOfCourses: n, effectiveStartDate: form.effectiveStartDate },
      { onSuccess: () => { setCreateDialogOpen(false); resetForm(); } }
    );
  };

  const handleDeactivateClick = (pkg: CoursePackage) => {
    setDeactivatingPackage(pkg);
    setDeactivateDialogOpen(true);
  };

  const handleConfirmDeactivate = () => {
    if (!deactivatingPackage) return;
    deactivatePackage(deactivatingPackage.id, {
      onSuccess: () => {
        setDeactivateDialogOpen(false);
        setDeactivatingPackage(null);
      },
    });
  };

  return (
    <div className="p-6">
      <PageHeader title="Course Packages">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => { resetForm(); setCreateDialogOpen(true); }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Package
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Create Course Package</DialogTitle>
              <DialogDescription>
                Creating a new package with the same name as an existing active one will automatically expire the old version.
              </DialogDescription>
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
                  Number of TBC class slots created when this package is assigned to a student.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Effective Start Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={form.effectiveStartDate}
                  onChange={(e) => setForm((f) => ({ ...f, effectiveStartDate: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
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
      </PageHeader>

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deactivate Package Version?</DialogTitle>
            <DialogDescription>
              This will deactivate &quot;{deactivatingPackage?.name}&quot; by setting today as its end date.
              Existing sessions that use this package will not be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDeactivate}
              disabled={isDeactivating}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeactivating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Versioning:</strong> When you create a new package with the same name as an existing active one,
          the old version is automatically expired. Historical sessions referencing the old version remain intact.
        </p>
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
        <div className="w-full overflow-x-auto bg-white rounded-2xl shadow-sm border" style={{ maxWidth: "100vw" }}>
          <Table className="min-w-max w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[50px]">
                  No.
                </TableHead>
                <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[200px]">
                  Package Name
                </TableHead>
                <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[130px]">
                  No. of Classes
                </TableHead>
                <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[220px]">
                  Effective Period
                </TableHead>
                <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[100px]">
                  Status
                </TableHead>
                <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[100px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg, index) => (
                <TableRow
                  key={pkg.id}
                  className={isExpired(pkg) ? "bg-gray-50 opacity-60" : ""}
                >
                  <TableCell className="border-2 h-20 border-gray-300 text-center whitespace-nowrap px-2 min-w-[50px]">
                    {index + 1}
                  </TableCell>
                  <TableCell className="border-2 h-20 border-gray-300 text-center whitespace-nowrap px-2 min-w-[200px]">
                    {pkg.name}
                  </TableCell>
                  <TableCell className="border-2 h-20 border-gray-300 text-center whitespace-nowrap px-2 min-w-[130px]">
                    {pkg.numberOfCourses}
                  </TableCell>
                  <TableCell className="border-2 h-20 border-gray-300 text-center whitespace-nowrap px-2 min-w-[220px]">
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      {formatDate(pkg.effectiveStartDate)}
                      {pkg.effectiveEndDate && (
                        <>
                          <span className="mx-1">→</span>
                          {formatDate(pkg.effectiveEndDate)}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="border-2 h-20 border-gray-300 text-center whitespace-nowrap px-2 min-w-[100px]">
                    {isExpired(pkg) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Expired
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="border-2 h-20 border-gray-300 text-center px-2 min-w-[100px]">
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeactivateClick(pkg)}
                        disabled={isExpired(pkg) || isDeactivating}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Deactivate this package version"
                      >
                        <PowerOff className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
