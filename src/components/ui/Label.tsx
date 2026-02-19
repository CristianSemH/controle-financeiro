type LabelProps = {
    children: React.ReactNode;
};

export default function Label({ children }: LabelProps) {
    return (
        <label className="text-xs font-medium text-slate-500 mb-1 block">
            {children}
        </label>
    );
}
