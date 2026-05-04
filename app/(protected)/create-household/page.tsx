"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import { useHousehold } from "@/src/contexts/HouseholdContext";
import { createHousehold } from "@/src/services/client/householdApi";
import { useToast } from "@/src/components/ui/ToastProvider";

export default function HouseholdCreatePage() {
    const router = useRouter();
    const { showToast } = useToast();
    const { households, setHouseholds, setHouseholdId } = useHousehold();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!name.trim()) {
            setError("Informe o nome da familia");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const household = await createHousehold(name.trim());
            setHouseholds([...households, household]);
            setHouseholdId(household.id);
            showToast("Familia criada com sucesso", "success");
            router.push("/dashboard");
        } catch (currentError) {
            setError(
                currentError instanceof Error
                    ? currentError.message
                    : "Nao foi possivel criar a familia"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-3">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-800">
                    Criar familia
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    Crie um espaco compartilhado para organizar as financas.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <Label>Nome da familia</Label>
                        <Input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Ex: Familia Borges"
                            error={error}
                            required
                        />
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading ? "Criando..." : "Criar familia"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
