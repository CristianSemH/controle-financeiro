"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import Button from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/ToastProvider";


export default function NewCategoryPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "EXPENSE",
  });

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    showToast("Categoria criada com sucesso 🎉", "success");
    router.push("/categories");
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-24">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Nova Categoria
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Organize suas movimentações
        </p>
      </div>

      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Toggle Tipo */}
          <div className="flex bg-slate-100 rounded-2xl p-1">
            <button
              type="button"
              onClick={() =>
                setForm({ ...form, type: "EXPENSE" })
              }
              className={`flex-1 py-2 rounded-2xl text-sm font-medium transition ${form.type === "EXPENSE"
                ? "bg-white shadow text-rose-600"
                : "text-slate-500"
                }`}
            >
              Despesa
            </button>

            <button
              type="button"
              onClick={() =>
                setForm({ ...form, type: "INCOME" })
              }
              className={`flex-1 py-2 rounded-2xl text-sm font-medium transition ${form.type === "INCOME"
                ? "bg-white shadow text-emerald-600"
                : "text-slate-500"
                }`}
            >
              Entrada
            </button>
          </div>

          {/* Nome da categoria */}
          <div>
            <Label>Nome da Categoria</Label>
            <Input
              placeholder="Ex: Alimentação, Salário..."
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          </div>

          {/* Botão */}
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Categoria"}
          </Button>

          <Button
            variant="secondary"
            type="button"
            onClick={() => router.push("/categories")}
          >
            Cancelar
          </Button>

        </form>
      </div>
    </div>
  );
}
