import { getCurrentUser } from "@/src/lib/getCurrentUser";
import {
    createHouseholdForUser,
    listHouseholdsForUser,
    serviceErrorResponse,
} from "@/src/services/householdService";

export async function GET() {
    try {
        const user = await getCurrentUser();
        const households = await listHouseholdsForUser(user.id);

        return Response.json(households);
    } catch (error) {
        return serviceErrorResponse(error);
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        const body = await req.json();
        const name = typeof body.name === "string" ? body.name.trim() : "";

        if (!name) {
            return Response.json(
                { error: "Nome da familia e obrigatorio" },
                { status: 400 }
            );
        }

        const household = await createHouseholdForUser(user.id, name);

        return Response.json(household, { status: 201 });
    } catch (error) {
        return serviceErrorResponse(error);
    }
}
