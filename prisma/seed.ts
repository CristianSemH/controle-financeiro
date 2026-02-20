import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";


async function main() {

    CreateUser("cristianmichelb@gmail.com", "Cris@Gabe2909")
    CreateUser("gabrielerigo97@gmail.com", "Cris@Gabe2909")

}

async function CreateUser(email: string, password: string) {
    const existing = await prisma.user.findUnique({
        where: { email },
    });

    if (existing) {
        console.log("Usuário já existe.");
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            name: "Administrador",
            email,
            password: hashedPassword,
        },
    });

    console.log("Usuário admin criado com sucesso! ", email);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());