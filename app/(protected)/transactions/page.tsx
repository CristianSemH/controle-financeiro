"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Plus,
    Receipt, Pencil, Trash2
} from "lucide-react";
import ConfirmModal from "@/src/components/ui/ConfirmModal";


export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);


    async function loadTransactions() {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        setTransactions(data);
        setLoading(false);
    }

    async function confirmDelete() {
        if (!deleteId) return;

        await fetch(`/api/transactions/${deleteId}`, {
            method: "DELETE",
        });

        setDeleteId(null);
        loadTransactions();
    }

    useEffect(() => {
        loadTransactions();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-400 animate-pulse">
                    Carregando transações...
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
                        Transações
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Histórico de movimentações
                    </p>
                </div>

                <Link
                    href="/transactions/new"
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

            {/* Estado vazio */}
            {transactions.length === 0 && (
                <div className="
          bg-white
          rounded-2xl
          border border-slate-100
          shadow-sm
          p-8
          text-center
        ">
                    <Receipt className="mx-auto text-slate-300 mb-3" size={28} />
                    <p className="text-sm text-slate-500">
                        Nenhuma transação cadastrada.
                    </p>
                </div>
            )}

            {/* Lista */}
            <div className="space-y-3">
                {transactions.map((t: any) => {
                    const isIncome = t.type === "INCOME";

                    return (
                        <div
                            key={t.id}
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
                            {/* Lado esquerdo */}
                            <div className="flex items-center gap-3">

                                <div
                                    className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    ${isIncome ? "bg-emerald-50" : "bg-rose-50"}
                  `}
                                >
                                    {isIncome ? (
                                        <ArrowUpCircle
                                            size={18}
                                            className="text-emerald-600"
                                        />
                                    ) : (
                                        <ArrowDownCircle
                                            size={18}
                                            className="text-rose-600"
                                        />
                                    )}
                                </div>

                                <div>
                                    <p className="font-medium text-sm text-slate-800">
                                        {t.description}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {new Date(t.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Lado direito */}
                            <div className="text-right">

                                <p
                                    className={`text-sm font-semibold ${isIncome
                                        ? "text-emerald-600"
                                        : "text-rose-600"
                                        }`}
                                >
                                    {isIncome ? "+" : "-"} R${" "}
                                    {Number(t.amount).toFixed(2)}
                                </p>

                                <div className="flex gap-2 justify-end mt-2">

                                    <Link
                                        href={`/transactions/${t.id}`}
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
                                        onClick={() => setDeleteId(t.id)}
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
                        </div>
                    );
                })}
            </div>

            <ConfirmModal
                open={!!deleteId}
                title="Excluir Transação"
                description="Essa ação não poderá ser desfeita."
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />

        </div>
    );
}
