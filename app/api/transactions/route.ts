import { getCurrentUser } from "@/src/lib/getCurrentUser";
import { prisma } from "@/src/lib/prisma";
import { NextRequest } from "next/server";

// LISTAR
export async function GET(req: NextRequest) {

    const user = await getCurrentUser();

    const { searchParams } = new URL(req.url);

    const monthYear = searchParams.get("monthYear");
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (monthYear) {
        const [year, month] = monthYear.split("-").map(Number);

        if (!Number.isNaN(year) && !Number.isNaN(month)) {
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59, 999);
        }
    }

    const transactions = await prisma.transaction.findMany({
        include: {
            category: true,
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

    const { description, amount, type, categoryId, date } = body;

    if (!description || !amount || !type || !categoryId || !date) {
        return Response.json(
            { error: "Campos obrigatórios faltando" },
            { status: 400 }
        );
    }

    const transaction = await prisma.transaction.create({
        data: {
            description,
            amount,
            type,
            categoryId,
            date: new Date(date),
            userId: user.id
        },
    });

    return Response.json(transaction, { status: 201 });
}
