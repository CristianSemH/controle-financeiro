import { getCurrentUser } from "@/src/lib/getCurrentUser";
import { prisma } from "@/src/lib/prisma";
import {
    resolveHouseholdId,
    serviceErrorResponse,
} from "@/src/services/householdService";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        const { searchParams } = new URL(req.url);
        const householdId = await resolveHouseholdId(
            user.id,
            searchParams.get("householdId")
        );

        const goals = await prisma.goal.findMany({
            where: { householdId },
            include: {
                contributions: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        const formattedGoals = goals.map((goal) => {
            const totalSaved = goal.contributions.reduce(
                (acc, contribution) => acc + Number(contribution.amount),
                0
            );

            return {
                ...goal,
                totalSaved,
            };
        });

        return Response.json(formattedGoals);
    } catch (error) {
        return serviceErrorResponse(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        const body = await req.json();
        const { name, targetAmount, targetDate } = body;
        const householdId = await resolveHouseholdId(user.id, body.householdId);

        if (!name || !targetAmount || !targetDate) {
            return Response.json(
                { error: "Todos os campos sao obrigatorios" },
                { status: 400 }
            );
        }

        const goal = await prisma.goal.create({
            data: {
                name,
                targetAmount: Number(targetAmount),
                targetDate: new Date(targetDate),
                householdId,
            },
        });

        return Response.json(goal, { status: 201 });
    } catch (error) {
        return serviceErrorResponse(error);
    }
}
