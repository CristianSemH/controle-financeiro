import { getCurrentUser } from "@/src/lib/getCurrentUser";
import { prisma } from "@/src/lib/prisma";
import { NextRequest } from "next/server";

function parseDateOnly(value: string) {
    const [year, month] = value.split("T")[0].split("-").map(Number);
    return { year, month };
}

function buildCreditDueDate(purchaseDate: string, dueDay: number) {
    const { year, month } = parseDateOnly(purchaseDate);
    const dueMonth = month === 12 ? 1 : month + 1;
    const dueYear = month === 12 ? year + 1 : year;
    const maxDay = new Date(dueYear, dueMonth, 0).getDate();
    const clampedDueDay = Math.min(dueDay, maxDay);

    return new Date(dueYear, dueMonth - 1, clampedDueDay);
}

// BUSCAR POR ID
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const user = await getCurrentUser();

    const transaction = await prisma.transaction.findUnique({
        where: { id, userId: user.id },
        include: { category: true, card: true },
    });

    if (!transaction) {
        return Response.json({ error: "Nao encontrado" }, { status: 404 });
    }

    return Response.json(transaction);
}

// ATUALIZAR
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const body = await req.json();
    const user = await getCurrentUser();

    const { type, paymentMethod, purchaseDate, cardId } = body;

    if (type === "EXPENSE" && !paymentMethod) {
        return Response.json(
            { error: "Forma de pagamento e obrigatoria para despesas" },
            { status: 400 }
        );
    }

    if (type === "EXPENSE" && !purchaseDate) {
        return Response.json(
            { error: "Data de compra e obrigatoria para despesas" },
            { status: 400 }
        );
    }

    let resolvedDate = body.date ? new Date(body.date) : undefined;
    let resolvedCardId: string | null | undefined = body.cardId;

    if (type === "EXPENSE" && paymentMethod === "CREDIT") {
        if (!cardId) {
            return Response.json(
                { error: "Selecione um cartao para compras no credito" },
                { status: 400 }
            );
        }

        const card = await prisma.card.findUnique({
            where: { id: cardId, userId: user.id }
        });

        if (!card) {
            return Response.json(
                { error: "Cartao nao encontrado" },
                { status: 404 }
            );
        }

        if (!resolvedDate) {
            resolvedDate = buildCreditDueDate(purchaseDate, card.dueDay);
        }
        resolvedCardId = card.id;
    }

    if (type === "EXPENSE" && paymentMethod !== "CREDIT") {
        resolvedCardId = null;
    }

    if (type !== "EXPENSE") {
        resolvedCardId = null;
    }

    if (!resolvedDate) {
        return Response.json(
            { error: "Data de pagamento e obrigatoria" },
            { status: 400 }
        );
    }

    const transaction = await prisma.transaction.update({
        where: { id, userId: user.id },
        data: {
            ...body,
            date: resolvedDate,
            purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
            paymentMethod: type === "EXPENSE" ? paymentMethod : null,
            cardId: type === "EXPENSE" ? resolvedCardId : null,
        },
    });

    return Response.json(transaction);
}

// DELETAR
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const user = await getCurrentUser();

    await prisma.transaction.delete({
        where: { id, userId: user.id },
    });

    return Response.json({ message: "Deletado com sucesso" });
}
