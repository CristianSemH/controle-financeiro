import { prisma } from "@/src/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  let startDate;
  let endDate;

  if (month && year) {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59);
  }

  const dateFilter =
    month && year
      ? {
        date: {
          gte: startDate,
          lte: endDate,
        },
      }
      : {};

  // ===== SALDO TOTAL (SEM FILTRO) =====

  const totalIncomeAll = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { type: "INCOME" },
  });

  const totalExpenseAll = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { type: "EXPENSE" },
  });

  const totalBalance =
    Number(totalIncomeAll._sum.amount || 0) -
    Number(totalExpenseAll._sum.amount || 0);

  // ===== SALDO DO MÊS =====

  const incomeAggregate = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      type: "INCOME",
      ...dateFilter,
    },
  });

  const expenseAggregate = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      type: "EXPENSE",
      ...dateFilter,
    },
  });

  const totalIncome = Number(incomeAggregate._sum.amount || 0);
  const totalExpense = Number(expenseAggregate._sum.amount || 0);
  const balance = totalIncome - totalExpense;

  const expensesByCategory = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      type: "EXPENSE",
      ...dateFilter,
    },
    _sum: { amount: true },
  });

  const categories = await prisma.category.findMany();

  const formattedCategories = expensesByCategory.map((item) => {
    const category = categories.find(
      (c) => c.id === item.categoryId
    );

    return {
      category: category?.name || "Sem categoria",
      total: Number(item._sum.amount || 0),
    };
  });

  // ===== PROGRESSO DAS METAS =====

  const goals = await prisma.goal.findMany({
    include: {
      contributions: true,
    },
  });

  const goalsTotalTarget = goals.reduce(
    (acc, goal) => acc + Number(goal.targetAmount),
    0
  );

  const goalsTotalSaved = goals.reduce((acc, goal) => {
    const saved = goal.contributions.reduce(
      (sum, c) => sum + Number(c.amount),
      0
    );
    return acc + saved;
  }, 0);

  const goalsProgressPercent =
    goalsTotalTarget > 0
      ? (goalsTotalSaved / goalsTotalTarget) * 100
      : 0;


  return Response.json({
    totalBalance,
    totalIncome,
    totalExpense,
    balance,
    expensesByCategory: formattedCategories,
    goalsProgressPercent,
    goalsTotalSaved,
    goalsTotalTarget,
  });

}
