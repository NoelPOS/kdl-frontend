export interface Room {
  id: number;
  name: string;
}

export interface RoomResponse {
  rooms: Room[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  lastUpdated?: Date;
}
