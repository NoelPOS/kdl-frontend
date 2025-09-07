import { Room } from "@/app/types/room.type";
import { clientApi, createServerApi } from "./config";

// Client-side functions
export async function getAllRooms(): Promise<Room[]> {
  const response = await clientApi.get<Room[]>("/rooms");
//   console.log("rooms are here", response.data);
  return response.data;
}

export async function getRoomById(
  id: number,
  accessToken?: string
): Promise<Room> {
  const api = accessToken ? await createServerApi(accessToken) : clientApi;
  const response = await api.get<Room>(`/rooms/${id}`);
  return response.data;
}

export async function createRoom(roomData: Omit<Room, "id">): Promise<Room> {
  const response = await clientApi.post<Room>("/rooms", roomData);
  return response.data;
}

export async function updateRoom(
  id: number,
  roomData: Partial<Omit<Room, "id">>
): Promise<Room> {
  const response = await clientApi.patch<Room>(`/rooms/${id}`, roomData);
  return response.data;
}

export async function deleteRoom(id: number): Promise<void> {
  await clientApi.delete(`/rooms/${id}`);
}

// Server-side functions
export async function fetchRooms(
  page: number = 1,
  limit: number = 50,
  accessToken?: string
): Promise<{
  rooms: Room[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  lastUpdated?: Date;
}> {
  const api = await createServerApi(accessToken);
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await api.get<{
    rooms: Room[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/rooms?${params.toString()}`);
  
  return {
    ...response.data,
    lastUpdated: response.lastFetched
  };
}
