import { Tag } from "lucide-react";

export default function CardListEmpty({ message, icon }: { message: string, icon?: React.ReactNode }) {
    return (
        <div className="
                  bg-white
                  rounded-2xl
                  border border-slate-100
                  shadow-sm
                  p-8
                  text-center
                ">
            {icon}
            <p className="text-sm text-slate-500">
                {message}
            </p>
        </div>
    )
}