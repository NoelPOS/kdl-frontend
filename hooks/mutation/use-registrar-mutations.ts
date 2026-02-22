import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  addNewRegistrar,
  updateRegistrarById,
  deleteRegistrarById,
} from "@/lib/api/registrars";
import { showToast } from "@/lib/toast";
import type { Registrar } from "@/app/types/registrar.type";

type NewRegistrarData = Omit<Registrar, "id"> & { password: string };

/** Create a new registrar. Invalidates the registrar list on success. */
export function useCreateRegistrar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NewRegistrarData) => addNewRegistrar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.registrars.lists() });
      showToast.success("Registrar created successfully");
    },
    onError: (error) => {
      console.error("Failed to create registrar:", error);
      showToast.error("Failed to create registrar");
    },
  });
}

/** Update a registrar by ID. Invalidates list and detail caches. */
export function useUpdateRegistrar(registrarId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Registrar>) =>
      updateRegistrarById(registrarId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.registrars.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.registrars.detail(String(registrarId)),
      });
      showToast.success("Registrar updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update registrar:", error);
      showToast.error("Failed to update registrar");
    },
  });
}

/** Remove registrar access (sets role to "none"). Invalidates all registrar queries. */
export function useDeleteRegistrar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (registrarId: number) => deleteRegistrarById(registrarId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.registrars.all() });
      showToast.success("Registrar removed successfully");
    },
    onError: (error) => {
      console.error("Failed to remove registrar:", error);
      showToast.error("Failed to remove registrar");
    },
  });
}
