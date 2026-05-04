"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import Button from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/ToastProvider";
import CardForm from "@/src/components/ui/CardForm";

export default function NewCardPage() {
    const router = useRouter();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        dueDay: "",
        limit: "",
    });

    async function handleSubmit(e: any) {
        e.preventDefault();
        setLoading(true);

        await fetch("/api/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                dueDay: Number(form.dueDay),
                limit: Number(form.limit),
            }),
        });

        showToast("Cartão criado com sucesso", "success");
        router.push("/cards");
    }

    return (
        <CardForm title="Novo Cartão" description="Cadastre um cartão para facilitar suas transacoes">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label>Nome do Cartão</Label>
                    <Input
                        placeholder="Ex: Nubank, Itau, Inter..."
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <Label>Dia de Vencimento</Label>
                    <Input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="Ex: 10"
                        value={form.dueDay}
                        onChange={(e) => setForm({ ...form, dueDay: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <Label>Limite</Label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0,00"
                        value={form.limit}
                        onChange={(e) => setForm({ ...form, limit: e.target.value })}
                        required
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar Cartão"}
                </Button>

                <Button
                    variant="secondary"
                    type="button"
                    onClick={() => router.push("/cards")}
                >
                    Cancelar
                </Button>
            </form>
        </CardForm>
    );
}
