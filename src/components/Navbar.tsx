"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    CreditCard,
    Target,
    Tags,
    LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function Navbar() {
    const pathname = usePathname();

    function NavItem({
        href,
        icon: Icon,
        label,
    }: {
        href: string;
        icon: any;
        label: string;
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
        icon: any;
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
            />

            <NavItem
                href="/transactions"
                icon={CreditCard}
                label="Mov."
            />

            <NavItem
                href="/goals"
                icon={Target}
                label="Metas"
            />

            <NavItem
                href="/categories"
                icon={Tags}
                label="Categorias"
            />
            <NavButton
                icon={LogOut}
                label="Sair"
                onClick={() => signOut({ callbackUrl: "/login" })}
            />
        </nav>
    );
}
