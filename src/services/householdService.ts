import { prisma } from "@/src/lib/prisma";

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
type DbClient = typeof prisma | PrismaTransaction;

type HouseholdRole = "OWNER" | "ADMIN" | "MEMBER";

export class ServiceError extends Error {
    status: number;

    constructor(message: string, status = 400) {
        super(message);
        this.status = status;
    }
}

export function serviceErrorResponse(error: unknown) {
    if (error instanceof ServiceError) {
        return Response.json({ error: error.message }, { status: error.status });
    }

    return Response.json({ error: "Erro interno" }, { status: 500 });
}

export async function assertHouseholdMember(
    userId: string,
    householdId: string,
    db: DbClient = prisma
) {
    const membership = await db.householdMember.findUnique({
        where: {
            householdId_userId: {
                householdId,
                userId,
            },
        },
        include: {
            household: true,
        },
    });

    if (!membership) {
        throw new ServiceError("Voce nao tem acesso a esta familia", 403);
    }

    return membership;
}

export async function resolveHouseholdId(
    userId: string,
    householdId?: string | null,
    db: DbClient = prisma
) {
    if (householdId) {
        await assertHouseholdMember(userId, householdId, db);
        return householdId;
    }

    const membership = await db.householdMember.findFirst({
        where: { userId },
        select: {
            householdId: true,
        },
    });

    if (!membership) {
        throw new ServiceError("Nenhuma familia encontrada para o usuario", 404);
    }

    return membership.householdId;
}

export async function assertHouseholdManager(
    userId: string,
    householdId: string,
    db: DbClient = prisma
) {
    const membership = await assertHouseholdMember(userId, householdId, db);

    if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
        throw new ServiceError("Voce nao pode gerenciar membros desta familia", 403);
    }

    return membership;
}

export async function listHouseholdsForUser(userId: string) {
    const memberships = await prisma.householdMember.findMany({
        where: { userId },
        include: {
            household: true,
        },
        orderBy: {
            household: {
                createdAt: "asc",
            },
        },
    });

    return memberships.map((membership) => ({
        ...membership.household,
        role: membership.role,
    }));
}

export async function createHouseholdForUser(userId: string, name: string) {
    return prisma.$transaction(async (tx) => {
        const household = await tx.household.create({
            data: {
                name,
                members: {
                    create: {
                        userId,
                        role: "OWNER",
                    },
                },
            },
            include: {
                members: true,
            },
        });

        return household;
    });
}

export async function addUserToHousehold({
    householdId,
    currentUserId,
    userId,
    email,
    role = "MEMBER",
}: {
    householdId: string;
    currentUserId: string;
    userId?: string;
    email?: string;
    role?: string;
}) {
    if (!userId && !email) {
        throw new ServiceError("Informe o usuario ou email do membro", 400);
    }

    if (!["OWNER", "ADMIN", "MEMBER"].includes(role)) {
        throw new ServiceError("Papel invalido", 400);
    }

    const memberRole = role as HouseholdRole;

    return prisma.$transaction(async (tx) => {
        await assertHouseholdManager(currentUserId, householdId, tx);

        const user = await tx.user.findFirst({
            where: userId
                ? { id: userId }
                : { email: email?.trim().toLowerCase() },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        if (!user) {
            throw new ServiceError("Usuario nao encontrado", 404);
        }

        const member = await tx.householdMember.upsert({
            where: {
                householdId_userId: {
                    householdId,
                    userId: user.id,
                },
            },
            create: {
                householdId,
                userId: user.id,
                role: memberRole,
            },
            update: {
                role: memberRole,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return member;
    });
}

export async function listHouseholdMembers(userId: string, householdId: string) {
    await assertHouseholdMember(userId, householdId);

    return prisma.householdMember.findMany({
        where: { householdId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            role: "asc",
        },
    });
}
