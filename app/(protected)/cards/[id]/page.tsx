"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import Button from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/ToastProvider";
import CardForm from "@/src/components/ui/CardForm";

export default function EditCardPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { showToast } = useToast();

    const [form, setForm] = useState({
        name: "",
        dueDay: "",
        limit: "",
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function loadCard() {
            const res = await fetch(`/api/cards/${id}`);
            const data = await res.json();

            setForm({
                name: data.name,
                dueDay: Number(data.dueDay).toString(),
                limit: Number(data.limit).toString(),
            });
        }

        if (id) loadCard();
    }, [id]);

    async function handleSubmit(e: any) {
        e.preventDefault();
        setSaving(true);

        await fetch(`/api/cards/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                dueDay: Number(form.dueDay),
                limit: Number(form.limit),
            }),
        });

        showToast("Cartao atualizado com sucesso", "success");
        router.push("/cards");
    }

    return (
        <CardForm title="Editar Cartao" description="Atualize os dados deste cartao">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label>Nome do Cartao</Label>
                    <Input
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
                        value={form.limit}
                        onChange={(e) => setForm({ ...form, limit: e.target.value })}
                        required
                    />
                </div>

                <div className="pt-2 space-y-3">
                    <Button type="submit" disabled={saving}>
                        {saving ? "Salvando..." : "Salvar Alteracoes"}
                    </Button>

                    <Button
                        variant="secondary"
                        type="button"
                        onClick={() => router.push("/cards")}
                    >
                        Cancelar
                    </Button>
                </div>
            </form>
        </CardForm>
    );
}
