export type Household = {
    id: string;
    name: string;
    role?: "OWNER" | "ADMIN" | "MEMBER";
};

export type HouseholdMember = {
    id: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    user: {
        id: string;
        name: string | null;
        email: string;
    };
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error ?? data.message ?? "Nao foi possivel concluir a operacao");
    }

    return data;
}

export async function fetchHouseholds() {
    const response = await fetch("/api/households");
    return parseJsonResponse<Household[]>(response);
}

export async function createHousehold(name: string) {
    const response = await fetch("/api/households", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    });

    return parseJsonResponse<Household>(response);
}

export async function fetchHouseholdMembers(householdId: string) {
    const response = await fetch(`/api/households/${householdId}/members`);
    return parseJsonResponse<HouseholdMember[]>(response);
}

export async function addHouseholdMember({
    householdId,
    email,
    role,
}: {
    householdId: string;
    email: string;
    role: "ADMIN" | "MEMBER";
}) {
    const response = await fetch(`/api/households/${householdId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
    });

    return parseJsonResponse<HouseholdMember>(response);
}
