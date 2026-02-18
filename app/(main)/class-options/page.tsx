"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, ChevronDown, PowerOff } from "lucide-react";
import { getAllClassOptions, createClassOption, updateClassOption } from "@/lib/api";
import { ClassOption, CreateClassOptionDto, UpdateClassOptionDto, ClassOptionType } from "@/app/types/class-option.type";
import { showToast } from "@/lib/toast";
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

export default function ClassOptionsPage() {
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deactivatingOption, setDeactivatingOption] = useState<ClassOption | null>(null);
  const [formData, setFormData] = useState<CreateClassOptionDto>({
    classMode: "",
    classLimit: 1,
    tuitionFee: 0,
    effectiveStartDate: new Date().toISOString().split("T")[0],
    optionType: "check",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllClassOptions();
      setClassOptions(data);
    } catch (error) {
      console.error("Failed to fetch class options:", error);
      showToast.error("Failed to load class options");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      classMode: "",
      classLimit: 1,
      tuitionFee: 0,
      effectiveStartDate: new Date().toISOString().split("T")[0],
      optionType: "check",
    });
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.classMode.trim()) {
      showToast.error("Class mode name is required");
      return;
    }
    if (formData.classLimit < 1) {
      showToast.error("Class limit must be at least 1");
      return;
    }
    if (formData.tuitionFee < 0) {
      showToast.error("Tuition fee cannot be negative");
      return;
    }

    setSubmitting(true);
    try {
      await createClassOption(formData);
      showToast.success("Class option created successfully");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Failed to save class option:", error);
      showToast.error("Failed to create class option");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateClick = (option: ClassOption) => {
    setDeactivatingOption(option);
    setDeactivateDialogOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivatingOption) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      await updateClassOption(deactivatingOption.id, { effectiveEndDate: today });
      showToast.success("Class option deactivated successfully");
      setDeactivateDialogOpen(false);
      setDeactivatingOption(null);
      fetchData();
    } catch (error) {
      console.error("Failed to deactivate class option:", error);
      showToast.error("Failed to deactivate class option");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isExpired = (option: ClassOption) => {
    if (!option.effectiveEndDate) return false;
    return new Date(option.effectiveEndDate) < new Date();
  };

  return (
    <div className="p-6">
      <PageHeader title="Class Options Management">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Option
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Class Option</DialogTitle>
              <DialogDescription>
                Creating a new option with an existing name will auto-expire the old one.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="classMode">Class Mode Name</Label>
                <Input
                  id="classMode"
                  placeholder="e.g., Online 1:1, Onsite Group"
                  value={formData.classMode}
                  onChange={(e) => setFormData({ ...formData, classMode: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="optionType">Option Type</Label>
                <div className="relative">
                  <select
                    id="optionType"
                    value={formData.optionType || "check"}
                    onChange={(e) => setFormData({ ...formData, optionType: e.target.value as ClassOptionType })}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm appearance-none"
                  >
                    <option value="camp">Camp (Date Range Selection)</option>
                    <option value="fixed">Fixed (Weekly Schedule)</option>
                    <option value="check">Check/Trial (No Date Selection)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="classLimit">Class Limit</Label>
                  <Input
                    id="classLimit"
                    type="number"
                    min={1}
                    value={formData.classLimit}
                    onChange={(e) => setFormData({ ...formData, classLimit: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tuitionFee">Tuition Fee (฿)</Label>
                  <Input
                    id="tuitionFee"
                    type="number"
                    min={0}
                    value={formData.tuitionFee}
                    onChange={(e) => setFormData({ ...formData, tuitionFee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveStartDate">Effective Start Date</Label>
                <Input
                  id="effectiveStartDate"
                  type="date"
                  value={formData.effectiveStartDate}
                  onChange={(e) => setFormData({ ...formData, effectiveStartDate: e.target.value })}
                />
              </div>

            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                {submitting ? "Saving..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deactivate Class Option?</DialogTitle>
            <DialogDescription>
              This will deactivate &quot;{deactivatingOption?.classMode}&quot; by setting today as its end date.
              Existing sessions using this option will not be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDeactivate}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Versioning:</strong> When you create a new option with the same name as an existing one, 
          the old option will be automatically expired. This preserves pricing history for existing invoices.
        </p>
      </div>

      {/* Class Options Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : classOptions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No class options found. Click &quot;Add New Option&quot; to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border h-20 text-center whitespace-nowrap px-4 font-semibold text-gray-700 bg-gray-50 min-w-[60px]">
                    No.
                  </th>
                  <th className="border h-20 text-center whitespace-nowrap px-4 font-semibold text-gray-700 bg-gray-50">
                    Class Mode
                  </th>
                  <th className="border h-20 text-center whitespace-nowrap px-4 font-semibold text-gray-700 bg-gray-50">
                    Type
                  </th>
                  <th className="border h-20 text-center whitespace-nowrap px-4 font-semibold text-gray-700 bg-gray-50">
                    Limit
                  </th>
                  <th className="border h-20 text-center whitespace-nowrap px-4 font-semibold text-gray-700 bg-gray-50">
                    Tuition Fee
                  </th>
                  <th className="border h-20 text-center whitespace-nowrap px-4 font-semibold text-gray-700 bg-gray-50">
                    Effective Period
                  </th>
                  <th className="border h-20 text-center whitespace-nowrap px-4 font-semibold text-gray-700 bg-gray-50">
                    Status
                  </th>
                  <th className="border h-20 text-center whitespace-nowrap px-4 font-semibold text-gray-700 bg-gray-50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {classOptions.map((option, index) => (
                  <tr
                    key={option.id}
                    className={`hover:bg-gray-50 transition-colors ${isExpired(option) ? "bg-gray-50 opacity-60" : ""}`}
                  >
                    <td className="border h-20 text-center whitespace-nowrap px-4 text-gray-600">
                      {index + 1}
                    </td>
                    <td className="border h-20 text-center whitespace-nowrap px-4">
                      <span className="font-medium text-gray-900">{option.classMode}</span>
                    </td>
                    <td className="border h-20 text-center whitespace-nowrap px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        option.optionType === 'camp' ? 'bg-blue-100 text-blue-800' :
                        option.optionType === 'fixed' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {option.optionType === 'camp' ? 'Camp' :
                         option.optionType === 'fixed' ? 'Fixed' : 'Check'}
                      </span>
                    </td>
                    <td className="border h-20 text-center whitespace-nowrap px-4 text-gray-600">
                      {option.classLimit} {option.classLimit === 1 ? "student" : "students"}
                    </td>
                    <td className="border h-20 text-center whitespace-nowrap px-4">
                      <span className="font-semibold text-gray-900">
                        ฿{option.tuitionFee.toLocaleString()}
                      </span>
                    </td>
                    <td className="border h-20 text-center whitespace-nowrap px-4 text-gray-600">
                      <div className="flex items-center justify-center gap-1 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(option.effectiveStartDate)}
                        {option.effectiveEndDate && (
                          <>
                            <span className="mx-1">→</span>
                            {formatDate(option.effectiveEndDate)}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="border h-20 text-center whitespace-nowrap px-4">
                      {isExpired(option) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="border h-20 text-center whitespace-nowrap px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivateClick(option)}
                          disabled={isExpired(option)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <PowerOff className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
