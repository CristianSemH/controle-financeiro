"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    fetchHouseholds,
    Household,
} from "@/src/services/client/householdApi";

type HouseholdStore = {
    householdId: string | null;
    households: Household[];
    loading: boolean;
    error: string;
    activeHousehold: Household | null;
    setHouseholdId: (id: string) => void;
    setHouseholds: (households: Household[]) => void;
    refreshHouseholds: () => Promise<void>;
};

const HouseholdContext = createContext<HouseholdStore | null>(null);

const storageKey = "controle-financeiro:householdId";

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
    const [householdId, setHouseholdIdState] = useState<string | null>(null);
    const [households, setHouseholdsState] = useState<Household[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const setHouseholdId = useCallback((id: string) => {
        setHouseholdIdState(id);
        window.localStorage.setItem(storageKey, id);
    }, []);

    const setHouseholds = useCallback((nextHouseholds: Household[]) => {
        setHouseholdsState(nextHouseholds);
    }, []);

    const refreshHouseholds = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const nextHouseholds = await fetchHouseholds();
            const storedHouseholdId = window.localStorage.getItem(storageKey);
            const storedExists = nextHouseholds.some(
                (household) => household.id === storedHouseholdId
            );
            const nextHouseholdId = storedExists
                ? storedHouseholdId
                : nextHouseholds.length === 1
                    ? nextHouseholds[0].id
                    : nextHouseholds[0]?.id ?? null;

            setHouseholdsState(nextHouseholds);
            setHouseholdIdState(nextHouseholdId);

            if (nextHouseholdId) {
                window.localStorage.setItem(storageKey, nextHouseholdId);
            } else {
                window.localStorage.removeItem(storageKey);
            }
        } catch (currentError) {
            setError(
                currentError instanceof Error
                    ? currentError.message
                    : "Nao foi possivel carregar familias"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refreshHouseholds();
    }, [refreshHouseholds]);

    const activeHousehold = useMemo(
        () => households.find((household) => household.id === householdId) ?? null,
        [householdId, households]
    );

    const value = useMemo(
        () => ({
            householdId,
            households,
            loading,
            error,
            activeHousehold,
            setHouseholdId,
            setHouseholds,
            refreshHouseholds,
        }),
        [
            activeHousehold,
            error,
            householdId,
            households,
            loading,
            refreshHouseholds,
            setHouseholdId,
            setHouseholds,
        ]
    );

    return (
        <HouseholdContext.Provider value={value}>
            {children}
        </HouseholdContext.Provider>
    );
}

export function useHousehold() {
    const context = useContext(HouseholdContext);

    if (!context) {
        throw new Error("useHousehold must be used within HouseholdProvider");
    }

    return context;
}
