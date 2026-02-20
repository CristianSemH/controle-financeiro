import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";


async function main() {
    const email = "admin@financeiro.com";
    const password = "123456";

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

    console.log("Usuário admin criado com sucesso!");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());