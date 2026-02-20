"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Input from "@/src/components/ui/Input";
import Select from "@/src/components/ui/Select";
import Label from "@/src/components/ui/Label";
import Button from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/ToastProvider";

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    type: "EXPENSE",
    categoryId: "",
    date: "",
  });

  // Carregar categorias
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  // Carregar dados da transação
  useEffect(() => {
    async function loadTransaction() {
      const res = await fetch(`/api/transactions/${id}`);
      const data = await res.json();

      setForm({
        description: data.description,
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId,
        date: data.date.split("T")[0],
      });

      setLoading(false);
    }

    if (id) loadTransaction();
  }, [id]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setSaving(true);

    await fetch(`/api/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
      }),
    });

    showToast("Transação atualizada com sucesso 🎉", "success");
    router.push("/transactions");
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">
          Carregando transação...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-24">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Editar Transação
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Atualize ou remova esta movimentação
        </p>
      </div>

      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Toggle Tipo */}
          <div className="flex bg-slate-100 rounded-2xl p-1">
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  type: "EXPENSE",
                  categoryId: "",
                })
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
                setForm({
                  ...form,
                  type: "INCOME",
                  categoryId: "",
                })
              }
              className={`flex-1 py-2 rounded-2xl text-sm font-medium transition ${form.type === "INCOME"
                ? "bg-white shadow text-emerald-600"
                : "text-slate-500"
                }`}
            >
              Entrada
            </button>
          </div>

          {/* Valor */}
          <div>
            <Label>Valor</Label>
            <Input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <Label>Descrição</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <Label>Categoria</Label>
            <Select
              value={form.categoryId}
              onChange={(e) =>
                setForm({
                  ...form,
                  categoryId: e.target.value,
                })
              }
              required
            >
              <option value="">Selecione categoria</option>

              {categories
                .filter((c: any) => c.type === form.type)
                .map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </Select>
          </div>

          {/* Data */}
          <div>
            <Label>Data</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
              required
            />
          </div>

          {/* Botões */}
          <div className="pt-2 space-y-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>

            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/transactions")}
            >
              Cancelar
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
