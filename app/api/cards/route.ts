import { getCurrentUser } from "@/src/lib/getCurrentUser";
import { prisma } from "@/src/lib/prisma";
import {
    resolveHouseholdId,
    serviceErrorResponse,
} from "@/src/services/householdService";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        const { searchParams } = new URL(req.url);
        const householdId = await resolveHouseholdId(
            user.id,
            searchParams.get("householdId")
        );

        const cards = await prisma.card.findMany({
            orderBy: { name: "asc" },
            where: { householdId },
        });

        return Response.json(cards);
    } catch (error) {
        return serviceErrorResponse(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        const body = await req.json();
        const { name, dueDay, limit } = body;
        const householdId = await resolveHouseholdId(user.id, body.householdId);

        if (!name || dueDay === undefined || dueDay === null || limit === undefined || limit === null) {
            return Response.json(
                { error: "Nome, dia de vencimento e limite sao obrigatorios" },
                { status: 400 }
            );
        }

        const parsedDueDay = Number(dueDay);
        const parsedLimit = Number(limit);

        if (!Number.isInteger(parsedDueDay) || parsedDueDay < 1 || parsedDueDay > 31) {
            return Response.json(
                { error: "Informe um dia de vencimento valido entre 1 e 31" },
                { status: 400 }
            );
        }

        if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
            return Response.json(
                { error: "Informe um limite valido" },
                { status: 400 }
            );
        }

        const card = await prisma.card.create({
            data: {
                name,
                dueDay: parsedDueDay,
                limit: parsedLimit,
                householdId,
            },
        });

        return Response.json(card, { status: 201 });
    } catch (error) {
        return serviceErrorResponse(error);
    }
}
