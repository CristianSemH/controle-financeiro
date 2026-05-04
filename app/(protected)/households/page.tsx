"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import Button from "@/src/components/ui/Button";
import { useHousehold } from "@/src/contexts/HouseholdContext";

export default function HouseholdListPage() {
    const {
        households,
        householdId,
        loading,
        error,
        setHouseholdId,
    } = useHousehold();

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">
                        Familias
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Selecione ou gerencie seus grupos financeiros.
                    </p>
                </div>

                <Link
                    href="/create-household"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-2xl text-sm hover:bg-indigo-700 transition"
                >
                    Criar
                </Link>
            </div>

            {loading && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 text-sm text-slate-500">
                    Carregando familias...
                </div>
            )}

            {error && (
                <div className="bg-rose-50 rounded-2xl border border-rose-100 p-4 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {!loading && households.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
                    <Users className="mx-auto text-slate-300 mb-3" size={28} />
                    <p className="text-sm text-slate-500">
                        Nenhuma familia encontrada.
                    </p>
                    <div className="mt-5">
                        <Link href="/create-household">
                            <Button type="button">Criar primeira familia</Button>
                        </Link>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {households.map((household) => {
                    const isActive = household.id === householdId;

                    return (
                        <div
                            key={household.id}
                            className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                        >
                            <div>
                                <p className="font-semibold text-slate-800">
                                    {household.name}
                                </p>
                                {household.role && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        Papel: {household.role}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col md:flex-row gap-2">
                                <button
                                    type="button"
                                    onClick={() => setHouseholdId(household.id)}
                                    className={`px-4 py-2 rounded-2xl text-sm transition ${isActive
                                        ? "bg-indigo-100 text-indigo-700"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        }`}
                                >
                                    {isActive ? "Ativa" : "Usar"}
                                </button>

                                <Link
                                    href={`/households/${household.id}/members`}
                                    className="px-4 py-2 rounded-2xl text-sm bg-white border border-slate-200 text-slate-700 text-center hover:bg-slate-50 transition"
                                >
                                    Membros
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
