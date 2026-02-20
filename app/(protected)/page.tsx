// app/dashboard/page.tsx

import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function Home() {

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Saudação */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Bem-vindo de volta 👋
          </h1>
        </div>


        {/* Ações rápidas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Ações rápidas
          </h2>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/transactions/new"
              className="flex items-center gap-2 bg-[#6366F1] hover:opacity-90 text-white px-5 py-3 rounded-xl transition"
            >
              <PlusCircle size={18} />
              Nova Transação
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}