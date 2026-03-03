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

// LISTAR
export async function GET(req: NextRequest) {

    const user = await getCurrentUser();

    const { searchParams } = new URL(req.url);

    const monthYear = searchParams.get("monthYear");
    const purchaseMonthYear = searchParams.get("purchaseMonthYear");
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");

    let startDate: Date | undefined;
    let endDate: Date | undefined;
    let startPurchaseDate: Date | undefined;
    let endPurchaseDate: Date | undefined;

    if (monthYear) {
        const [year, month] = monthYear.split("-").map(Number);

        if (!Number.isNaN(year) && !Number.isNaN(month)) {
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59, 999);
        }
    }

    if (purchaseMonthYear) {
        const [year, month] = purchaseMonthYear.split("-").map(Number);

        if (!Number.isNaN(year) && !Number.isNaN(month)) {
            startPurchaseDate = new Date(year, month - 1, 1);
            endPurchaseDate = new Date(year, month, 0, 23, 59, 59, 999);
        }
    }

    const transactions = await prisma.transaction.findMany({
        include: {
            category: true,
            card: true,
        },
        orderBy: {
            date: "desc",
        },
        where: {
            userId: user.id,
            ...(startDate && endDate
                ? {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                }
                : {}),
            ...(startPurchaseDate && endPurchaseDate
                ? {
                    purchaseDate: {
                        gte: startPurchaseDate,
                        lte: endPurchaseDate,
                    },
                }
                : {}),
            ...(type && type !== "ALL" ? { type: type === "INCOME" ? "INCOME" : "EXPENSE" } : {}),
            ...(categoryId && categoryId !== "ALL" ? { categoryId } : {}),
        }
    });

    return Response.json(transactions);
}

// CRIAR
export async function POST(req: NextRequest) {

    const user = await getCurrentUser();

    const body = await req.json();

    const { description, amount, type, categoryId, date, purchaseDate, paymentMethod, cardId } = body;

    if (!description || !amount || !type || !categoryId) {
        return Response.json(
            { error: "Campos obrigatorios faltando" },
            { status: 400 }
        );
    }

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

    let parsedDate = date ? new Date(date) : undefined;
    let parsedPurchaseDate = purchaseDate ? new Date(purchaseDate) : undefined;
    let resolvedCardId: string | undefined;

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

        if (!parsedDate) {
            parsedDate = buildCreditDueDate(purchaseDate, card.dueDay);
        }
        resolvedCardId = card.id;
    }

    if (!parsedDate) {
        return Response.json(
            { error: "Data de pagamento e obrigatoria" },
            { status: 400 }
        );
    }

    const transaction = await prisma.transaction.create({
        data: {
            description,
            amount,
            type,
            categoryId,
            date: parsedDate,
            purchaseDate: type === "EXPENSE" ? parsedPurchaseDate : undefined,
            paymentMethod: type === "EXPENSE" ? paymentMethod : undefined,
            cardId: type === "EXPENSE" ? resolvedCardId : undefined,
            userId: user.id
        },
    });

    return Response.json(transaction, { status: 201 });
}
