"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Upload } from "lucide-react";
import Button from "@/src/components/ui/Button";

export type ParsedImportRow = {
    rowNumber: number;
    description: string;
    amount: number;
    date: string;
    type: "EXPENSE";
    possibleDuplicate: boolean;
};

export type CsvImportError = {
    rowNumber: number;
    errors: string[];
};

type FileUploadProps = {
    onParsed: (rows: ParsedImportRow[], errors: CsvImportError[]) => void;
};

export default function FileUpload({ onParsed }: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [fileName, setFileName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setError("");
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/import/csv", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? "Nao foi possivel importar o CSV");
                return;
            }

            onParsed(data.rows ?? [], data.errors ?? []);
        } catch {
            setError("Erro ao enviar arquivo");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
            />

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-2xl px-4 py-10 text-center hover:border-indigo-300 hover:bg-indigo-50/40 transition"
            >
                <Upload className="mx-auto text-indigo-600 mb-3" size={28} />
                <span className="block text-sm font-semibold text-slate-800">
                    Selecione um arquivo CSV
                </span>
                <span className="block text-xs text-slate-400 mt-1">
                    Formato esperado: date,title,amount
                </span>
                {fileName && (
                    <span className="block text-xs text-slate-500 mt-3">
                        {fileName}
                    </span>
                )}
            </button>

            {error && (
                <p className="text-sm text-rose-600 mt-3">
                    {error}
                </p>
            )}

            <div className="mt-4">
                <Button
                    type="button"
                    disabled={loading}
                    onClick={() => inputRef.current?.click()}
                >
                    {loading ? "Processando..." : "Enviar CSV"}
                </Button>
            </div>
        </div>
    );
}
