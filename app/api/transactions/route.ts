import { getCurrentUser } from "@/src/lib/getCurrentUser";
import { prisma } from "@/src/lib/prisma";
import { NextRequest } from "next/server";

// LISTAR
export async function GET() {

    const transactions = await prisma.transaction.findMany({
        include: {
            category: true,
        },
        orderBy: {
            date: "desc",
        },
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
