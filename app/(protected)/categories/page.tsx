"use client";

import { useEffect, useState } from "react";
import { Tag, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import ConfirmModal from "@/src/components/ui/ConfirmModal";
import HearderList from "@/src/components/ui/HeaderList";
import { redirect } from "next/navigation";
import ButtonActionList from "@/src/components/ui/ButtonActionList";
import InfoItemListEntryExit from "@/src/components/InfoItemListEntryExit";
import CardItemList from "@/src/components/ui/CardItemList";
import CardListEmpty from "@/src/components/ui/CardListEmpty";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    async function loadCategories() {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
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

    return (
        <>
            <HearderList title="Categorias" description="Gerencie as categorias de suas movimentações" link="/categories/new"/>

            {categories.length === 0 && (
                <CardListEmpty message="Nenhuma categoria cadastrada." icon={<Tag className="mx-auto text-slate-300 mb-3" size={28} />} />
            )}

            <div className="space-y-3">
                {categories.map((c: any) => {
                    const isExpense = c.type === "EXPENSE";

                    return (
                        <CardItemList key={c.id}>
                            <InfoItemListEntryExit type={isExpense ? "exit" : "entry"} tittle={c.name} description={isExpense ? "Despesa" : "Entrada"} />
                            <ButtonActionList actionDelete={() => setDeleteId(c.id)} actionEdit={() => redirect(`/categories/${c.id}`)} />
                        </CardItemList>
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
        </>
    );
}
