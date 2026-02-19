import { prisma } from "@/src/lib/prisma";
import { NextRequest } from "next/server";

// ATUALIZAR
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const body = await req.json();

    const { amount } = body;

    const contribution = await prisma.goalContribution.update({
        where: { id },
        data: {
            amount: Number(amount),
        },
    });

    return Response.json(contribution);
}

// DELETAR
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    await prisma.goalContribution.delete({
        where: { id },
    });

    return Response.json({ message: "Reserva deletada" });
}
