import { getCurrentUser } from "@/src/lib/getCurrentUser";
import { prisma } from "@/src/lib/prisma";
import {
    assertHouseholdMember,
    serviceErrorResponse,
} from "@/src/services/householdService";
import { NextRequest } from "next/server";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        const { id } = await context.params;
        const body = await req.json();
        const { amount } = body;

        if (!amount) {
            return Response.json(
                { error: "Valor e obrigatorio" },
                { status: 400 }
            );
        }

        const goal = await prisma.goal.findUnique({
            where: { id },
            select: {
                id: true,
                householdId: true,
            },
        });

        if (!goal) {
            return Response.json({ error: "Meta nao encontrada" }, { status: 404 });
        }

        await assertHouseholdMember(user.id, goal.householdId);

        const contribution = await prisma.goalContribution.create({
            data: {
                amount: Number(amount),
                goalId: id,
            },
        });

        return Response.json(contribution);
    } catch (error) {
        return serviceErrorResponse(error);
    }
}
