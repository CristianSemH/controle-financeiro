import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger";
};

export default function Button({
    variant = "primary",
    className = "",
    ...props
}: ButtonProps) {
    const base =
        "w-full py-3 rounded-2xl text-sm font-medium transition active:scale-95 cursor-pointer";

    const variants = {
        primary:
            "bg-indigo-600 text-white hover:bg-indigo-700",
        secondary:
            "bg-slate-200 text-slate-800 hover:bg-slate-300",
        danger:
            "bg-rose-600 text-white hover:bg-rose-700",
    };

    return (
        <button
            {...props}
            className={`${base} ${variants[variant]} ${className}`}
        />
    );
}
