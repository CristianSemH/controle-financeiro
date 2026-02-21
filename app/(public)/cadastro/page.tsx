"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DollarSign, Lock, Mail, User } from "lucide-react";

import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import Button from "@/src/components/ui/Button";

export default function CadastroPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "Não foi possível criar sua conta.");
      return;
    }

    setSuccess("Conta criada com sucesso! Redirecionando para o login...");

    setTimeout(() => {
      router.push("/login");
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md mb-4">
            <DollarSign className="text-white" size={24} />
          </div>

          <h1 className="text-2xl font-semibold text-slate-800">Criar conta</h1>

          <p className="text-sm text-slate-400 mt-1">Comece a organizar suas finanças</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Nome</Label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
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

            <div>
              <Label>Senha</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <Input
                  type="password"
                  placeholder="No mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <Label>Confirmar senha</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <Input
                  type="password"
                  placeholder="Digite novamente sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && <p className="text-sm text-rose-600 text-center">{error}</p>}
            {success && <p className="text-sm text-emerald-600 text-center">{success}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <p className="text-sm text-slate-500 text-center mt-5">
            Já tem conta? {" "}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
