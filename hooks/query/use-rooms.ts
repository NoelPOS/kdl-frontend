import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getAllRooms } from "@/lib/api/rooms";

/**
 * Fetches all rooms.
 * Rooms rarely change so cache for 5 minutes.
 */
export function useRoomList() {
  return useQuery({
    queryKey: queryKeys.rooms.list(),
    queryFn: () => getAllRooms(),
    staleTime: 5 * 60 * 1000,
  });
}
