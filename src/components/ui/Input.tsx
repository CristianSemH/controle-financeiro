import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    error?: string;
};

export default function Input({
    error,
    className = "",
    ...props
}: InputProps) {
    return (
        <div className="w-full">
            <input
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
