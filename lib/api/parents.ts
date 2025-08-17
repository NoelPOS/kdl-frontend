import { Parent } from "@/app/types/parent.type";
import { Student } from "@/app/types/student.type";
import { clientApi, createServerApi } from "./config";

export interface ParentChild {
  id: number;
  parentId: number;
  studentId: number;
  isPrimary: boolean;
  student: Student;
}

export interface ParentChildFilter {
  query?: string;
}

export interface ConnectParentStudentData {
  parentId: number;
  studentId: number;
  isPrimary: boolean;
}

// Client-side functions
export async function searchParents(query: string): Promise<Parent[]> {
  const response = await clientApi.get<Parent[]>(
    `/parents/search?name=${encodeURIComponent(query)}`
  );
  return response.data;
}

export async function getParentById(id: number): Promise<Partial<Parent>> {
  return clientApi.get(`/parents/${id}`).then((res) => res.data);
}

export async function updateParentById(id: number, data: Partial<Parent>) {
  return clientApi.put(`/parents/${id}`, data).then((res) => res.data);
}

type NewParentData = Omit<Parent, "id">;

export async function addNewParent(parent: NewParentData): Promise<Parent> {
  const response = await clientApi.post<Parent>("/parents", parent);
  return response.data;
}

export async function getParentsByStudentId(
  studentId: number
): Promise<Parent[]> {
  const response = await clientApi.get<Parent[]>(
    `/parents/by-student/${studentId}`
  );
  return response.data;
}

export async function assignChildrenToParent(
  parentId: number,
  childrenData: { studentIds: number[]; isPrimary?: boolean }
): Promise<void> {
  await clientApi.post(`/parents/${parentId}/children`, childrenData);
}

export async function connectParentToStudent(
  data: ConnectParentStudentData
): Promise<ParentChild> {
  const response = await clientApi.post<ParentChild>(
    "/parents/connections",
    data
  );
  return response.data;
}

export async function getParentChildren(
  parentId: number,
  filter: ParentChildFilter = {},
  page: number = 1,
  limit: number = 12
): Promise<{
  children: ParentChild[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const params = new URLSearchParams();
  if (filter.query) params.set("query", filter.query);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await clientApi.get<{
    children: ParentChild[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/parents/${parentId}/children?${params.toString()}`);
  return response.data;
}

// Server-side functions
export async function fetchParents(
  query?: string,
  child?: string,
  address?: string,
  page: number = 1,
  limit: number = 10,
  accessToken?: string
): Promise<{
  parents: Parent[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const api = await createServerApi(accessToken);
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (child) params.set("child", child);
  if (address) params.set("address", address);
  params.set("page", page.toString());
  params.set("limit", limit.toString());

  const response = await api.get<{
    parents: Parent[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>(`/parents/search?${params.toString()}`);
  return response.data;
}

export async function fetchAllParents(accessToken?: string): Promise<Parent[]> {
  const api = await createServerApi(accessToken);
  const response = await api.get<Parent[]>("/parents/all");
  return response.data;
}
