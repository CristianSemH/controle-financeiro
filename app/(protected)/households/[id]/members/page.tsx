"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Label from "@/src/components/ui/Label";
import Select from "@/src/components/ui/Select";
import {
    addHouseholdMember,
    fetchHouseholdMembers,
    HouseholdMember,
} from "@/src/services/client/householdApi";
import { useHousehold } from "@/src/contexts/HouseholdContext";
import { useToast } from "@/src/components/ui/ToastProvider";

export default function HouseholdMembersPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { showToast } = useToast();
    const { households, householdId, setHouseholdId, loading: householdLoading } = useHousehold();
    const [members, setMembers] = useState<HouseholdMember[]>([]);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const household = households.find((item) => item.id === params.id);

    const loadMembers = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await fetchHouseholdMembers(params.id);
            setMembers(data);
        } catch (currentError) {
            setError(
                currentError instanceof Error
                    ? currentError.message
                    : "Nao foi possivel carregar membros"
            );
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        if (householdLoading) return;

        if (!households.some((item) => item.id === params.id)) {
            router.replace("/households");
            return;
        }

        if (householdId !== params.id) {
            setHouseholdId(params.id);
        }

        void loadMembers();
    }, [householdLoading, households, householdId, loadMembers, params.id, router, setHouseholdId]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!email.trim()) {
            setError("Informe o email do membro");
            return;
        }

        setSaving(true);
        setError("");

        try {
            await addHouseholdMember({
                householdId: params.id,
                email: email.trim(),
                role,
            });
            setEmail("");
            setRole("MEMBER");
            showToast("Membro adicionado com sucesso", "success");
            await loadMembers();
        } catch (currentError) {
            setError(
                currentError instanceof Error
                    ? currentError.message
                    : "Nao foi possivel adicionar membro"
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-3">
            <div>
                <h1 className="text-2xl font-semibold text-slate-800">
                    Membros da familia
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    {household?.name ?? "Familia selecionada"}
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-base font-semibold text-slate-800 mb-4">
                    Adicionar membro
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[1fr_180px_160px] gap-3">
                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="pessoa@email.com"
                            required
                        />
                    </div>

                    <div>
                        <Label>Papel</Label>
                        <Select
                            value={role}
                            onChange={(event) => setRole(event.target.value as "MEMBER" | "ADMIN")}
                        >
                            <option value="MEMBER">MEMBER</option>
                            <option value="ADMIN">ADMIN</option>
                        </Select>
                    </div>

                    <div className="md:self-end">
                        <Button type="submit" disabled={saving}>
                            {saving ? "Adicionando..." : "Adicionar"}
                        </Button>
                    </div>
                </form>

                {error && (
                    <p className="text-sm text-rose-600 mt-3">
                        {error}
                    </p>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-semibold text-slate-800">
                        Membros
                    </h2>
                </div>

                {loading ? (
                    <div className="p-6 text-sm text-slate-500">
                        Carregando membros...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="text-left font-medium px-6 py-3">Nome</th>
                                    <th className="text-left font-medium px-6 py-3">Email</th>
                                    <th className="text-left font-medium px-6 py-3">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => (
                                    <tr key={member.id} className="border-t border-slate-100">
                                        <td className="px-6 py-3 text-slate-800">
                                            {member.user.name || "Sem nome"}
                                        </td>
                                        <td className="px-6 py-3 text-slate-600">
                                            {member.user.email}
                                        </td>
                                        <td className="px-6 py-3 text-slate-600">
                                            {member.role}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
