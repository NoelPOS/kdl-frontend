import React from "react";
import { Registrar } from "@/app/types/registrar.type";
import RegistrarDetailClient from "./registrar.detail.left.client";


export default function RegistrarDetail({ registrar }: { registrar: Partial<Registrar> }) {
  return <RegistrarDetailClient registrar={registrar} />;
}
