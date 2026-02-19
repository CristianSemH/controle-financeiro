import { prisma } from "@/src/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const body = await req.json();

    const { amount } = body;

    if (!amount) {
        return Response.json(
            { error: "Valor é obrigatório" },
            { status: 400 }
        );
    }

    const contribution = await prisma.goalContribution.create({
        data: {
            amount: Number(amount),
            goalId: id,
        },
    });

    return Response.json(contribution);
}
