"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Target, Plus, CheckCircle } from "lucide-react";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadGoals() {
    const res = await fetch("/api/goals");
    const data = await res.json();
    setGoals(data);
    setLoading(false);
  }

  useEffect(() => {
    loadGoals();
  }, []);

  function calculateProgress(goal: any) {
    if (goal.targetAmount <= 0) return 0;

    const progress =
      (goal.totalSaved / Number(goal.targetAmount)) * 100;

    return Math.min(progress, 100);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">
          Carregando metas...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-24">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Metas
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Planejamento financeiro
          </p>
        </div>

        <Link
          href="/goals/new"
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
          <Plus size={16} />
          Nova
        </Link>
      </div>

      {/* Estado vazio */}
      {goals.length === 0 && (
        <div className="
          bg-white
          rounded-2xl
          border border-slate-100
          shadow-sm
          p-8
          text-center
        ">
          <Target className="mx-auto text-slate-300 mb-3" size={28} />
          <p className="text-sm text-slate-500">
            Nenhuma meta cadastrada.
          </p>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          const isCompleted = progress >= 100;

          return (
            <Link
              key={goal.id}
              href={`/goals/${goal.id}`}
              className="
                block
                bg-white
                rounded-2xl
                border border-slate-100
                shadow-sm
                p-5
                hover:shadow-md
                transition
              "
            >
              {/* Topo */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-sm text-slate-800">
                    {goal.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Até{" "}
                    {new Date(goal.targetDate).toLocaleDateString()}
                  </p>
                </div>

                {isCompleted && (
                  <CheckCircle
                    size={18}
                    className="text-emerald-600"
                  />
                )}
              </div>

              {/* Valores */}
              <div className="text-sm mb-3">
                <p className="text-slate-500">
                  Guardado
                </p>
                <p className="font-medium text-slate-800">
                  R$ {goal.totalSaved.toFixed(2)}{" "}
                  <span className="text-slate-400 font-normal">
                    / R$ {Number(goal.targetAmount).toFixed(2)}
                  </span>
                </p>
              </div>

              {/* Barra de Progresso */}
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className={`
                    h-3 rounded-full transition-all
                    ${
                      isCompleted
                        ? "bg-emerald-500"
                        : "bg-indigo-600"
                    }
                  `}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Percentual */}
              <p className="text-xs text-slate-500 mt-2">
                {progress.toFixed(1)}% concluído
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
