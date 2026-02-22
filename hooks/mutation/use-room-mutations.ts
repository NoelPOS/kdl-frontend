import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { createRoom, updateRoom, deleteRoom } from "@/lib/api/rooms";
import { showToast } from "@/lib/toast";
import type { Room } from "@/app/types/room.type";

/** Create a new room. Invalidates the room list. */
export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Room, "id">) => createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all() });
      showToast.success("Room created successfully");
    },
    onError: (error) => {
      console.error("Failed to create room:", error);
      showToast.error("Failed to create room");
    },
  });
}

/** Update a room by ID. Invalidates the room list. */
export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Omit<Room, "id">>;
    }) => updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all() });
      showToast.success("Room updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update room:", error);
      showToast.error("Failed to update room");
    },
  });
}

/** Delete a room by ID. Uses optimistic removal from the list. */
export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: number) => deleteRoom(roomId),
    onMutate: async (roomId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.rooms.all() });
      const snapshot = queryClient.getQueriesData({
        queryKey: queryKeys.rooms.lists(),
      });
      queryClient.setQueriesData(
        { queryKey: queryKeys.rooms.lists() },
        (old: any) => ({
          ...old,
          rooms: old?.rooms?.filter((r: any) => r.id !== roomId),
        })
      );
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      context?.snapshot.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      );
      showToast.error("Failed to delete room");
    },
    onSuccess: () => {
      showToast.success("Room deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all() });
    },
  });
}
