import { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    error?: string;
};

export default function Select({
    error,
    className = "",
    ...props
}: SelectProps) {
    return (
        <div className="w-full">
            <select
                {...props}
                className={`
          w-full
          px-4 py-3
          rounded-2xl
          border
          border-slate-200
          bg-white
          text-sm
          focus:outline-none
          focus:ring-2
          focus:ring-indigo-500
          focus:border-indigo-500
          transition
          ${error ? "border-rose-500" : ""}
          ${className}
          text-gray-900
        `}
            />
            {error && (
                <p className="text-xs text-rose-500 mt-1">
                    {error}
                </p>
            )}
        </div>
    );
}
