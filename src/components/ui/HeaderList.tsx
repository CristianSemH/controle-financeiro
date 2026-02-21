import { Plus } from "lucide-react";
import Link from "next/link";

export default function HearderList({ title, description, link }: { title: string; description: string, link: string }) {
    return (
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-800">
                    {title}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    {description}
                </p>
            </div>

            <Link
                href={link}
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
                Cadastrar
            </Link>
        </div>
    )
}