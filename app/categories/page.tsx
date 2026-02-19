"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag, ArrowDownCircle, ArrowUpCircle, Plus, Pencil, Trash2 } from "lucide-react";
import ConfirmModal from "@/src/components/ui/ConfirmModal";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    async function loadCategories() {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
        setLoading(false);
    }

    async function confirmDelete() {
        if (!deleteId) return;

        await fetch(`/api/categories/${deleteId}`, {
            method: "DELETE",
        });

        setDeleteId(null);
        loadCategories();
    }

    useEffect(() => {
        loadCategories();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-400 animate-pulse">
                    Carregando categorias...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-24">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">
                        Categorias
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Organize suas movimentações
                    </p>
                </div>

                <Link
                    href="/categories/new"
                    className="
            flex items-center gap-2
            bg-indigo-600
            text-white
            px-4 py-2
            rounded-2xl
            text-sm
            shadow-sm
            hover:bg-indigo-700
            transition
          "
                >
                    <Plus size={16} />
                    Nova
                </Link>
            </div>

            {/* Lista */}
            {categories.length === 0 && (
                <div className="
          bg-white
          rounded-2xl
          border border-slate-100
          shadow-sm
          p-8
          text-center
        ">
                    <Tag className="mx-auto text-slate-300 mb-3" size={28} />
                    <p className="text-sm text-slate-500">
                        Nenhuma categoria cadastrada.
                    </p>
                </div>
            )}

            <div className="space-y-3">
                {categories.map((c: any) => {
                    const isExpense = c.type === "EXPENSE";

                    return (
                        <div
                            key={c.id}
                            className="
                bg-white
                rounded-2xl
                border border-slate-100
                shadow-sm
                p-4
                flex justify-between items-center
                hover:shadow-md
                transition
              "
                        >
                            {/* Info */}
                            <div className="flex items-center gap-3">
                                <div
                                    className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    ${isExpense ? "bg-rose-50" : "bg-emerald-50"}
                  `}
                                >
                                    {isExpense ? (
                                        <ArrowDownCircle
                                            size={18}
                                            className="text-rose-600"
                                        />
                                    ) : (
                                        <ArrowUpCircle
                                            size={18}
                                            className="text-emerald-600"
                                        />
                                    )}
                                </div>

                                <div>
                                    <p className="font-medium text-sm text-slate-800">
                                        {c.name}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {isExpense ? "Despesa" : "Entrada"}
                                    </p>
                                </div>
                            </div>

                            {/* Ações */}
                            <div className="flex items-center gap-2">

                                <Link
                                    href={`/categories/${c.id}`}
                                    className="
      w-8 h-8
      rounded-full
      flex items-center justify-center
      bg-indigo-50
      text-indigo-600
      hover:bg-indigo-100
      transition
    "
                                >
                                    <Pencil size={16} />
                                </Link>

                                <button
                                    onClick={() => setDeleteId(c.id)}
                                    className="
      w-8 h-8
      rounded-full
      flex items-center justify-center
      bg-rose-50
      text-rose-600
      hover:bg-rose-100
      transition
      cursor-pointer
    "
                                >
                                    <Trash2 size={16} />
                                </button>

                            </div>

                        </div>
                    );
                })}
            </div>

            <ConfirmModal
                open={!!deleteId}
                title="Excluir categoria"
                description="Essa ação não poderá ser desfeita."
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}
