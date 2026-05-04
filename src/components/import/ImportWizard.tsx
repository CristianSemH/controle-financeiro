"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import Button from "@/src/components/ui/Button";
import { CsvImportError, ParsedImportRow } from "@/src/components/import/FileUpload";
import TransactionReviewCard, {
    TransactionImportForm,
} from "@/src/components/import/TransactionReviewCard";
import { useToast } from "@/src/components/ui/ToastProvider";

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

type ImportWizardProps = {
    transactions: ParsedImportRow[];
    parseErrors: CsvImportError[];
    categories: Category[];
    cards: Card[];
    onReset: () => void;
};

type ImportStatus = "pending" | "imported" | "skipped";

const keywordSuggestions: Record<string, string[]> = {
    alimentacao: ["mercado", "ifood", "restaurante", "padaria", "lanche"],
    transporte: ["uber", "99", "posto", "combustivel", "estacionamento"],
    saude: ["farmacia", "drogaria", "wellhub", "academia", "consulta"],
    lazer: ["cinema", "spotify", "netflix", "show", "ingresso"],
    casa: ["energia", "agua", "internet", "condominio"],
};

function normalizeText(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

export default function ImportWizard({
    transactions,
    parseErrors,
    categories,
    cards,
    onReset,
}: ImportWizardProps) {
    const { showToast } = useToast();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [statuses, setStatuses] = useState<ImportStatus[]>(
        transactions.map(() => "pending")
    );
    const [saving, setSaving] = useState(false);

    const currentTransaction = transactions[currentIndex];

    const duplicateCount = useMemo(
        () => transactions.filter((transaction) => transaction.possibleDuplicate).length,
        [transactions]
    );

    const importedCount = statuses.filter((status) => status === "imported").length;
    const skippedCount = statuses.filter((status) => status === "skipped").length;
    const isComplete = transactions.length > 0 && currentIndex >= transactions.length;

    const suggestedCategoryId = useMemo(() => {
        if (!currentTransaction) return "";

        const description = normalizeText(currentTransaction.description);
        const expenseCategories = categories.filter((category) => category.type === "EXPENSE");

        const directMatch = expenseCategories.find((category) =>
            description.includes(normalizeText(category.name))
        );

        if (directMatch) return directMatch.id;

        for (const category of expenseCategories) {
            const categoryName = normalizeText(category.name);
            const keywords = keywordSuggestions[categoryName] ?? [];

            if (keywords.some((keyword) => description.includes(keyword))) {
                return category.id;
            }
        }

        return "";
    }, [categories, currentTransaction]);

    const goToNext = useCallback(() => {
        setCurrentIndex((index) => Math.min(index + 1, transactions.length));
    }, [transactions.length]);

    const markCurrent = useCallback((status: ImportStatus) => {
        setStatuses((prev) =>
            prev.map((item, index) => (index === currentIndex ? status : item))
        );
    }, [currentIndex]);

    async function confirmCurrent(form: TransactionImportForm) {
        if (!currentTransaction || saving) return;

        if (statuses[currentIndex] === "imported") {
            goToNext();
            return;
        }

        setSaving(true);

        try {
            const res = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description: form.description.trim(),
                    amount: Number(form.amount),
                    type: "EXPENSE",
                    categoryId: form.categoryId,
                    date: form.paymentDate,
                    purchaseDate: form.purchaseDate,
                    paymentMethod: form.paymentMethod,
                    cardId: form.paymentMethod === "CREDIT" ? form.cardId : undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.error ?? "Nao foi possivel salvar a transacao", "error");
                return;
            }

            markCurrent("imported");
            goToNext();
        } catch {
            showToast("Erro ao salvar transacao", "error");
        } finally {
            setSaving(false);
        }
    }

    const skipCurrent = useCallback(() => {
        if (!currentTransaction || saving) return;

        if (statuses[currentIndex] !== "imported") {
            markCurrent("skipped");
        }

        goToNext();
    }, [currentIndex, currentTransaction, goToNext, markCurrent, saving, statuses]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const activeElement = document.activeElement;
            const isEditingField = ["INPUT", "SELECT", "TEXTAREA"].includes(
                activeElement?.tagName ?? ""
            );

            if (event.key === "ArrowLeft" && currentIndex > 0 && !isEditingField) {
                event.preventDefault();
                setCurrentIndex((index) => Math.max(index - 1, 0));
            }

            if (event.key === "ArrowRight" && !isEditingField && currentIndex < transactions.length) {
                event.preventDefault();
                skipCurrent();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, skipCurrent, transactions.length]);

    if (transactions.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
                <TriangleAlert className="mx-auto text-amber-500 mb-3" size={28} />
                <h2 className="text-lg font-semibold text-slate-800">
                    Nenhuma transacao valida encontrada
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    Verifique se o arquivo possui as colunas date, title e amount.
                </p>
                <div className="mt-5">
                    <Button type="button" variant="secondary" onClick={onReset}>
                        Escolher outro arquivo
                    </Button>
                </div>
            </div>
        );
    }

    if (isComplete) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-xl font-semibold text-slate-800">
                    Importacao concluida
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    Confira o resumo antes de sair desta tela.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                        <p className="text-xs text-emerald-700">Importadas</p>
                        <p className="text-2xl font-semibold text-emerald-700 mt-1">
                            {importedCount}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                        <p className="text-xs text-slate-500">Puladas</p>
                        <p className="text-2xl font-semibold text-slate-700 mt-1">
                            {skippedCount}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                        <p className="text-xs text-amber-700">Possiveis duplicadas</p>
                        <p className="text-2xl font-semibold text-amber-700 mt-1">
                            {duplicateCount}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col md:flex-row gap-3">
                    <Button type="button" variant="secondary" onClick={onReset}>
                        Importar outro CSV
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            window.location.href = "/transactions";
                        }}
                    >
                        Ver transacoes
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {parseErrors.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-amber-800">
                    <p className="text-sm font-semibold">
                        {parseErrors.length} linha(s) foram ignoradas por erro de leitura
                    </p>
                    <p className="text-xs mt-1">
                        Corrija o CSV e envie novamente se precisar incluir essas linhas.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-white border border-slate-100 p-3">
                    <p className="text-xs text-slate-400">Importadas</p>
                    <p className="text-lg font-semibold text-emerald-600">{importedCount}</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-100 p-3">
                    <p className="text-xs text-slate-400">Puladas</p>
                    <p className="text-lg font-semibold text-slate-700">{skippedCount}</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-100 p-3">
                    <p className="text-xs text-slate-400">Duplicadas</p>
                    <p className="text-lg font-semibold text-amber-600">{duplicateCount}</p>
                </div>
            </div>

            <TransactionReviewCard
                key={currentTransaction.rowNumber}
                transaction={currentTransaction}
                currentIndex={currentIndex}
                total={transactions.length}
                categories={categories}
                cards={cards}
                suggestedCategoryId={suggestedCategoryId}
                saving={saving}
                onConfirm={confirmCurrent}
                onSkip={skipCurrent}
                onPrevious={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
                canGoPrevious={currentIndex > 0}
            />

            <button
                type="button"
                onClick={onReset}
                className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-2 mx-auto"
            >
                <RotateCcw size={14} />
                Cancelar lote atual
            </button>
        </div>
    );
}
