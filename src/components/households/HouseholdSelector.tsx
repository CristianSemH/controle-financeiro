"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { useHousehold } from "@/src/contexts/HouseholdContext";

export default function HouseholdSelector() {
    const {
        households,
        householdId,
        loading,
        setHouseholdId,
    } = useHousehold();

    if (loading) return null;

    if (households.length === 0) {
        return (
            <Link
                href="/create-household"
                className="flex items-center gap-2 text-sm text-indigo-600"
            >
                <Users size={16} />
                Criar família 
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                <Users size={14} className="text-indigo-600" />
                <p className="text-sm">Família</p>
                <select
                    value={householdId ?? ""}
                    onChange={(e) => setHouseholdId(e.target.value)}
                    className="bg-transparent text-sm font-medium outline-none"
                >
                    {households.map((h) => (
                        <option key={h.id} value={h.id}>
                            {h.name}
                        </option>
                    ))}
                </select>
            </div>

        </div>
    );
}