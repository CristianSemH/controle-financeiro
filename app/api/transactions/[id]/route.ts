import { prisma } from "@/src/lib/prisma";
import { NextRequest } from "next/server";

// BUSCAR POR ID
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: { category: true },
    });

    if (!transaction) {
        return Response.json({ error: "Não encontrado" }, { status: 404 });
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

    const transaction = await prisma.transaction.update({
        where: { id },
        data: {
            ...body,
            date: body.date ? new Date(body.date) : undefined,
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

    await prisma.transaction.delete({
        where: { id },
    });

    return Response.json({ message: "Deletado com sucesso" });
}
