import { getCurrentUser } from "@/src/lib/getCurrentUser";
import { prisma } from "@/src/lib/prisma";
import {
    assertHouseholdMember,
    serviceErrorResponse,
} from "@/src/services/householdService";
import { NextRequest } from "next/server";

async function getAccessibleCard(userId: string, id: string) {
    const card = await prisma.card.findUnique({
        where: { id },
    });

    if (!card) {
        return null;
    }

    await assertHouseholdMember(userId, card.householdId);

    return card;
}

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        const { id } = await context.params;
        const card = await getAccessibleCard(user.id, id);

        if (!card) {
            return Response.json({ error: "Cartao nao encontrado" }, { status: 404 });
        }

        return Response.json(card);
    } catch (error) {
        return serviceErrorResponse(error);
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        const { id } = await context.params;
        const body = await req.json();
        const card = await getAccessibleCard(user.id, id);

        if (!card) {
            return Response.json({ error: "Cartao nao encontrado" }, { status: 404 });
        }

        const parsedDueDay = body.dueDay !== undefined
            ? Number(body.dueDay)
            : undefined;

        const parsedLimit = body.limit !== undefined
            ? Number(body.limit)
            : undefined;

        if (parsedDueDay !== undefined && (!Number.isInteger(parsedDueDay) || parsedDueDay < 1 || parsedDueDay > 31)) {
            return Response.json(
                { error: "Informe um dia de vencimento valido entre 1 e 31" },
                { status: 400 }
            );
        }

        if (parsedLimit !== undefined && (!Number.isFinite(parsedLimit) || parsedLimit <= 0)) {
            return Response.json(
                { error: "Informe um limite valido" },
                { status: 400 }
            );
        }

        const updatedCard = await prisma.card.update({
            where: { id },
            data: {
                name: body.name,
                dueDay: parsedDueDay,
                limit: parsedLimit,
            },
        });

        return Response.json(updatedCard);
    } catch (error) {
        return serviceErrorResponse(error);
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        const { id } = await context.params;
        const card = await getAccessibleCard(user.id, id);

        if (!card) {
            return Response.json({ error: "Cartao nao encontrado" }, { status: 404 });
        }

        await prisma.card.delete({
            where: { id },
        });

        return Response.json({ message: "Cartao deletado com sucesso" });
    } catch (error) {
        return serviceErrorResponse(error);
    }
}
