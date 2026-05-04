"use client";

import { useEffect, useState } from "react";
import { FileUp } from "lucide-react";
import FileUpload, {
    CsvImportError,
    ParsedImportRow,
} from "@/src/components/import/FileUpload";
import ImportWizard from "@/src/components/import/ImportWizard";

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
    const [transactions, setTransactions] = useState<ParsedImportRow[]>([]);
    const [parseErrors, setParseErrors] = useState<CsvImportError[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [hasParsedFile, setHasParsedFile] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function loadOptions() {
            try {
                const [categoriesRes, cardsRes] = await Promise.all([
                    fetch("/api/categories"),
                    fetch("/api/cards"),
                ]);

                const [categoriesData, cardsData] = await Promise.all([
                    categoriesRes.json(),
                    cardsRes.json(),
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
    }, []);

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

            {loadingOptions ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 text-sm text-slate-500">
                    Carregando categorias e cartoes...
                </div>
            ) : hasParsedFile ? (
                <ImportWizard
                    transactions={transactions}
                    parseErrors={parseErrors}
                    categories={categories}
                    cards={cards}
                    onReset={resetImport}
                />
            ) : (
                <FileUpload onParsed={handleParsed} />
            )}
        </>
    );
}
