import { prisma } from "@/src/lib/prisma";
import { PaymentMethod, TransactionType } from "@/app/generated/prisma/enums";
import { ServiceError } from "@/src/services/householdService";

type ListTransactionsInput = {
    householdId: string;
    monthYear?: string | null;
    purchaseMonthYear?: string | null;
    type?: string | null;
    categoryId?: string | null;
    cardId?: string | null;
    description?: string | null;
};

type CreateTransactionInput = {
    householdId: string;
    createdById: string;
    description?: string;
    amount?: number | string;
    type?: TransactionType;
    categoryId?: string;
    date?: string;
    purchaseDate?: string;
    paymentMethod?: PaymentMethod;
    cardId?: string;
};

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

function buildMonthRange(monthYear?: string | null) {
    if (!monthYear) return {};

    const [year, month] = monthYear.split("-").map(Number);

    if (Number.isNaN(year) || Number.isNaN(month)) return {};

    return {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month, 0, 23, 59, 59, 999),
    };
}

export async function listTransactionsByHousehold(input: ListTransactionsInput) {
    const dateRange = buildMonthRange(input.monthYear);
    const purchaseDateRange = buildMonthRange(input.purchaseMonthYear);

    return prisma.transaction.findMany({
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
        orderBy: {
            date: "desc",
        },
        where: {
            householdId: input.householdId,
            ...(Object.keys(dateRange).length > 0 ? { date: dateRange } : {}),
            ...(Object.keys(purchaseDateRange).length > 0
                ? { purchaseDate: purchaseDateRange }
                : {}),
            ...(input.type && input.type !== "ALL"
                ? { type: input.type === "INCOME" ? TransactionType.INCOME : TransactionType.EXPENSE }
                : {}),
            ...(input.categoryId && input.categoryId !== "ALL"
                ? { categoryId: input.categoryId }
                : {}),
            ...(input.cardId && input.cardId !== "ALL" ? { cardId: input.cardId } : {}),
            description: {
                contains: input.description || "",
                mode: "insensitive",
            },
        },
    });
}

export async function createTransaction(input: CreateTransactionInput) {
    const {
        householdId,
        createdById,
        description,
        amount,
        type,
        categoryId,
        date,
        purchaseDate,
        paymentMethod,
        cardId,
    } = input;

    if (!description || !amount || !type || !categoryId) {
        throw new ServiceError("Campos obrigatorios faltando", 400);
    }

    if (type === TransactionType.EXPENSE && !paymentMethod) {
        throw new ServiceError("Forma de pagamento e obrigatoria para despesas", 400);
    }

    if (type === TransactionType.EXPENSE && !purchaseDate) {
        throw new ServiceError("Data de compra e obrigatoria para despesas", 400);
    }

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
        throw new ServiceError("Categoria nao encontrada", 404);
    }

    let parsedDate = date ? new Date(date) : undefined;
    const parsedPurchaseDate = purchaseDate ? new Date(purchaseDate) : undefined;
    let resolvedCardId: string | undefined;

    if (type === TransactionType.EXPENSE && paymentMethod === PaymentMethod.CREDIT) {
        if (!cardId) {
            throw new ServiceError("Selecione um cartao para compras no credito", 400);
        }

        const card = await prisma.card.findFirst({
            where: {
                id: cardId,
                householdId,
            },
        });

        if (!card) {
            throw new ServiceError("Cartao nao encontrado", 404);
        }

        if (!parsedDate && purchaseDate) {
            parsedDate = buildCreditDueDate(purchaseDate, card.dueDay);
        }
        resolvedCardId = card.id;
    }

    if (!parsedDate) {
        throw new ServiceError("Data de pagamento e obrigatoria", 400);
    }

    return prisma.transaction.create({
        data: {
            description,
            amount: Number(amount),
            type,
            categoryId,
            date: parsedDate,
            purchaseDate: type === TransactionType.EXPENSE ? parsedPurchaseDate : undefined,
            paymentMethod: type === TransactionType.EXPENSE ? paymentMethod : undefined,
            cardId: type === TransactionType.EXPENSE ? resolvedCardId : undefined,
            householdId,
            createdById,
        },
    });
}
