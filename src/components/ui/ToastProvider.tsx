"use client";

import { createContext, useContext, useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

type ToastType = "success" | "error";

type ToastContextType = {
    showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

export default function ToastProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [toast, setToast] = useState<{
        message: string;
        type: ToastType;
    } | null>(null);

    function showToast(message: string, type: ToastType = "success") {
        setToast({ message, type });

        setTimeout(() => {
            setToast(null);
        }, 3000);
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {toast && (
                <div className="
          fixed top-6 left-1/2 -translate-x-1/2
          bg-white
          border border-slate-200
          shadow-lg
          rounded-2xl
          px-4 py-3
          flex items-center gap-3
          animate-in fade-in slide-in-from-top-2
          z-50
        ">
                    {toast.type === "success" ? (
                        <CheckCircle className="text-emerald-600" size={18} />
                    ) : (
                        <AlertCircle className="text-rose-600" size={18} />
                    )}

                    <p className="text-sm text-slate-700">
                        {toast.message}
                    </p>
                </div>
            )}
        </ToastContext.Provider>
    );
}
