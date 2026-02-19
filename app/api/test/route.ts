import { prisma } from "../../../src/lib/prisma"

export async function GET() {
    const count = await prisma.transaction.count();

    return Response.json({ ok: true, transactions: count });
}
