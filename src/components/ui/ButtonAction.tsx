import { Pencil, Trash2 } from "lucide-react";

export default function ButtonAction({ variant = "delete", onClick }: { variant: "delete" | "edit", onClick: () => void }) {

    const variantClasses = variant === "delete"
        ? "w-8 h-8 rounded-full flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
        : "w-8 h-8 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition";

    return (
        <button onClick={onClick} className={variantClasses}>
            {variant === "delete" ? <Trash2 size={16} /> : <Pencil size={16} />}
        </button>
    )
};