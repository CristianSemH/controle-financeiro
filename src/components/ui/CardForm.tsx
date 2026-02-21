
export default function CardForm(
    {
        children,
        title,
        description,
    }: {
        children: React.ReactNode;
        title?: string;
        description?: string;
    }) {
    return (
        <>
            <div className="mb-6">
                {title ?
                    <h1 className="text-2xl font-semibold text-slate-800">
                        {title}
                    </h1>
                    : null}

                {description ?
                    <p className="text-sm text-slate-400 mt-1">
                        {description}
                    </p>
                    : null}
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                {children}
            </div>
        </>
    )
}