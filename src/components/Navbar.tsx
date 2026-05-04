"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    CreditCard,
    Wallet,
    Target,
    Tags,
    Upload,
    Users,
    LogOut,
    MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { signOut } from "next-auth/react";

function NavItem({
    href,
    icon: Icon,
    label,
    pathname,
}: {
    href: string;
    icon: LucideIcon;
    label: string;
    pathname: string;
}) {
    const isActive = pathname.startsWith(href);

    return (
        <Link
            href={href}
            className="flex flex-col items-center justify-center flex-1 py-2"
        >
            <div
                className={`
          flex flex-col items-center justify-center
          px-3 py-1.5 rounded-xl transition-all
          ${isActive
                        ? "bg-indigo-100 text-indigo-600"
                        : "text-slate-400"
                    }
        `}
            >
                <Icon size={20} className={isActive ? "stroke-2" : "opacity-70"} />
                <span className="text-[11px] mt-1 font-medium">{label}</span>
            </div>
        </Link>
    );
}

function NavButton({
    icon: Icon,
    label,
    onClick,
}: {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center flex-1 py-2 text-slate-400"
        >
            <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all hover:bg-slate-100">
                <Icon size={20} className="opacity-70" />
                <span className="text-[11px] mt-1 font-medium">{label}</span>
            </div>
        </button>
    );
}

function MoreMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="
          fixed bottom-20 left-4 right-4
          bg-white rounded-2xl shadow-xl
          p-4 z-50
          animate-in slide-in-from-bottom duration-200
        "
            >
                <div className="grid grid-cols-4 gap-4 text-center">
                    <MenuItem href="/goals" icon={Target} label="Metas" />
                    <MenuItem href="/import" icon={Upload} label="Importar" />
                    <MenuItem href="/households" icon={Users} label="Famílias" />
                    <button
                        onClick={() =>
                            signOut({
                                callbackUrl: `${window.location.origin}/login`,
                            })
                        }
                        className="flex flex-col items-center text-red-500"
                    >
                        <LogOut size={22} />
                        <span className="text-[11px] mt-1">Sair</span>
                    </button>
                </div>
            </div>
        </>
    );
}

function MenuItem({
    href,
    icon: Icon,
    label,
}: {
    href: string;
    icon: LucideIcon;
    label: string;
}) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center text-slate-600"
        >
            <div className="p-3 rounded-xl bg-slate-100">
                <Icon size={22} />
            </div>
            <span className="text-[11px] mt-1">{label}</span>
        </Link>
    );
}

export default function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <>
            <nav
                className="
          fixed bottom-0 left-0 right-0
          bg-white/80 backdrop-blur-lg
          border-t border-slate-200
          shadow-[0_-2px_20px_rgba(0,0,0,0.05)]
          h-16 flex items-center z-40
        "
            >
                <NavItem
                    href="/dashboard"
                    icon={Home}
                    label="Home"
                    pathname={pathname}
                />

                <NavItem
                    href="/transactions"
                    icon={CreditCard}
                    label="Mov."
                    pathname={pathname}
                />

                <NavItem
                    href="/cards"
                    icon={Wallet}
                    label="Cartões"
                    pathname={pathname}
                />
                <NavItem
                    href="/categories"
                    icon={Tags}
                    label="Categorias"
                    pathname={pathname}
                />

                <NavButton
                    icon={MoreHorizontal}
                    label="Mais"
                    onClick={() => setOpen(true)}
                />
            </nav>

            <MoreMenu open={open} onClose={() => setOpen(false)} />
        </>
    );
}