"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHousehold } from "@/src/contexts/HouseholdContext";

export function useRequireHousehold() {
    const router = useRouter();
    const household = useHousehold();

    useEffect(() => {
        if (!household.loading && !household.householdId) {
            router.replace("/create-household");
        }
    }, [household.householdId, household.loading, router]);

    return household;
}
