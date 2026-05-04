import { getCurrentUser } from "@/src/lib/getCurrentUser";
import { prisma } from "@/src/lib/prisma";
import {
    assertHouseholdMember,
    serviceErrorResponse,
} from "@/src/services/householdService";
import { NextRequest } from "next/server";

async function getAccessibleCategory(userId: string, id: string) {
    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        return null;
    }

    await assertHouseholdMember(userId, category.householdId);

    return category;
}

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        const { id } = await context.params;
        const category = await getAccessibleCategory(user.id, id);

        if (!category) {
            return Response.json({ error: "Nao encontrada" }, { status: 404 });
        }

        return Response.json(category);
    } catch (error) {
        return serviceErrorResponse(error);
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        const { id } = await context.params;
        const body = await req.json();
        const category = await getAccessibleCategory(user.id, id);

        if (!category) {
            return Response.json({ error: "Nao encontrada" }, { status: 404 });
        }

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: {
                name: body.name,
                type: body.type,
            },
        });

        return Response.json(updatedCategory);
    } catch (error) {
        return serviceErrorResponse(error);
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        const { id } = await context.params;
        const category = await getAccessibleCategory(user.id, id);

        if (!category) {
            return Response.json({ error: "Nao encontrada" }, { status: 404 });
        }

        await prisma.category.delete({
            where: { id },
        });

        return Response.json({ message: "Categoria deletada com sucesso" });
    } catch (error) {
        return serviceErrorResponse(error);
    }
}
