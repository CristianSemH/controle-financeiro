import Spinner from "@/src/components/Spinner";

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] gap-4">
            <Spinner size={48} />
            <p className="text-sm text-gray-500 animate-pulse">
                Carregando dados...
            </p>
        </div>
    )
}