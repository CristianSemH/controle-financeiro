"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";

import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";
import Label from "@/src/components/ui/Label";
import ConfirmModal from "@/src/components/ui/ConfirmModal";
import { useToast } from "@/src/components/ui/ToastProvider";

export default function EditGoalPage() {
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();
  const [goal, setGoal] = useState<any>(null);

  const [showContribution, setShowContribution] = useState(false);
  const [contributionValue, setContributionValue] = useState("");
  const [editingContributionId, setEditingContributionId] =
    useState<string | null>(null);

  const [deleteContributionId, setDeleteContributionId] =
    useState<string | null>(null);

  async function loadGoal() {
    const res = await fetch(`/api/goals`);
    const goals = await res.json();
    const current = goals.find((g: any) => g.id === id);

    setGoal(current);
  }

  useEffect(() => {
    if (id) loadGoal();
  }, [id]);

  async function handleContribution(e: any) {
    e.preventDefault();

    if (editingContributionId) {
      await fetch(`/api/contributions/${editingContributionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(contributionValue),
        }),
      });

      showToast("Reserva atualizada com sucesso 🎉", "success");
      setEditingContributionId(null);
    } else {
      await fetch(`/api/goals/${id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(contributionValue),
        }),
      });

      showToast("Reserva criada com sucesso 🎉", "success");
    }

    setContributionValue("");
    setShowContribution(false);
    loadGoal();
  }

  async function confirmDeleteContribution() {
    if (!deleteContributionId) return;

    await fetch(`/api/contributions/${deleteContributionId}`, {
      method: "DELETE",
    });

    setDeleteContributionId(null);
    loadGoal();
  }

  function calculateProgress() {
    if (!goal || goal.targetAmount <= 0) return 0;

    const progress =
      (goal.totalSaved / Number(goal.targetAmount)) * 100;

    return Math.min(progress, 100);
  }

  const progress = calculateProgress();
  const isCompleted = progress >= 100;

  if (!goal) return null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-24">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          {goal.name}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Até {new Date(goal.targetDate).toLocaleDateString()}
        </p>
      </div>

      {/* Card Principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm text-slate-500">
            Progresso
          </p>
          {isCompleted && (
            <CheckCircle
              size={18}
              className="text-emerald-600"
            />
          )}
        </div>

        <p className="text-lg font-semibold text-slate-800 mb-2">
          R$ {goal.totalSaved.toFixed(2)}{" "}
          <span className="text-slate-400 font-normal text-sm">
            / R$ {Number(goal.targetAmount).toFixed(2)}
          </span>
        </p>

        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${isCompleted
              ? "bg-emerald-500"
              : "bg-indigo-600"
              }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-slate-500 mt-2">
          {progress.toFixed(1)}% concluído
        </p>
      </div>

      {/* Histórico */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-slate-700">
          Histórico de Reservas
        </h2>

        <button
          onClick={() => setShowContribution(true)}
          className="
            flex items-center gap-2
            bg-indigo-600
            text-white
            px-4 py-2
            rounded-2xl
            text-sm
            shadow-sm
            hover:bg-indigo-700
            transition
          "
        >
          <Plus size={14} />
          Adicionar
        </button>
      </div>

      <div className="space-y-3">
        {goal.contributions.length === 0 && (
          <p className="text-xs text-slate-500">
            Nenhuma reserva ainda.
          </p>
        )}

        {goal.contributions.map((c: any) => (
          <div
            key={c.id}
            className="
              bg-white
              rounded-2xl
              border border-slate-100
              shadow-sm
              p-4
              flex justify-between items-center
            "
          >
            <div>
              <p className="text-sm font-medium text-slate-800">
                R$ {Number(c.amount).toFixed(2)}
              </p>
              <p className="text-xs text-slate-400">
                {new Date(c.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Ações Premium */}
            <div className="flex gap-2">

              <button
                onClick={() => {
                  setContributionValue(c.amount);
                  setShowContribution(true);
                  setEditingContributionId(c.id);
                }}
                className="
                  w-8 h-8
                  rounded-full
                  flex items-center justify-center
                  bg-indigo-50
                  text-indigo-600
                  hover:bg-indigo-100
                  transition
                "
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() =>
                  setDeleteContributionId(c.id)
                }
                className="
                  w-8 h-8
                  rounded-full
                  flex items-center justify-center
                  bg-rose-50
                  text-rose-600
                  hover:bg-rose-100
                  transition
                "
              >
                <Trash2 size={16} />
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* Modal Reserva */}
      {showContribution && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
            <form onSubmit={handleContribution} className="space-y-4">

              <div>
                <Label>Valor da Reserva</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={contributionValue}
                  onChange={(e) =>
                    setContributionValue(e.target.value)
                  }
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit">
                  Confirmar
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowContribution(false);
                    setEditingContributionId(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmação Delete */}
      <ConfirmModal
        open={!!deleteContributionId}
        title="Excluir Reserva"
        description="Essa ação não poderá ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDeleteContribution}
        onCancel={() => setDeleteContributionId(null)}
      />
    </div>
  );
}
