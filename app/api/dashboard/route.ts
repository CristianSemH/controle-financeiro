import { getCurrentUser } from "@/src/lib/getCurrentUser";
import { prisma } from "@/src/lib/prisma";
import {
  resolveHouseholdId,
  serviceErrorResponse,
} from "@/src/services/householdService";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const householdId = await resolveHouseholdId(
      user.id,
      searchParams.get("householdId")
    );

    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));
    const today = new Date();

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

    const totalIncomeAll = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "INCOME", householdId, date: { lte: today } },
    });

    const totalExpenseAll = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "EXPENSE", householdId, date: { lte: today } },
    });

    const totalBalance =
      Number(totalIncomeAll._sum.amount || 0) -
      Number(totalExpenseAll._sum.amount || 0);

    const incomeAggregate = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        type: "INCOME",
        householdId,
        ...dateFilter,
      },
    });

    const expenseAggregate = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        type: "EXPENSE",
        householdId,
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
        householdId,
        ...dateFilter,
      },
      _sum: { amount: true },
    });

    const categories = await prisma.category.findMany({ where: { householdId } });

    const formattedCategories = expensesByCategory.map((item) => {
      const category = categories.find(
        (currentCategory) => currentCategory.id === item.categoryId
      );

      return {
        category: category?.name || "Sem categoria",
        total: Number(item._sum.amount || 0),
      };
    });

    const goals = await prisma.goal.findMany({
      where: { householdId },
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
        (sum, contribution) => sum + Number(contribution.amount),
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
  } catch (error) {
    return serviceErrorResponse(error);
  }
}
