"use client";

import { useState } from "react";
import { AlertTriangle, Check, ChevronLeft, SkipForward } from "lucide-react";
import Input from "@/src/components/ui/Input";
import Select from "@/src/components/ui/Select";
import Label from "@/src/components/ui/Label";
import Button from "@/src/components/ui/Button";
import { ParsedImportRow } from "@/src/components/import/FileUpload";

type Category = {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
};

type Card = {
    id: string;
    name: string;
    dueDay: number;
};

export type TransactionImportForm = {
    description: string;
    amount: string;
    purchaseDate: string;
    paymentDate: string;
    type: "EXPENSE";
    categoryId: string;
    paymentMethod: "CREDIT" | "DEBIT" | "PIX" | "CASH";
    cardId: string;
};

type TransactionReviewCardProps = {
    transaction: ParsedImportRow;
    currentIndex: number;
    total: number;
    categories: Category[];
    cards: Card[];
    suggestedCategoryId?: string;
    saving: boolean;
    onConfirm: (form: TransactionImportForm) => void;
    onSkip: () => void;
    onPrevious: () => void;
    canGoPrevious: boolean;
};

function calculateCreditDueDate(purchaseDate: string, dueDay: number) {
    const [year, month] = purchaseDate.split("-").map(Number);
    const dueMonth = month === 12 ? 1 : month + 1;
    const dueYear = month === 12 ? year + 1 : year;
    const maxDay = new Date(dueYear, dueMonth, 0).getDate();
    const clampedDueDay = Math.min(dueDay, maxDay);

    return `${dueYear}-${String(dueMonth).padStart(2, "0")}-${String(clampedDueDay).padStart(2, "0")}`;
}

function buildInitialForm(
    transaction: ParsedImportRow,
    suggestedCategoryId?: string
): TransactionImportForm {
    return {
        description: transaction.description,
        amount: String(transaction.amount),
        purchaseDate: transaction.date,
        paymentDate: transaction.date,
        type: "EXPENSE",
        categoryId: suggestedCategoryId ?? "",
        paymentMethod: "CREDIT",
        cardId: "",
    };
}

export default function TransactionReviewCard({
    transaction,
    currentIndex,
    total,
    categories,
    cards,
    suggestedCategoryId,
    saving,
    onConfirm,
    onSkip,
    onPrevious,
    canGoPrevious,
}: TransactionReviewCardProps) {
    const [form, setForm] = useState<TransactionImportForm>(() =>
        buildInitialForm(transaction, suggestedCategoryId)
    );

    const expenseCategories = categories.filter((category) => category.type === "EXPENSE");
    const requiresCard = form.paymentMethod === "CREDIT";

    function resolvePaymentDate(
        paymentMethod: TransactionImportForm["paymentMethod"],
        purchaseDate: string,
        cardId: string
    ) {
        const card = cards.find((item) => item.id === cardId);

        if (paymentMethod === "CREDIT" && card && purchaseDate) {
            return calculateCreditDueDate(purchaseDate, card.dueDay);
        }

        return purchaseDate;
    }

    function submitForm(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onConfirm(form);
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                <div>
                    <p className="text-xs font-medium text-slate-400">
                        Linha {transaction.rowNumber}
                    </p>
                    <h2 className="text-lg font-semibold text-slate-800">
                        Revisar transacao
                    </h2>
                </div>

                <div className="min-w-36">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>{currentIndex + 1} de {total}</span>
                        <span>{Math.round(((currentIndex + 1) / total) * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className="h-full bg-indigo-600 transition-all"
                            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {transaction.possibleDuplicate && (
                <div className="mb-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold">Possivel duplicidade</p>
                        <p className="text-xs mt-1">
                            Ja existe uma transacao com a mesma descricao, valor e data.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={submitForm} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Label>Descricao</Label>
                        <Input
                            value={form.description}
                            onChange={(event) =>
                                setForm({ ...form, description: event.target.value })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label>Valor</Label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={form.amount}
                            onChange={(event) =>
                                setForm({ ...form, amount: event.target.value })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label>Tipo</Label>
                        <Select value={form.type} disabled>
                            <option value="EXPENSE">Despesa</option>
                        </Select>
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
                            {expenseCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <Label>Forma de pagamento</Label>
                        <Select
                            value={form.paymentMethod}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    paymentMethod: event.target.value as TransactionImportForm["paymentMethod"],
                                    cardId: "",
                                    paymentDate: form.purchaseDate,
                                })
                            }
                            required
                        >
                            <option value="CREDIT">Credito</option>
                            <option value="DEBIT">Debito</option>
                            <option value="PIX">Pix</option>
                            <option value="CASH">Dinheiro</option>
                        </Select>
                    </div>

                    {requiresCard && (
                        <div>
                            <Label>Cartao</Label>
                            <Select
                                value={form.cardId}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        cardId: event.target.value,
                                        paymentDate: resolvePaymentDate(
                                            form.paymentMethod,
                                            form.purchaseDate,
                                            event.target.value
                                        ),
                                    })
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
                    )}

                    <div>
                        <Label>Data da compra</Label>
                        <Input
                            type="date"
                            value={form.purchaseDate}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    purchaseDate: event.target.value,
                                    paymentDate: resolvePaymentDate(
                                        form.paymentMethod,
                                        event.target.value,
                                        form.cardId
                                    ),
                                })
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label>Data de pagamento</Label>
                        <Input
                            type="date"
                            value={form.paymentDate}
                            onChange={(event) =>
                                setForm({ ...form, paymentDate: event.target.value })
                            }
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onPrevious}
                        disabled={!canGoPrevious || saving}
                        className="flex items-center justify-center gap-2"
                    >
                        <ChevronLeft size={16} />
                        Anterior
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onSkip}
                        disabled={saving}
                        className="flex items-center justify-center gap-2"
                    >
                        <SkipForward size={16} />
                        Pular
                    </Button>

                    <Button
                        type="submit"
                        disabled={saving}
                        className="flex items-center justify-center gap-2"
                    >
                        <Check size={16} />
                        {saving
                            ? "Salvando..."
                            : transaction.possibleDuplicate
                                ? "Importar mesmo assim"
                                : "Confirmar"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
