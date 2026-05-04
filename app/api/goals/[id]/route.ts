import { getCurrentUser } from "@/src/lib/getCurrentUser";
import { prisma } from "@/src/lib/prisma";
import {
    assertHouseholdMember,
    serviceErrorResponse,
} from "@/src/services/householdService";
import { NextRequest } from "next/server";

async function getAccessibleGoal(userId: string, id: string) {
    const goal = await prisma.goal.findUnique({
        where: { id },
    });

    if (!goal) {
        return null;
    }

    await assertHouseholdMember(userId, goal.householdId);

    return goal;
}

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        const { id } = await context.params;
        const goal = await getAccessibleGoal(user.id, id);

        if (!goal) {
            return Response.json({ error: "Meta nao encontrada" }, { status: 404 });
        }

        return Response.json(goal);
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
        const goal = await getAccessibleGoal(user.id, id);

        if (!goal) {
            return Response.json({ error: "Meta nao encontrada" }, { status: 404 });
        }

        const updatedGoal = await prisma.goal.update({
            where: { id },
            data: {
                name: body.name,
                targetAmount: body.targetAmount !== undefined
                    ? Number(body.targetAmount)
                    : undefined,
                targetDate: body.targetDate
                    ? new Date(body.targetDate)
                    : undefined,
            },
        });

        return Response.json(updatedGoal);
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
        const goal = await getAccessibleGoal(user.id, id);

        if (!goal) {
            return Response.json({ error: "Meta nao encontrada" }, { status: 404 });
        }

        await prisma.goal.delete({
            where: { id },
        });

        return Response.json({ message: "Meta deletada com sucesso" });
    } catch (error) {
        return serviceErrorResponse(error);
    }
}
