"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import ConfirmModal from "@/src/components/ui/ConfirmModal";
import HearderList from "@/src/components/ui/HeaderList";
import { redirect } from "next/navigation";
import ButtonActionList from "@/src/components/ui/ButtonActionList";
import CardItemList from "@/src/components/ui/CardItemList";
import CardListEmpty from "@/src/components/ui/CardListEmpty";

type Card = {
    id: string;
    name: string;
    dueDay: number;
    limit: number;
};

export default function CardsPage() {
    const [cards, setCards] = useState<Card[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    async function loadCards() {
        const res = await fetch("/api/cards");
        const data = await res.json();
        setCards(data);
    }

    async function confirmDelete() {
        if (!deleteId) return;

        await fetch(`/api/cards/${deleteId}`, {
            method: "DELETE",
        });

        setDeleteId(null);
        loadCards();
    }

    useEffect(() => {
        loadCards();
    }, []);

    return (
        <>
            <HearderList
                title="Cartoes"
                description="Gerencie seus cartoes de credito"
                link="/cards/new"
            />

            {cards.length === 0 && (
                <CardListEmpty
                    message="Nenhum cartao cadastrado."
                    icon={<CreditCard className="mx-auto text-slate-300 mb-3" size={28} />}
                />
            )}

            <div className="space-y-3">
                {cards.map((card) => (
                    <CardItemList key={card.id}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50">
                                <CreditCard size={18} className="text-indigo-600" />
                            </div>

                            <div>
                                <p className="font-medium text-sm text-slate-800">{card.name}</p>
                                <p className="text-xs text-slate-400">
                                    Vence dia {card.dueDay} - Limite R$ {Number(card.limit).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <ButtonActionList
                            actionDelete={() => setDeleteId(card.id)}
                            actionEdit={() => redirect(`/cards/${card.id}`)}
                        />
                    </CardItemList>
                ))}
            </div>

            <ConfirmModal
                open={!!deleteId}
                title="Excluir cartao"
                description="Essa acao nao podera ser desfeita."
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </>
    );
}
