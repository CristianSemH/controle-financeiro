"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Input from "@/src/components/ui/Input";
import Select from "@/src/components/ui/Select";
import Label from "@/src/components/ui/Label";
import Button from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/ToastProvider";

type Card = {
  id: string;
  name: string;
  dueDay: number;
};

function calculateCreditDueDate(purchaseDate: string, dueDay: number) {
  const [year, month] = purchaseDate.split("-").map(Number);
  const dueMonth = month === 12 ? 1 : month + 1;
  const dueYear = month === 12 ? year + 1 : year;
  const maxDay = new Date(dueYear, dueMonth, 0).getDate();
  const clampedDueDay = Math.min(dueDay, maxDay);

  return `${dueYear}-${String(dueMonth).padStart(2, "0")}-${String(clampedDueDay).padStart(2, "0")}`;
}

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    type: "EXPENSE",
    categoryId: "",
    date: "",
    purchaseDate: "",
    paymentMethod: "",
    cardId: "",
  });

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === form.cardId),
    [cards, form.cardId]
  );

  const isCreditExpense = form.type === "EXPENSE" && form.paymentMethod === "CREDIT";

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));

    fetch("/api/cards")
      .then((res) => res.json())
      .then((data) => setCards(data));
  }, []);

  useEffect(() => {
    async function loadTransaction() {
      const res = await fetch(`/api/transactions/${id}`);
      const data = await res.json();

      setForm({
        description: data.description,
        amount: String(data.amount),
        type: data.type,
        categoryId: data.categoryId,
        date: data.date.split("T")[0],
        purchaseDate: data.purchaseDate ? data.purchaseDate.split("T")[0] : "",
        paymentMethod: data.paymentMethod ?? "",
        cardId: data.cardId ?? "",
      });
    }

    if (id) loadTransaction();
  }, [id]);

  useEffect(() => {
    if (!isCreditExpense || !form.purchaseDate || !selectedCard) return;

    const calculatedDate = calculateCreditDueDate(form.purchaseDate, selectedCard.dueDay);

    setForm((prev) => {
      if (prev.date === calculatedDate) return prev;
      return { ...prev, date: calculatedDate };
    });
  }, [isCreditExpense, form.purchaseDate, selectedCard]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setSaving(true);

    const purchaseDate = form.type === "EXPENSE" ? isCreditExpense ? form.purchaseDate : form.date : undefined

    await fetch(`/api/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
        purchaseDate: purchaseDate,
        paymentMethod: form.type === "EXPENSE" ? form.paymentMethod : undefined,
        cardId: isCreditExpense ? form.cardId : undefined,
      }),
    });

    showToast("Transação atualizada com sucesso", "success");
    router.push("/transactions");
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-6 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Editar Transação
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Atualize ou remova esta movimentação
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex bg-slate-100 rounded-2xl p-1">
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  type: "EXPENSE",
                  categoryId: "",
                })
              }
              className={`flex-1 py-2 rounded-2xl text-sm font-medium transition ${form.type === "EXPENSE"
                ? "bg-white shadow text-rose-600"
                : "text-slate-500"
                }`}
            >
              Despesa
            </button>

            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  type: "INCOME",
                  categoryId: "",
                  paymentMethod: "",
                  cardId: "",
                  purchaseDate: "",
                })
              }
              className={`flex-1 py-2 rounded-2xl text-sm font-medium transition ${form.type === "INCOME"
                ? "bg-white shadow text-emerald-600"
                : "text-slate-500"
                }`}
            >
              Entrada
            </button>
          </div>

          <div>
            <Label>Valor</Label>
            <Input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>Descricao</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              required
            />
          </div>

          <div>
            <Label>Categoria</Label>
            <Select
              value={form.categoryId}
              onChange={(e) =>
                setForm({
                  ...form,
                  categoryId: e.target.value,
                })
              }
              required
            >
              <option value="">Selecione categoria</option>

              {categories
                .filter((c: any) => c.type === form.type)
                .map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </Select>
          </div>

          {form.type === "EXPENSE" && (
            <>
              <div>
                <Label>Forma de Pagamento</Label>
                <Select
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paymentMethod: e.target.value,
                      cardId: "",
                    })
                  }
                  required
                >
                  <option value="">Selecione a forma de pagamento</option>
                  <option value="CREDIT">Credito</option>
                  <option value="DEBIT">Debito</option>
                  <option value="PIX">Pix</option>
                  <option value="CASH">Dinheiro</option>
                </Select>
              </div>

              {isCreditExpense && (
                <>
                  <div>
                    <Label>Cartao</Label>
                    <Select
                      value={form.cardId}
                      onChange={(e) =>
                        setForm({ ...form, cardId: e.target.value })
                      }
                      required
                    >
                      <option value="">Selecione o cartao</option>
                      {cards.map((card) => (
                        <option key={card.id} value={card.id}>
                          {card.name} - vence dia {card.dueDay}
                        </option>
                      ))}
                    </Select>
                  </div>


                  <div>
                    <Label>Quando eu comprei</Label>
                    <Input
                      type="date"
                      value={form.purchaseDate}
                      onChange={(e) =>
                        setForm({ ...form, purchaseDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div>
            {form.type === "EXPENSE" ?
              <Label>Quando eu vou pagar</Label>
              : <Label>Data da entrada</Label>}
            <Input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
              required
            />
          </div>

          <div className="pt-2 space-y-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>

            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/transactions")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
