"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Calendar,
    Eye,
    EyeOff,
    Filter,
    Receipt,
    Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/src/components/ui/ConfirmModal";
import HearderList from "@/src/components/ui/HeaderList";
import CardListEmpty from "@/src/components/ui/CardListEmpty";
import CardItemList from "@/src/components/ui/CardItemList";
import InfoItemListEntryExit from "@/src/components/InfoItemListEntryExit";
import ButtonActionList from "@/src/components/ui/ButtonActionList";
import { useRequireHousehold } from "@/src/hooks/useRequireHousehold";
import {
    Category,
    Card,
    fetchCards,
    fetchCategories,
} from "@/src/services/client/financialApi";
import { fetchTransactions } from "@/src/services/client/transactionApi";

type Transaction = {
    id: string;
    description: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    date: string;
    purchaseDate?: string | null;
    paymentMethod?: "CREDIT" | "DEBIT" | "PIX" | "CASH" | null;
    createdBy?: {
        id: string;
        name: string | null;
        email: string;
    } | null;
    category?: {
        id: string;
        name: string;
    } | null;
    card?: {
        id: string;
        name: string;
        dueDay: number;
    } | null;
};

export default function TransactionsPage() {
    const router = useRouter();
    const { householdId, loading: householdLoading } = useRequireHousehold();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const now = new Date();
    const [selectedMonthYear, setSelectedMonthYear] = useState(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    );
    const [selectedPurchaseMonthYear, setSelectedPurchaseMonthYear] = useState("");
    const [selectedType, setSelectedType] = useState("ALL");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [selectedCard, setSelectedCard] = useState("ALL");
    const [description, setDescription] = useState("");

    const activeFilterCount = useMemo(() => {
        return [
            selectedPurchaseMonthYear,
            selectedType !== "ALL",
            selectedCategory !== "ALL",
            selectedCard !== "ALL",
            description.trim(),
        ].filter(Boolean).length;
    }, [description, selectedCard, selectedCategory, selectedPurchaseMonthYear, selectedType]);

    const availableCategories = useMemo(() => {
        if (selectedType === "ALL") return categories;
        return categories.filter((category) => category.type === selectedType);
    }, [categories, selectedType]);

    const totalBalance = useMemo(() => {
        return transactions.reduce((acc, transaction) => {
            const value = Number(transaction.amount);
            return transaction.type === "INCOME" ? acc + value : acc - value;
        }, 0);
    }, [transactions]);

    const groupedTransactions = useMemo(() => {
        const parseDateWithoutTimezoneShift = (value: string) => {
            const dateOnly = value.split("T")[0];
            const [year, month, day] = dateOnly.split("-").map(Number);

            return new Date(year, month - 1, day);
        };

        const groupedByMonth = new Map<
            string,
            {
                monthLabel: string;
                days: Map<string, Transaction[]>;
            }
        >();

        transactions.forEach((transaction) => {
            const date = parseDateWithoutTimezoneShift(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;
            const monthLabel = date.toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
            });
            const dayKey = `${monthKey}-${String(date.getDate()).padStart(2, "0")}`;

            if (!groupedByMonth.has(monthKey)) {
                groupedByMonth.set(monthKey, {
                    monthLabel,
                    days: new Map<string, Transaction[]>(),
                });
            }

            const monthGroup = groupedByMonth.get(monthKey)!;

            if (!monthGroup.days.has(dayKey)) {
                monthGroup.days.set(dayKey, []);
            }

            monthGroup.days.get(dayKey)!.push(transaction);
        });

        return Array.from(groupedByMonth.entries())
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([monthKey, monthData]) => ({
                monthKey,
                monthLabel:
                    monthData.monthLabel.charAt(0).toUpperCase() +
                    monthData.monthLabel.slice(1),
                days: Array.from(monthData.days.entries())
                    .sort((a, b) => b[0].localeCompare(a[0]))
                    .map(([dayKey, dayTransactions]) => ({
                        dayKey,
                        dayLabel: parseDateWithoutTimezoneShift(
                            dayTransactions[0].date
                        ).toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                        }),
                        transactions: dayTransactions,
                    })),
            }));
    }, [transactions]);

    useEffect(() => {
        if (householdLoading || !householdId) return;

        let isMounted = true;
        const activeHouseholdId = householdId;

        async function loadOptions() {
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
                        : "Nao foi possivel carregar filtros"
                );
            }
        }

        setSelectedCategory("ALL");
        setSelectedCard("ALL");
        void loadOptions();

        return () => {
            isMounted = false;
        };
    }, [householdId, householdLoading]);

    useEffect(() => {
        if (householdLoading || !householdId) return;

        let isMounted = true;
        const activeHouseholdId = householdId;

        async function loadTransactions() {
            setLoading(true);
            setError("");

            try {
                const data = await fetchTransactions<Transaction[]>({
                    householdId: activeHouseholdId,
                    monthYear: selectedMonthYear,
                    purchaseMonthYear: selectedPurchaseMonthYear,
                    type: selectedType,
                    categoryId: selectedCategory,
                    cardId: selectedCard,
                    description: description.trim(),
                });

                if (!isMounted) return;
                setTransactions(data);
            } catch (currentError) {
                if (!isMounted) return;
                setError(
                    currentError instanceof Error
                        ? currentError.message
                        : "Nao foi possivel carregar transacoes"
                );
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        void loadTransactions();

        return () => {
            isMounted = false;
        };
    }, [
        description,
        householdId,
        householdLoading,
        selectedCard,
        selectedCategory,
        selectedMonthYear,
        selectedPurchaseMonthYear,
        selectedType,
    ]);

    async function confirmDelete() {
        if (!deleteId || !householdId) return;

        await fetch(`/api/transactions/${deleteId}`, {
            method: "DELETE",
        });

        const data = await fetchTransactions<Transaction[]>({
            householdId,
            monthYear: selectedMonthYear,
            purchaseMonthYear: selectedPurchaseMonthYear,
            type: selectedType,
            categoryId: selectedCategory,
            cardId: selectedCard,
            description: description.trim(),
        });

        setDeleteId(null);
        setTransactions(data);
    }

    if (householdLoading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-sm text-slate-500">
                Carregando familia...
            </div>
        );
    }

    return (
        <>
            <HearderList
                title="Transações"
                description="Visualize, filtre e gerencie todas as suas movimentações"
                link="/transactions/new"
            />

            {error && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-sm text-rose-700 mb-4">
                    {error}
                </div>
            )}

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-3xl shadow-xl p-6 md:p-8 flex items-center justify-between gap-4 mb-6">
                <div>
                    <p className="text-sm opacity-80">Saldo total do periodo filtrado</p>
                    <p className="text-3xl md:text-4xl font-bold mt-2">
                        R$ {totalBalance.toFixed(2)}
                    </p>
                </div>

                <div className="bg-white/20 p-3 md:p-4 rounded-2xl">
                    <Wallet size={26} />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-5 mb-6">
                <div className="flex flex-col">
                    <button
                        type="button"
                        className="flex items-center justify-between mb-2 text-gray-700 cursor-pointer"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <div className="flex items-center gap-2">
                            <Filter size={16} />
                            <h2 className="text-sm font-semibold">Filtros de movimentações</h2>
                        </div>

                        {isOpen ? <EyeOff size={32} /> : <Eye size={32} />}
                    </button>
                    <div className="flex justify-end">
                        {!isOpen && activeFilterCount > 0 ? (
                            <span className="text-xs text-indigo-600">
                                {activeFilterCount} Filtros ativos
                            </span>
                        ) : null}
                    </div>
                </div>

                <div
                    className={`grid transition-all duration-300 overflow-hidden ${isOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar size={13} /> Mes/Ano Pagamento
                            </label>
                            <input
                                type="month"
                                value={selectedMonthYear}
                                onChange={(event) => setSelectedMonthYear(event.target.value)}
                                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar size={13} /> Mes/Ano Compra
                            </label>
                            <input
                                type="month"
                                value={selectedPurchaseMonthYear}
                                onChange={(event) => setSelectedPurchaseMonthYear(event.target.value)}
                                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-500">Tipo</label>
                            <select
                                value={selectedType}
                                onChange={(event) => {
                                    const nextType = event.target.value;
                                    setSelectedType(nextType);
                                    setSelectedCategory("ALL");
                                }}
                                className="w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="ALL">Todos</option>
                                <option value="INCOME">Entradas</option>
                                <option value="EXPENSE">Saidas</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-500">Categoria</label>
                            <select
                                value={selectedCategory}
                                onChange={(event) => setSelectedCategory(event.target.value)}
                                className="w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="ALL">Todas</option>
                                {availableCategories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-500">Cartao</label>
                            <select
                                value={selectedCard}
                                onChange={(event) => setSelectedCard(event.target.value)}
                                className="w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="ALL">Todas</option>
                                {cards.map((card) => (
                                    <option key={card.id} value={card.id}>
                                        {card.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-500">Descricao</label>
                            <input
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                type="text"
                                className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 text-sm text-slate-500 mb-4">
                    Carregando transacoes...
                </div>
            )}

            {!loading && transactions.length === 0 && (
                <CardListEmpty
                    message="Nenhuma transação encontrada para os filtros selecionados."
                    icon={<Receipt className="mx-auto text-slate-300 mb-3" size={28} />}
                />
            )}

            <div className="space-y-6">
                {groupedTransactions.map((monthGroup) => (
                    <section key={monthGroup.monthKey} className="space-y-3">
                        <h3 className="text-base md:text-lg font-semibold text-gray-800 border-b pb-2">
                            {monthGroup.monthLabel}
                        </h3>

                        {monthGroup.days.map((dayGroup) => (
                            <div key={dayGroup.dayKey} className="space-y-3">
                                <p className="text-xs md:text-sm text-gray-500 font-medium capitalize">
                                    {dayGroup.dayLabel}
                                </p>

                                {dayGroup.transactions.map((transaction) => {
                                    const isIncome = transaction.type === "INCOME";
                                    const itemDescription = `${isIncome ? "Entrada" : "Saida"} - ${transaction.category?.name || "Sem categoria"}`;

                                    const paymentMethodLabel =
                                        transaction.paymentMethod === "CREDIT"
                                            ? "Credito"
                                            : transaction.paymentMethod === "DEBIT"
                                                ? "Debito"
                                                : transaction.paymentMethod === "PIX"
                                                    ? "Pix"
                                                    : transaction.paymentMethod === "CASH"
                                                        ? "Dinheiro"
                                                        : null;

                                    const createdByLabel =
                                        transaction.createdBy?.name ||
                                        transaction.createdBy?.email ||
                                        "Usuario";

                                    return (
                                        <CardItemList key={transaction.id}>
                                            <div className="flex flex-col gap-2">
                                                <InfoItemListEntryExit
                                                    type={isIncome ? "entry" : "exit"}
                                                    tittle={transaction.description}
                                                    description={itemDescription}
                                                />

                                                <div className="flex flex-wrap gap-2 pl-12">
                                                    <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                                        Por: {createdByLabel}
                                                    </span>

                                                    {paymentMethodLabel && (
                                                        <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                                            {paymentMethodLabel}
                                                        </span>
                                                    )}

                                                    {transaction.paymentMethod === "CREDIT" && transaction.card?.name && (
                                                        <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                                                            {transaction.card.name}
                                                        </span>
                                                    )}

                                                    {transaction.paymentMethod === "CREDIT" && transaction.card?.dueDay && (
                                                        <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                                            Vence dia {transaction.card.dueDay}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p
                                                    className={`text-sm font-semibold ${isIncome
                                                        ? "text-emerald-600"
                                                        : "text-rose-600"
                                                        }`}
                                                >
                                                    {isIncome ? "+" : "-"} R${" "}
                                                    {Number(transaction.amount).toFixed(2)}
                                                </p>

                                                <div className="mt-2">
                                                    <ButtonActionList
                                                        actionDelete={() =>
                                                            setDeleteId(transaction.id)
                                                        }
                                                        actionEdit={() =>
                                                            router.push(
                                                                `/transactions/${transaction.id}`
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </CardItemList>
                                    );
                                })}
                            </div>
                        ))}
                    </section>
                ))}
            </div>

            <ConfirmModal
                open={!!deleteId}
                title="Excluir Transação"
                description="Essa acao nao podera ser desfeita."
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </>
    );
}
