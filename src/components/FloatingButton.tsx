"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function FloatingButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/transactions/new")}
      className="
        fixed
        bottom-18
        right-6
        bg-indigo-600
        hover:bg-indigo-700
        text-white
        w-14
        h-14
        rounded-full
        shadow-lg
        hover:shadow-xl
        flex
        items-center
        justify-center
        active:scale-95
        transition-all
        duration-200
        z-50
        cursor-pointer
      "
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}
