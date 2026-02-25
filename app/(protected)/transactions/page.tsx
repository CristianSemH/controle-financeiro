"use client";

import { useEffect, useMemo, useState } from "react";
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Calendar,
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

type Transaction = {
    id: string;
    description: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    date: string;
    category?: {
        id: string;
        name: string;
    } | null;
};

type Category = {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
};

export default function TransactionsPage() {
    const router = useRouter();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const now = new Date();
    const [selectedMonthYear, setSelectedMonthYear] = useState(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    );
    const [selectedType, setSelectedType] = useState("ALL");
    const [selectedCategory, setSelectedCategory] = useState("ALL");

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
        const groupedByMonth = new Map<
            string,
            {
                monthLabel: string;
                days: Map<string, Transaction[]>;
            }
        >();

        transactions.forEach((transaction) => {
            const date = new Date(transaction.date);
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
                        dayLabel: new Date(dayTransactions[0].date).toLocaleDateString(
                            "pt-BR",
                            {
                                weekday: "long",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            }
                        ),
                        transactions: dayTransactions,
                    })),
            }));
    }, [transactions]);

    useEffect(() => {
        let isMounted = true;

        async function loadCategories() {
            const categoriesRes = await fetch("/api/categories");
            const categoriesData = await categoriesRes.json();

            if (!isMounted) return;
            setCategories(categoriesData);
        }

        void loadCategories();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function loadTransactions() {
            const params = new URLSearchParams({ monthYear: selectedMonthYear });

            if (selectedType !== "ALL") {
                params.set("type", selectedType);
            }

            if (selectedCategory !== "ALL") {
                params.set("categoryId", selectedCategory);
            }

            const res = await fetch(`/api/transactions?${params.toString()}`);
            const data = await res.json();

            if (!isMounted) return;
            setTransactions(data);
        }

        void loadTransactions();

        return () => {
            isMounted = false;
        };
    }, [selectedMonthYear, selectedType, selectedCategory]);

    async function confirmDelete() {
        if (!deleteId) return;

        const params = new URLSearchParams({ monthYear: selectedMonthYear });

        if (selectedType !== "ALL") {
            params.set("type", selectedType);
        }

        if (selectedCategory !== "ALL") {
            params.set("categoryId", selectedCategory);
        }

        await fetch(`/api/transactions/${deleteId}`, {
            method: "DELETE",
        });

        const res = await fetch(`/api/transactions?${params.toString()}`);
        const data = await res.json();

        setDeleteId(null);
        setTransactions(data);
    }

    return (
        <>
            <HearderList
                title="Transações"
                description="Visualize, filtre e gerencie todas as suas movimentações"
                link="/transactions/new"
            />

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-3xl shadow-xl p-6 md:p-8 flex items-center justify-between gap-4 mb-6">
                <div>
                    <p className="text-sm opacity-80">Saldo total do período filtrado</p>
                    <p className="text-3xl md:text-4xl font-bold mt-2">
                        R$ {totalBalance.toFixed(2)}
                    </p>
                </div>

                <div className="bg-white/20 p-3 md:p-4 rounded-2xl">
                    <Wallet size={26} />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-5 mb-6">
                <div className="flex items-center gap-2 mb-4 text-gray-700">
                    <Filter size={16} />
                    <h2 className="text-sm font-semibold">Filtros de movimentações</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={13} /> Mês/Ano
                        </label>
                        <input
                            type="month"
                            value={selectedMonthYear}
                            onChange={(e) => setSelectedMonthYear(e.target.value)}
                            className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-500">Tipo</label>
                        <select
                            value={selectedType}
                            onChange={(e) => {
                                const nextType = e.target.value;
                                setSelectedType(nextType);
                                setSelectedCategory("ALL");
                            }}
                            className="w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="ALL">Todos</option>
                            <option value="INCOME">Entradas</option>
                            <option value="EXPENSE">Saídas</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-500">Categoria</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
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
                </div>
            </div>

            {transactions.length === 0 && (
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
                                    const description = `${isIncome ? "Entrada" : "Saída"} • ${transaction.category?.name || "Sem categoria"
                                        }`;

                                    return (
                                        <CardItemList key={transaction.id}>
                                            <div className="flex items-center gap-2">
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

                                                <InfoItemListEntryExit
                                                    type={isIncome ? "entry" : "exit"}
                                                    tittle={transaction.description}
                                                    description={description}
                                                />
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

                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(transaction.date).toLocaleTimeString(
                                                        "pt-BR",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
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
                description="Essa ação não poderá ser desfeita."
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </>
    );
}
