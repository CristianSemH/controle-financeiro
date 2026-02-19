"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import Button from "@/src/components/ui/Button";

export default function NewGoalPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
  });

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        targetAmount: Number(form.targetAmount),
      }),
    });

    router.push("/goals");
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-24">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Nova Meta
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Defina um objetivo financeiro
        </p>
      </div>

      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Nome */}
          <div>
            <Label>Nome da Meta</Label>
            <Input
              placeholder="Ex: Viagem, Carro, Reserva..."
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          </div>

          {/* Valor */}
          <div>
            <Label>Valor Objetivo</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={form.targetAmount}
              onChange={(e) =>
                setForm({
                  ...form,
                  targetAmount: e.target.value,
                })
              }
              required
            />
          </div>

          {/* Data */}
          <div>
            <Label>Data Limite</Label>
            <Input
              type="date"
              value={form.targetDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  targetDate: e.target.value,
                })
              }
              required
            />
          </div>

          {/* Botão */}
          <Button type="submit" disabled={loading}>
            {loading ? "Criando Meta..." : "Salvar Meta"}
          </Button>

        </form>
      </div>
    </div>
  );
}
