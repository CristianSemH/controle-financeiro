import { getCurrentUser } from "@/src/lib/getCurrentUser";
import { prisma } from "@/src/lib/prisma";
import {
    assertHouseholdMember,
    serviceErrorResponse,
} from "@/src/services/householdService";
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

async function getAccessibleTransaction(userId: string, id: string) {
    const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
            category: true,
            card: true,
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    if (!transaction) {
        return null;
    }

    await assertHouseholdMember(userId, transaction.householdId);

    return transaction;
}

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const user = await getCurrentUser();
        const transaction = await getAccessibleTransaction(user.id, id);

        if (!transaction) {
            return Response.json({ error: "Nao encontrado" }, { status: 404 });
        }

        return Response.json(transaction);
    } catch (error) {
        return serviceErrorResponse(error);
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await req.json();
        const user = await getCurrentUser();
        const existingTransaction = await getAccessibleTransaction(user.id, id);

        if (!existingTransaction) {
            return Response.json({ error: "Nao encontrado" }, { status: 404 });
        }

        const { type, paymentMethod, purchaseDate, cardId, categoryId } = body;
        const householdId = existingTransaction.householdId;

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

        if (categoryId) {
            const category = await prisma.category.findFirst({
                where: {
                    id: categoryId,
                    householdId,
                },
                select: {
                    id: true,
                },
            });

            if (!category) {
                return Response.json(
                    { error: "Categoria nao encontrada" },
                    { status: 404 }
                );
            }
        }

        let resolvedDate = body.date ? new Date(body.date) : undefined;
        let resolvedCardId: string | null | undefined = cardId;

        if (type === "EXPENSE" && paymentMethod === "CREDIT") {
            if (!cardId) {
                return Response.json(
                    { error: "Selecione um cartao para compras no credito" },
                    { status: 400 }
                );
            }

            const card = await prisma.card.findFirst({
                where: {
                    id: cardId,
                    householdId,
                },
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
            where: { id },
            data: {
                description: body.description,
                amount: body.amount !== undefined ? Number(body.amount) : undefined,
                type,
                categoryId,
                date: resolvedDate,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                paymentMethod: type === "EXPENSE" ? paymentMethod : null,
                cardId: type === "EXPENSE" ? resolvedCardId : null,
            },
        });

        return Response.json(transaction);
    } catch (error) {
        return serviceErrorResponse(error);
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const user = await getCurrentUser();
        const transaction = await getAccessibleTransaction(user.id, id);

        if (!transaction) {
            return Response.json({ error: "Nao encontrado" }, { status: 404 });
        }

        await prisma.transaction.delete({
            where: { id },
        });

        return Response.json({ message: "Deletado com sucesso" });
    } catch (error) {
        return serviceErrorResponse(error);
    }
}
