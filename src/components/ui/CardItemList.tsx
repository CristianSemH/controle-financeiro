
export default function CardItemList({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex justify-between items-center hover:shadow-md transition">
            {children}
        </div>
    )
}