import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default function InfoItemListEntryExit({ type, tittle, description }: { type: "entry" | "exit", tittle: string, description?: string }) {
    const isEntry = type === "entry";

    return (
        <div className="flex items-center gap-3">
            <div
                className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    ${isEntry ? "bg-emerald-50" : "bg-rose-50"}
                  `}
            >
                {!isEntry ? (
                    <ArrowDownCircle
                        size={18}
                        className="text-rose-600"
                    />
                ) : (
                    <ArrowUpCircle
                        size={18}
                        className="text-emerald-600"
                    />
                )}
            </div>

            <div>
                <p className="font-medium text-sm text-slate-800">
                    {tittle}
                </p>
                <p className="text-xs text-slate-400">
                    {description}
                </p>
            </div>
        </div>
    )
};