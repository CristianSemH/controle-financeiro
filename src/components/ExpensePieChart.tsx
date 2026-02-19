"use client";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const COLORS = [
    "#2563eb",
    "#16a34a",
    "#dc2626",
    "#f59e0b",
    "#7c3aed",
    "#0891b2",
    "#ea580c",
];

export default function ExpensePieChart({ data }: any) {
    if (!data || data.length === 0) return null;

    const sortedData = [...data].sort((a, b) => b.total - a.total);

    const totalAmount = sortedData.reduce(
        (acc, item) => acc + item.total,
        0
    );

    return (
        <div className="bg-white rounded-xl shadow p-4 mt-6">
            <h2 className="text-sm font-semibold mb-4">
                Distribuição de Gastos
            </h2>

            <div className="w-full h-64">
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={sortedData}
                            dataKey="total"
                            nameKey="category"
                            outerRadius={90}
                            label={(props: any) => {
                                const percent = props.percent ?? 0;
                                return `${(percent * 100).toFixed(1)}%`;
                            }}

                        >
                            {sortedData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>

                        <Tooltip
                            formatter={(value: any) =>
                                `R$ ${Number(value).toFixed(2)}`
                            }
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legenda */}
            <div className="mt-4 space-y-2">
                {sortedData.map((item, index) => {
                    const percentage =
                        (item.total / totalAmount) * 100;

                    return (
                        <div
                            key={index}
                            className="flex justify-between items-center text-sm"
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                        backgroundColor:
                                            COLORS[index % COLORS.length],
                                    }}
                                />
                                <span>{item.category}</span>
                            </div>

                            <div className="text-gray-600">
                                {percentage.toFixed(1)}% • R${" "}
                                {item.total.toFixed(2)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
