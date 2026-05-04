"use client";

import { useEffect, useState } from "react";
import { FileUp } from "lucide-react";
import FileUpload, {
    CsvImportError,
    ParsedImportRow,
} from "@/src/components/import/FileUpload";
import ImportWizard from "@/src/components/import/ImportWizard";
import { useRequireHousehold } from "@/src/hooks/useRequireHousehold";
import { fetchCards, fetchCategories } from "@/src/services/client/financialApi";

type Category = {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
};

type Card = {
    id: string;
    name: string;
    dueDay: number;
};

export default function ImportPage() {
    const { householdId, loading: householdLoading } = useRequireHousehold();
    const [transactions, setTransactions] = useState<ParsedImportRow[]>([]);
    const [parseErrors, setParseErrors] = useState<CsvImportError[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [hasParsedFile, setHasParsedFile] = useState(false);

    useEffect(() => {
        if (householdLoading || !householdId) return;

        let isMounted = true;
        const activeHouseholdId = householdId;

        async function loadOptions() {
            setLoadingOptions(true);

            try {
                const [categoriesData, cardsData] = await Promise.all([
                    fetchCategories(activeHouseholdId),
                    fetchCards(activeHouseholdId),
                ]);

                if (!isMounted) return;

                setCategories(categoriesData);
                setCards(cardsData);
            } finally {
                if (isMounted) {
                    setLoadingOptions(false);
                }
            }
        }

        void loadOptions();

        return () => {
            isMounted = false;
        };
    }, [householdId, householdLoading]);

    function handleParsed(rows: ParsedImportRow[], errors: CsvImportError[]) {
        setTransactions(rows);
        setParseErrors(errors);
        setHasParsedFile(true);
    }

    function resetImport() {
        setTransactions([]);
        setParseErrors([]);
        setHasParsedFile(false);
    }

    return (
        <>
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">
                        Importar CSV
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Revise compras do cartao antes de salvar
                    </p>
                </div>

                <div className="bg-indigo-100 text-indigo-600 rounded-2xl p-3">
                    <FileUp size={24} />
                </div>
            </div>

            {householdLoading || loadingOptions ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 text-sm text-slate-500">
                    Carregando categorias e cartoes...
                </div>
            ) : !householdId ? null : hasParsedFile ? (
                <ImportWizard
                    householdId={householdId}
                    transactions={transactions}
                    parseErrors={parseErrors}
                    categories={categories}
                    cards={cards}
                    onReset={resetImport}
                />
            ) : (
                <FileUpload householdId={householdId} onParsed={handleParsed} />
            )}
        </>
    );
}
