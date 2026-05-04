"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    CreditCard,
    Wallet,
    Target,
    Tags,
    Upload,
    LogOut
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
            className={`
          flex flex-col items-center justify-center
          flex-1
          py-2
          transition
        `}
        >
            <div
                className={`
            flex flex-col items-center justify-center
            px-3 py-1.5
            rounded-xl
            transition-all
            ${isActive
                        ? "bg-indigo-100 text-indigo-600"
                        : "text-slate-400"
                    }
          `}
            >
                <Icon
                    size={20}
                    className={isActive ? "stroke-2" : "opacity-70"}
                />
                <span className="text-[11px] mt-1 font-medium">
                    {label}
                </span>
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
            className="
        flex flex-col items-center justify-center
        flex-1
        py-2
        transition
        text-slate-400
      "
        >
            <div
                className="
          flex flex-col items-center justify-center
          px-3 py-1.5
          rounded-xl
          transition-all
          hover:bg-red-100 hover:text-red-600
        "
            >
                <Icon size={20} className="opacity-70" />
                <span className="text-[11px] mt-1 font-medium">
                    {label}
                </span>
            </div>
        </button>
    );
}

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav
            className="
        fixed bottom-0 left-0 right-0
        bg-white/80 backdrop-blur-lg
        border-t border-slate-200
        shadow-[0_-2px_20px_rgba(0,0,0,0.05)]
        h-16
        flex
        items-center
        z-40
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
                label="Cartoes"
                pathname={pathname}
            />

            <NavItem
                href="/goals"
                icon={Target}
                label="Metas"
                pathname={pathname}
            />

            <NavItem
                href="/categories"
                icon={Tags}
                label="Categorias"
                pathname={pathname}
            />

            <NavItem
                href="/import"
                icon={Upload}
                label="Importar"
                pathname={pathname}
            />
            <NavButton
                icon={LogOut}
                label="Sair"
                onClick={() =>
                    signOut({
                        callbackUrl: `${window.location.origin}/login`,
                    })
                }
            />
        </nav>
    );
}
