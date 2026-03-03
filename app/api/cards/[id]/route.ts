import { getCurrentUser } from "@/src/lib/getCurrentUser";
import { prisma } from "@/src/lib/prisma";
import { NextRequest } from "next/server";

// BUSCAR POR ID
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    const { id } = await context.params;

    const card = await prisma.card.findUnique({
        where: { id, userId: user.id }
    });

    if (!card) {
        return Response.json({ error: "Cartao nao encontrado" }, { status: 404 });
    }

    return Response.json(card);
}

// ATUALIZAR
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    const { id } = await context.params;
    const body = await req.json();

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

    const card = await prisma.card.update({
        where: { id, userId: user.id },
        data: {
            ...body,
            dueDay: parsedDueDay,
            limit: parsedLimit
        }
    });

    return Response.json(card);
}

// DELETAR
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const user = await getCurrentUser();
    const { id } = await context.params;

    await prisma.card.delete({
        where: { id, userId: user.id }
    });

    return Response.json({ message: "Cartao deletado com sucesso" });
}
