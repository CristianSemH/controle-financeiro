export type TransactionQuery = {
    householdId: string;
    monthYear: string;
    purchaseMonthYear?: string;
    type?: string;
    categoryId?: string;
    cardId?: string;
    description?: string;
};

export type TransactionPayload = {
    householdId: string;
    description: string;
    amount: number;
    type: string;
    categoryId: string;
    date: string;
    purchaseDate?: string;
    paymentMethod?: string;
    cardId?: string;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error ?? data.message ?? "Nao foi possivel concluir a operacao");
    }

    return data;
}

export async function fetchTransactions<T>(query: TransactionQuery) {
    const params = new URLSearchParams({
        householdId: query.householdId,
        monthYear: query.monthYear,
    });

    if (query.purchaseMonthYear) params.set("purchaseMonthYear", query.purchaseMonthYear);
    if (query.type && query.type !== "ALL") params.set("type", query.type);
    if (query.categoryId && query.categoryId !== "ALL") params.set("categoryId", query.categoryId);
    if (query.cardId && query.cardId !== "ALL") params.set("cardId", query.cardId);
    if (query.description) params.set("description", query.description);

    const response = await fetch(`/api/transactions?${params.toString()}`);
    return parseJsonResponse<T>(response);
}

export async function createTransaction<T>(payload: TransactionPayload) {
    const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    return parseJsonResponse<T>(response);
}
