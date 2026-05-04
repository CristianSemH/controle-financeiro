"use client";

import { useEffect, useState } from "react";
import ExpensePieChart from "@/src/components/ExpensePieChart";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Calendar,
    Target,
} from "lucide-react";
import { useRequireHousehold } from "@/src/hooks/useRequireHousehold";
import { fetchDashboard } from "@/src/services/client/financialApi";

type DashboardData = {
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    expensesByCategory: {
        category: string;
        total: number;
    }[];
    goalsProgressPercent: number;
    goalsTotalSaved: number;
    goalsTotalTarget: number;
};

export default function DashboardPage() {
    const now = new Date();
    const { householdId, loading: householdLoading } = useRequireHousehold();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (householdLoading || !householdId) return;

        let isMounted = true;
        const activeHouseholdId = householdId;

        async function loadDashboard() {
            setLoading(true);
            setError("");

            try {
                const json = await fetchDashboard<DashboardData>({
                    householdId: activeHouseholdId,
                    month,
                    year,
                });

                if (!isMounted) return;
                setData(json);
            } catch (currentError) {
                if (!isMounted) return;
                setError(
                    currentError instanceof Error
                        ? currentError.message
                        : "Nao foi possivel carregar o dashboard"
                );
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        void loadDashboard();

        return () => {
            isMounted = false;
        };
    }, [householdId, householdLoading, month, year]);

    if (householdLoading || loading) {
        return (
            <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-slate-100 p-6 text-sm text-slate-500">
                Carregando dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto bg-rose-50 rounded-2xl border border-rose-100 p-4 text-sm text-rose-700">
                {error}
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Dashboard
                    </h1>
                    <p className="text-sm text-gray-500">
                        Visao geral das suas financas
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border">
                    <Calendar size={16} className="text-gray-400" />
                    <input
                        type="month"
                        value={`${year}-${String(month).padStart(2, "0")}`}
                        onChange={(event) => {
                            const [nextYear, nextMonth] = event.target.value.split("-");
                            setYear(Number(nextYear));
                            setMonth(Number(nextMonth));
                        }}
                        className="text-sm bg-transparent outline-none"
                    />
                </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-3xl shadow-xl p-8 flex justify-between items-center">
                <div>
                    <p className="text-sm opacity-80">Saldo Total</p>
                    <p className="text-4xl font-bold mt-2">
                        R$ {data.totalBalance?.toFixed(2)}
                    </p>
                </div>

                <div className="bg-white/20 p-4 rounded-2xl">
                    <Wallet size={28} />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500">Saldo do mes</p>
                        <p
                            className={`text-2xl font-bold mt-1 ${data.balance >= 0
                                ? "text-green-600"
                                : "text-red-600"
                                }`}
                        >
                            R$ {data.balance?.toFixed(2)}
                        </p>
                    </div>

                    <div className="bg-indigo-100 text-[#6366F1] p-3 rounded-xl">
                        <Wallet size={22} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500">Entradas</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                            R$ {data.totalIncome?.toFixed(2)}
                        </p>
                    </div>

                    <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                        <TrendingUp size={22} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500">Despesas</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">
                            R$ {data.totalExpense?.toFixed(2)}
                        </p>
                    </div>

                    <div className="bg-red-100 text-red-600 p-3 rounded-xl">
                        <TrendingDown size={22} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">
                    Despesas por categoria
                </h2>
                <ExpensePieChart data={data.expensesByCategory} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Target size={18} className="text-[#6366F1]" />
                    <h2 className="text-lg font-semibold">
                        Progresso das Metas
                    </h2>
                </div>

                <p className="text-sm mb-2 text-gray-600">
                    R$ {data.goalsTotalSaved?.toFixed(2)} /
                    R$ {data.goalsTotalTarget?.toFixed(2)}
                </p>

                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-[#6366F1] h-3 rounded-full transition-all"
                        style={{
                            width: `${Math.min(
                                data.goalsProgressPercent,
                                100
                            )}%`,
                        }}
                    />
                </div>

                <p className="text-xs text-gray-500 mt-2">
                    {data.goalsProgressPercent?.toFixed(1)}% concluido
                </p>
            </div>
        </div>
    );
}
