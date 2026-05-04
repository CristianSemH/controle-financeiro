import { getCurrentUser } from "@/src/lib/getCurrentUser";
import {
    resolveHouseholdId,
    serviceErrorResponse,
} from "@/src/services/householdService";
import {
    createTransaction,
    listTransactionsByHousehold,
} from "@/src/services/transactionService";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        const { searchParams } = new URL(req.url);
        const householdId = await resolveHouseholdId(
            user.id,
            searchParams.get("householdId")
        );

        const transactions = await listTransactionsByHousehold({
            householdId,
            monthYear: searchParams.get("monthYear"),
            purchaseMonthYear: searchParams.get("purchaseMonthYear"),
            type: searchParams.get("type"),
            categoryId: searchParams.get("categoryId"),
            cardId: searchParams.get("cardId"),
            description: searchParams.get("description"),
        });

        return Response.json(transactions);
    } catch (error) {
        return serviceErrorResponse(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        const body = await req.json();
        const householdId = await resolveHouseholdId(user.id, body.householdId);

        const transaction = await createTransaction({
            ...body,
            householdId,
            createdById: user.id,
        });

        return Response.json(transaction, { status: 201 });
    } catch (error) {
        return serviceErrorResponse(error);
    }
}
