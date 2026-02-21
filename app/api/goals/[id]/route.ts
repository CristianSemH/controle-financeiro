import { getCurrentUser } from "@/src/lib/getCurrentUser";
import { prisma } from "@/src/lib/prisma";
import { NextRequest } from "next/server";

// BUSCAR POR ID
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    const user = await getCurrentUser();

    const goal = await prisma.goal.findUnique({
        where: { id, userId: user.id },
    });

    if (!goal) {
        return Response.json({ error: "Meta não encontrada" }, { status: 404 });
    }

    return Response.json(goal);
}

// ATUALIZAR
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const body = await req.json();
    const user = await getCurrentUser();

    const goal = await prisma.goal.update({
        where: { id, userId: user.id },
        data: {
            ...body,
            targetDate: body.targetDate
                ? new Date(body.targetDate)
                : undefined,
        },
    });

    return Response.json(goal);
}

// DELETAR
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const user = await getCurrentUser();

    await prisma.goal.delete({
        where: { id, userId: user.id },
    });

    return Response.json({ message: "Meta deletada com sucesso" });
}
