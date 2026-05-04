import { getCurrentUser } from "@/src/lib/getCurrentUser";
import {
    addUserToHousehold,
    listHouseholdMembers,
    serviceErrorResponse,
} from "@/src/services/householdService";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        const { id } = await context.params;
        const members = await listHouseholdMembers(user.id, id);

        return Response.json(members);
    } catch (error) {
        return serviceErrorResponse(error);
    }
}

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        const { id } = await context.params;
        const body = await req.json();

        const member = await addUserToHousehold({
            householdId: id,
            currentUserId: currentUser.id,
            userId: typeof body.userId === "string" ? body.userId : undefined,
            email: typeof body.email === "string" ? body.email : undefined,
            role: typeof body.role === "string" ? body.role : undefined,
        });

        return Response.json(member, { status: 201 });
    } catch (error) {
        return serviceErrorResponse(error);
    }
}
