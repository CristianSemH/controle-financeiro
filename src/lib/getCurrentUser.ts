import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Não autenticado");
  }

  return session.user;
}