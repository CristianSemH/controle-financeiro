"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import Button from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/ToastProvider";
import CardForm from "@/src/components/ui/CardForm";

export default function EditCategoryPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { showToast } = useToast();

    const [form, setForm] = useState({
        name: "",
        type: "EXPENSE",
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadCategory() {
            const res = await fetch(`/api/categories/${id}`);
            const data = await res.json();

            setForm({
                name: data.name,
                type: data.type,
            });
        }

        if (id) loadCategory();
    }, [id]);

    async function handleSubmit(e: any) {
        e.preventDefault();
        setSaving(true);

        await fetch(`/api/categories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        showToast("Categoria atualizada com sucesso 🎉", "success");
        router.push("/categories");
    }

    return (
        <CardForm title="Editar Categoria" description="Atualize ou remova esta categoria">
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

                {/* Nome */}
                <div>
                    <Label>Nome da Categoria</Label>
                    <Input
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
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
                        onClick={() => router.push("/categories")}
                    >
                        Cancelar
                    </Button>
                </div>

            </form>
        </CardForm>
    );
}
