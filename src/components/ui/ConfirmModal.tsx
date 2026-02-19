"use client";

import Button from "./Button";

type ConfirmModalProps = {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmModal({
    open,
    title = "Confirmar ação",
    description = "Tem certeza que deseja continuar?",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div
                className="
          relative
          bg-white
          w-full
          max-w-sm
          rounded-2xl
          shadow-xl
          p-6
          animate-in fade-in zoom-in-95
        "
            >
                <h2 className="text-lg font-semibold text-slate-800 mb-2">
                    {title}
                </h2>

                <p className="text-sm text-slate-500 mb-6">
                    {description}
                </p>

                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </Button>

                    <Button
                        variant="danger"
                        type="button"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
