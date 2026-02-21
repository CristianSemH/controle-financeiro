"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Mail, DollarSign } from "lucide-react";

import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";
import Label from "@/src/components/ui/Label";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou senha inválidos.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

      <div className="w-full max-w-sm">

        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md mb-4">
            <DollarSign className="text-white" size={24} />
          </div>

          <h1 className="text-2xl font-semibold text-slate-800">
            Controle Financeiro
          </h1>

          <p className="text-sm text-slate-400 mt-1">
            Acesse sua conta
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-3.5 text-slate-400"
                />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <Label>Senha</Label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-3.5 text-slate-400"
                />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {/* Erro */}
            {error && (
              <p className="text-sm text-rose-600 text-center">
                {error}
              </p>
            )}

            {/* Botão */}
            <Button type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>

          </form>

          <p className="text-sm text-slate-500 text-center mt-5">
            Ainda não tem conta?{" "}
            <Link
              href="/cadastro"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Criar conta
            </Link>
          </p>
        </div>

        {/* Rodapé */}
        <p className="text-xs text-slate-400 text-center mt-6">
          Criado por Cristian Borges
        </p>

      </div>
    </div>
  );
}