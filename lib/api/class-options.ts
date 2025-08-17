// Class Options API
import { clientApi, createServerApi } from "./config";

export async function getCourseTypes(): Promise<
  {
    id: number;
    classMode: string;
    tuitionFee: number;
    classLimit: number;
  }[]
> {
  const res = await clientApi.get<
    {
      id: number;
      classMode: string;
      tuitionFee: number;
      classLimit: number;
    }[]
  >("class-options");
  return res.data;
}

export async function getClassOptionById(id: number): Promise<{
  id: number;
  classMode: string;
  tuitionFee: number;
  classLimit: number;
}> {
  const res = await clientApi.get<{
    id: number;
    classMode: string;
    tuitionFee: number;
    classLimit: number;
  }>(`/class-options/${id}`);
  return res.data;
}

export async function updateClassOption(
  id: number,
  data: Partial<{
    classMode: string;
    tuitionFee: number;
    classLimit: number;
  }>
): Promise<{
  id: number;
  classMode: string;
  tuitionFee: number;
  classLimit: number;
}> {
  const res = await clientApi.patch<{
    id: number;
    classMode: string;
    tuitionFee: number;
    classLimit: number;
  }>(`/class-options/${id}`, data);
  return res.data;
}

export async function deleteClassOption(id: number): Promise<void> {
  await clientApi.delete(`/class-options/${id}`);
}
