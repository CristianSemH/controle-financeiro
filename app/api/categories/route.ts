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

        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
            where: { householdId },
        });

        return Response.json(categories);
    } catch (error) {
        return serviceErrorResponse(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        const body = await req.json();
        const { name, type } = body;
        const householdId = await resolveHouseholdId(user.id, body.householdId);

        if (!name || !type) {
            return Response.json(
                { error: "Nome e tipo sao obrigatorios" },
                { status: 400 }
            );
        }

        const category = await prisma.category.create({
            data: {
                name,
                type,
                householdId,
            },
        });

        return Response.json(category, { status: 201 });
    } catch (error) {
        return serviceErrorResponse(error);
    }
}
