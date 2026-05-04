"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { useHousehold } from "@/src/contexts/HouseholdContext";

export default function HouseholdSelector() {
    const {
        households,
        householdId,
        activeHousehold,
        loading,
        setHouseholdId,
    } = useHousehold();

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3 text-sm text-slate-400">
                Carregando familia...
            </div>
        );
    }

    if (households.length === 0) {
        return (
            <Link
                href="/create-household"
                className="bg-white rounded-2xl border border-slate-100 px-4 py-3 text-sm text-indigo-600 flex items-center gap-2"
            >
                <Users size={16} />
                Criar familia
            </Link>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex items-center gap-2 text-slate-700">
                <Users size={16} className="text-indigo-600" />
                <span className="text-sm font-medium">Familia</span>
            </div>

            <select
                value={householdId ?? ""}
                onChange={(event) => setHouseholdId(event.target.value)}
                className="min-w-48 border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                {households.map((household) => (
                    <option key={household.id} value={household.id}>
                        {household.name}
                    </option>
                ))}
            </select>

            {activeHousehold && (
                <Link
                    href={`/households/${activeHousehold.id}/members`}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                    Membros
                </Link>
            )}
        </div>
    );
}
