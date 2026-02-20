import { getCurrentUser } from "@/src/lib/getCurrentUser";
import { prisma } from "@/src/lib/prisma";
import { NextRequest } from "next/server";

// LISTAR
export async function GET() {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
    });

    return Response.json(categories);
}

// CRIAR
export async function POST(req: NextRequest) {

    const user = await getCurrentUser();

    const body = await req.json();
    const { name, type } = body;

    if (!name || !type) {
        return Response.json(
            { error: "Nome e tipo são obrigatórios" },
            { status: 400 }
        );
    }

    const category = await prisma.category.create({
        data: {
            name,
            type,
            userId: user.id
        },
    });

    return Response.json(category, { status: 201 });
}
