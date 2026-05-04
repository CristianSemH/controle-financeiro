export type Category = {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
};

export type Card = {
    id: string;
    name: string;
    dueDay: number;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error ?? data.message ?? "Nao foi possivel carregar dados");
    }

    return data;
}

export async function fetchCategories(householdId: string) {
    const params = new URLSearchParams({ householdId });
    const response = await fetch(`/api/categories?${params.toString()}`);
    return parseJsonResponse<Category[]>(response);
}

export async function fetchCards(householdId: string) {
    const params = new URLSearchParams({ householdId });
    const response = await fetch(`/api/cards?${params.toString()}`);
    return parseJsonResponse<Card[]>(response);
}

export async function fetchDashboard<T>({
    householdId,
    month,
    year,
}: {
    householdId: string;
    month: number;
    year: number;
}) {
    const params = new URLSearchParams({
        householdId,
        month: String(month),
        year: String(year),
    });

    const response = await fetch(`/api/dashboard?${params.toString()}`);
    return parseJsonResponse<T>(response);
}
