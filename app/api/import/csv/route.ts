import { parse } from "csv-parse/sync";
import { getCurrentUser } from "@/src/lib/getCurrentUser";
import { prisma } from "@/src/lib/prisma";
import {
    resolveHouseholdId,
    serviceErrorResponse,
} from "@/src/services/householdService";

type CsvRecord = {
    date?: string;
    title?: string;
    amount?: string;
};

function isValidDateOnly(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
}

function buildDayRange(dateOnly: string) {
    const [year, month, day] = dateOnly.split("-").map(Number);

    return {
        start: new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)),
        end: new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)),
    };
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        const formData = await req.formData();
        const file = formData.get("file");
        const householdIdValue = formData.get("householdId");
        const householdId = await resolveHouseholdId(
            user.id,
            typeof householdIdValue === "string" ? householdIdValue : undefined
        );

        if (!(file instanceof File)) {
            return Response.json(
                { error: "Arquivo CSV nao enviado" },
                { status: 400 }
            );
        }

        const content = await file.text();
        let records: CsvRecord[];

        try {
            records = parse(content, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                bom: true,
            });
        } catch {
            return Response.json(
                { error: "Nao foi possivel ler o CSV" },
                { status: 400 }
            );
        }

        const rows = [];
        const errors = [];

        for (const [index, record] of records.entries()) {
            const rowNumber = index + 2;
            const description = record.title?.trim() ?? "";
            const date = record.date?.trim() ?? "";
            const amount = Number(String(record.amount ?? "").replace(",", "."));

            const rowErrors = [];

            if (!description) rowErrors.push("Descricao vazia");
            if (!isValidDateOnly(date)) rowErrors.push("Data invalida");
            if (!Number.isFinite(amount) || amount <= 0) {
                rowErrors.push("Valor invalido");
            }

            if (rowErrors.length > 0) {
                errors.push({
                    rowNumber,
                    errors: rowErrors,
                });
                continue;
            }

            const { start, end } = buildDayRange(date);
            const duplicate = await prisma.transaction.findFirst({
                where: {
                    householdId,
                    description,
                    amount,
                    OR: [
                        {
                            date: {
                                gte: start,
                                lte: end,
                            },
                        },
                        {
                            purchaseDate: {
                                gte: start,
                                lte: end,
                            },
                        },
                    ],
                },
                select: {
                    id: true,
                },
            });

            rows.push({
                rowNumber,
                description,
                amount,
                date,
                type: "EXPENSE",
                possibleDuplicate: Boolean(duplicate),
            });
        }

        return Response.json({
            householdId,
            rows,
            errors,
            totalRows: records.length,
            duplicateCount: rows.filter((row) => row.possibleDuplicate).length,
        });
    } catch (error) {
        return serviceErrorResponse(error);
    }
}
