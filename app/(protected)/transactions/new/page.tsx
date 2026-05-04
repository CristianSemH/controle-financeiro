"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Input from "@/src/components/ui/Input";
import Select from "@/src/components/ui/Select";
import Label from "@/src/components/ui/Label";
import Button from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/ToastProvider";
import { useRequireHousehold } from "@/src/hooks/useRequireHousehold";
import {
    Category,
    Card,
    fetchCards,
    fetchCategories,
} from "@/src/services/client/financialApi";
import { createTransaction } from "@/src/services/client/transactionApi";

type TransactionForm = {
    description: string;
    amount: string;
    type: "EXPENSE" | "INCOME";
    categoryId: string;
    date: string;
    purchaseDate: string;
    paymentMethod: "" | "CREDIT" | "DEBIT" | "PIX" | "CASH";
    cardId: string;
};

function calculateCreditDueDate(purchaseDate: string, dueDay: number) {
    const [year, month] = purchaseDate.split("-").map(Number);
    const dueMonth = month === 12 ? 1 : month + 1;
    const dueYear = month === 12 ? year + 1 : year;
    const maxDay = new Date(dueYear, dueMonth, 0).getDate();
    const clampedDueDay = Math.min(dueDay, maxDay);

    return `${dueYear}-${String(dueMonth).padStart(2, "0")}-${String(clampedDueDay).padStart(2, "0")}`;
}

export default function NewTransactionPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const { householdId, loading: householdLoading } = useRequireHousehold();
    const [categories, setCategories] = useState<Category[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState<TransactionForm>({
        description: "",
        amount: "",
        type: "EXPENSE",
        categoryId: "",
        date: "",
        purchaseDate: "",
        paymentMethod: "",
        cardId: "",
    });

    const selectedCard = useMemo(
        () => cards.find((card) => card.id === form.cardId),
        [cards, form.cardId]
    );

    const isCreditExpense = form.type === "EXPENSE" && form.paymentMethod === "CREDIT";

    useEffect(() => {
        if (householdLoading || !householdId) return;

        let isMounted = true;
        const activeHouseholdId = householdId;

        async function loadOptions() {
            setError("");

            try {
                const [categoriesData, cardsData] = await Promise.all([
                    fetchCategories(activeHouseholdId),
                    fetchCards(activeHouseholdId),
                ]);

                if (!isMounted) return;
                setCategories(categoriesData);
                setCards(cardsData);
            } catch (currentError) {
                if (!isMounted) return;
                setError(
                    currentError instanceof Error
                        ? currentError.message
                        : "Nao foi possivel carregar categorias e cartoes"
                );
            }
        }

        void loadOptions();

        return () => {
            isMounted = false;
        };
    }, [householdId, householdLoading]);

    function updatePurchaseDate(purchaseDate: string) {
        setForm((prev) => ({
            ...prev,
            purchaseDate,
            date:
                prev.paymentMethod === "CREDIT" && selectedCard
                    ? calculateCreditDueDate(purchaseDate, selectedCard.dueDay)
                    : purchaseDate,
        }));
    }

    function updateCard(cardId: string) {
        const card = cards.find((item) => item.id === cardId);

        setForm((prev) => ({
            ...prev,
            cardId,
            date:
                prev.paymentMethod === "CREDIT" && card && prev.purchaseDate
                    ? calculateCreditDueDate(prev.purchaseDate, card.dueDay)
                    : prev.date,
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!householdId) {
            router.replace("/create-household");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const purchaseDate = form.type === "EXPENSE"
                ? isCreditExpense
                    ? form.purchaseDate
                    : form.date
                : undefined;

            await createTransaction({
                householdId,
                description: form.description,
                amount: Number(form.amount),
                type: form.type,
                categoryId: form.categoryId,
                date: form.date,
                purchaseDate,
                paymentMethod: form.type === "EXPENSE" ? form.paymentMethod : undefined,
                cardId: isCreditExpense ? form.cardId : undefined,
            });

            showToast("Transação criada com sucesso", "success");
            router.push("/transactions");
        } catch (currentError) {
            setError(
                currentError instanceof Error
                    ? currentError.message
                    : "Nao foi possivel salvar a transação"
            );
        } finally {
            setLoading(false);
        }
    }

    if (householdLoading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-sm text-slate-500">
                Carregando familia...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-24">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-800">
                    Nova Transação
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    Registre uma nova movimentação
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-sm text-rose-700">
                            {error}
                        </div>
                    )}

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
                                    paymentMethod: "",
                                    cardId: "",
                                    purchaseDate: "",
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

                    <div>
                        <Label>Valor</Label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={form.amount}
                            onChange={(event) =>
                                setForm({ ...form, amount: event.target.value })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label>Descricao</Label>
                        <Input
                            placeholder="Ex: Mercado, Salario..."
                            value={form.description}
                            onChange={(event) =>
                                setForm({ ...form, description: event.target.value })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label>Categoria</Label>
                        <Select
                            value={form.categoryId}
                            onChange={(event) =>
                                setForm({ ...form, categoryId: event.target.value })
                            }
                            required
                        >
                            <option value="">Selecione categoria</option>

                            {categories
                                .filter((category) => category.type === form.type)
                                .map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                        </Select>
                    </div>

                    {form.type === "EXPENSE" && (
                        <>
                            <div>
                                <Label>Forma de Pagamento</Label>
                                <Select
                                    value={form.paymentMethod}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            paymentMethod: event.target.value as TransactionForm["paymentMethod"],
                                            cardId: "",
                                            date: form.purchaseDate || form.date,
                                        })
                                    }
                                    required
                                >
                                    <option value="">Selecione a forma de pagamento</option>
                                    <option value="CREDIT">Credito</option>
                                    <option value="DEBIT">Debito</option>
                                    <option value="PIX">Pix</option>
                                    <option value="CASH">Dinheiro</option>
                                </Select>
                            </div>

                            {isCreditExpense && (
                                <>
                                    <div>
                                        <Label>Cartao</Label>
                                        <Select
                                            value={form.cardId}
                                            onChange={(event) =>
                                                updateCard(event.target.value)
                                            }
                                            required
                                        >
                                            <option value="">Selecione o cartao</option>
                                            {cards.map((card) => (
                                                <option key={card.id} value={card.id}>
                                                    {card.name} - vence dia {card.dueDay}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Quando eu comprei</Label>
                                        <Input
                                            type="date"
                                            value={form.purchaseDate}
                                            onChange={(event) =>
                                                updatePurchaseDate(event.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    <div>
                        {form.type === "EXPENSE" ? (
                            <Label>Quando eu vou pagar</Label>
                        ) : (
                            <Label>Data da entrada</Label>
                        )}
                        <Input
                            type="date"
                            value={form.date}
                            onChange={(event) =>
                                setForm({ ...form, date: event.target.value })
                            }
                            required
                        />
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading ? "Salvando..." : "Salvar Transação"}
                    </Button>

                    <Button
                        variant="secondary"
                        type="button"
                        onClick={() => router.push("/transactions")}
                    >
                        Cancelar
                    </Button>
                </form>
            </div>
        </div>
    );
}
