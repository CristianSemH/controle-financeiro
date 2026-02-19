import { prisma } from "@/src/lib/prisma";
import { NextRequest } from "next/server";

// LISTAR
export async function GET() {
    const goals = await prisma.goal.findMany({
        include: {
            contributions: {
                orderBy: { createdAt: "desc" },
            },
        },
    });

    const formattedGoals = goals.map(goal => {
        const totalSaved = goal.contributions.reduce(
            (acc, c) => acc + Number(c.amount),
            0
        );

        return {
            ...goal,
            totalSaved,
        };
    });

    return Response.json(formattedGoals);
}

// CRIAR
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { name, targetAmount, targetDate } = body;

    if (!name || !targetAmount || !targetDate) {
        return Response.json(
            { error: "Todos os campos são obrigatórios" },
            { status: 400 }
        );
    }

    const goal = await prisma.goal.create({
        data: {
            name,
            targetAmount,
            targetDate: new Date(targetDate),
        },
    });

    return Response.json(goal, { status: 201 });
}
