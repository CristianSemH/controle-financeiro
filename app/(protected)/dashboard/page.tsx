"use client";

import { useEffect, useState } from "react";
import Card from "@/src/components/Card";
import ExpensePieChart from "@/src/components/ExpensePieChart";

export default function DashboardPage() {
    const now = new Date();

    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    async function loadDashboard() {
        setLoading(true);

        const res = await fetch(
            `/api/dashboard?month=${month}&year=${year}`
        );

        const json = await res.json();
        setData(json);
        setLoading(false);
    }

    useEffect(() => {
        loadDashboard();
    }, [month, year]);

    if (loading || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-24 text-gray-700">

            {/* Saldo Total */}
            <div className="
  bg-gradient-to-br 
  from-indigo-500 
  to-indigo-600 
  text-white 
  rounded-2xl 
  shadow-lg 
  p-6 
  mb-6
">
                <p className="text-xs opacity-80">
                    Saldo Total
                </p>
                <p className="text-3xl font-bold mt-1">
                    R$ {data.totalBalance.toFixed(2)}
                </p>
            </div>



            {/* Cabeçalho + seletor de mês */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>

                <input
                    type="month"
                    value={`${year}-${String(month).padStart(2, "0")}`}
                    onChange={(e) => {
                        const [y, m] = e.target.value.split("-");
                        setYear(Number(y));
                        setMonth(Number(m));
                    }}
                    className="border rounded-lg p-2 text-sm bg-white"
                />
            </div>

            {/* Saldo */}
            <div className="bg-white rounded-xl shadow p-6 mb-6 text-center">
                <p className="text-sm text-gray-500">Saldo do mês</p>
                <p
                    className={`text-3xl font-bold ${data.balance >= 0
                        ? "text-green-600"
                        : "text-red-600"
                        }`}
                >
                    R$ {data.balance.toFixed(2)}
                </p>
            </div>

            {/* Entradas e Saídas */}
            <div className="flex gap-4 mb-6">
                <Card
                    title="Entradas"
                    value={data.totalIncome}
                    color="green"
                />
                <Card
                    title="Despesas"
                    value={data.totalExpense}
                    color="red"
                />
            </div>

            {/* Gráfico */}
            <ExpensePieChart data={data.expensesByCategory} />

            {/* Progresso das Metas */}
            <div className="bg-white rounded-xl shadow p-4 mt-6">
                <h2 className="text-sm font-semibold mb-2">
                    Progresso das Metas
                </h2>

                <p className="text-sm mb-2">
                    R$ {data.goalsTotalSaved.toFixed(2)} /
                    R$ {data.goalsTotalTarget.toFixed(2)}
                </p>

                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-purple-600 h-3 rounded-full transition-all"
                        style={{
                            width: `${Math.min(
                                data.goalsProgressPercent,
                                100
                            )}%`,
                        }}
                    />
                </div>

                <p className="text-xs text-gray-500 mt-1">
                    {data.goalsProgressPercent.toFixed(1)}% concluído
                </p>
            </div>

        </div>
    );
}
