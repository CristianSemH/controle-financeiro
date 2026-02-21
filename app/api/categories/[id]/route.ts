import { getCurrentUser } from "@/src/lib/getCurrentUser";
import { prisma } from "@/src/lib/prisma";
import { NextRequest } from "next/server";

// BUSCAR POR ID
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {

    const user = await getCurrentUser();

    const { id } = await context.params;

    const category = await prisma.category.findUnique({
        where: { id, userId: user.id }
    });

    if (!category) {
        return Response.json({ error: "Não encontrada" }, { status: 404 });
    }

    return Response.json(category);
}

// ATUALIZAR
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    const user = await getCurrentUser();

    const body = await req.json();

    const category = await prisma.category.update({
        where: { id, userId: user.id },
        data: body,
    });

    return Response.json(category);
}

// DELETAR
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {

    const user = await getCurrentUser();

    const { id } = await context.params;

    await prisma.category.delete({
        where: { id, userId: user.id },
    });

    return Response.json({ message: "Categoria deletada com sucesso" });
}
