import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Preencha nome, email e senha." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const userExists = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (userExists) {
      return NextResponse.json(
        { message: "Já existe uma conta com este email." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "Conta criada com sucesso." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Não foi possível criar a conta." },
      { status: 500 }
    );
  }
}
