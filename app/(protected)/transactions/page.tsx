"use client";

import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import ConfirmModal from "@/src/components/ui/ConfirmModal";
import HearderList from "@/src/components/ui/HeaderList";
import CardListEmpty from "@/src/components/ui/CardListEmpty";
import CardItemList from "@/src/components/ui/CardItemList";
import InfoItemListEntryExit from "@/src/components/InfoItemListEntryExit";
import ButtonActionList from "@/src/components/ui/ButtonActionList";
import { redirect } from "next/navigation";


export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);


    async function loadTransactions() {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        setTransactions(data);
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

    return (
        <>
            <HearderList title="Transações" description="Histórico de movimentações" link="/transactions/new" />

            {transactions.length === 0 && (
                <CardListEmpty message="Nenhuma transação cadastrada." icon={<Receipt className="mx-auto text-slate-300 mb-3" size={28} />} />
            )}

            <div className="space-y-3">
                {transactions.map((t: any) => {
                    const isIncome = t.type === "INCOME";

                    const description = `${isIncome ? "Entrada" : "Saída"} - ${new Date(t.date).toLocaleDateString()}`;

                    return (
                        <CardItemList key={t.id}>
                            <InfoItemListEntryExit type={isIncome ? "entry" : "exit"} tittle={t.description} description={description} />
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

                                <div className="mt-2">
                                    <ButtonActionList actionDelete={() => setDeleteId(t.id)} actionEdit={() => redirect(`/transactions/${t.id}`)} />
                                </div>
                            </div>
                        </CardItemList>
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

        </>
    );
}
