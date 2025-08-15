import React from "react";
import { Parent } from "@/app/types/parent.type";
import ParentDetailClient from "./parent.detail.left.client";

export default function ParentDetail({ parent }: { parent: Partial<Parent> }) {
  return <ParentDetailClient parent={parent} />;
}
