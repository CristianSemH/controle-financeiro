"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Target, Plus, CheckCircle } from "lucide-react";
import HearderList from "@/src/components/ui/HeaderList";
import CardListEmpty from "@/src/components/ui/CardListEmpty";
import CardItemList from "@/src/components/ui/CardItemList";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);

  async function loadGoals() {
    const res = await fetch("/api/goals");
    const data = await res.json();
    setGoals(data);
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


  return (
    <>
      <HearderList title="Metas" description="Gerencie suas metas financeiras" link="/goals/new" />

      {goals.length === 0 && (
        <CardListEmpty message="Nenhuma meta cadastrada." icon={<Target className="mx-auto text-slate-300 mb-3" size={28} />} />
      )}

      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          const isCompleted = progress >= 100;

          return (
            <CardItemList key={goal.id}>
              <Link className="block w-full h-full" href={`/goals/${goal.id}`}>
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

                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className={`
                    h-3 rounded-full transition-all
                    ${isCompleted
                        ? "bg-emerald-500"
                        : "bg-indigo-600"
                      }
                  `}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  {progress.toFixed(1)}% concluído
                </p>
              </Link>
            </CardItemList>
          );
        })}
      </div>
    </>
  );
}
