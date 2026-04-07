"use client"

import { useState, useTransition } from "react"
import { Category } from "@/app/generated/prisma/enums"
import { CATEGORY_LABELS } from "@/lib/categories"
import type { RecipeFormData } from "@/lib/actions"

type Props = {
  initial?: {
    name: string
    category: Category
    description: string
    ingredients: { name: string; amount: string }[]
    steps: { description: string }[]
  }
  onSubmit: (data: RecipeFormData) => Promise<void>
  submitLabel: string
}

export default function RecipeForm({ initial, onSubmit, submitLabel }: Props) {
  const [name, setName] = useState(initial?.name ?? "")
  const [category, setCategory] = useState<Category>(initial?.category ?? Category.MEAT)
  const [description, setDescription] = useState(initial?.description ?? "")
  const [ingredients, setIngredients] = useState<{ name: string; amount: string }[]>(
    initial?.ingredients ?? [{ name: "", amount: "" }]
  )
  const [steps, setSteps] = useState<{ description: string }[]>(
    initial?.steps ?? [{ description: "" }]
  )
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await onSubmit({ name, category, description, ingredients, steps })
    })
  }

  function addIngredient() {
    setIngredients([...ingredients, { name: "", amount: "" }])
  }
  function removeIngredient(i: number) {
    setIngredients(ingredients.filter((_, idx) => idx !== i))
  }
  function updateIngredient(i: number, field: "name" | "amount", value: string) {
    setIngredients(ingredients.map((ing, idx) => (idx === i ? { ...ing, [field]: value } : ing)))
  }

  function addStep() {
    setSteps([...steps, { description: "" }])
  }
  function removeStep(i: number) {
    setSteps(steps.filter((_, idx) => idx !== i))
  }
  function updateStep(i: number, value: string) {
    setSteps(steps.map((s, idx) => (idx === i ? { description: value } : s)))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 料理名 */}
      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">料理名 *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="例: 鶏の唐揚げ"
        />
      </div>

      {/* カテゴリ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ *</label>
        <div className="flex gap-2 flex-wrap">
          {Object.values(Category).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-5 py-2 rounded-full text-base font-medium border transition-colors ${
                category === c
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-600 border-gray-300 hover:border-orange-400 hover:text-orange-500"
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* メモ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          placeholder="備考など"
        />
      </div>

      {/* 食材 */}
      <div>
        <label className="block text-base font-medium text-gray-700 mb-2">食材</label>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={ing.name}
                onChange={(e) => updateIngredient(i, "name", e.target.value)}
                placeholder="食材名"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-base"
              />
              <input
                type="text"
                value={ing.amount}
                onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                placeholder="分量"
                className="w-28 border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-base"
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  className="text-gray-400 hover:text-red-500 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="mt-2 text-sm text-gray-500 hover:text-orange-500 underline"
        >
          + 食材を追加
        </button>
      </div>

      {/* 作り方 */}
      <div>
        <label className="block text-base font-medium text-gray-700 mb-2">作り方</label>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-3 text-base font-medium text-gray-500 w-5 shrink-0">
                {i + 1}.
              </span>
              <textarea
                value={step.description}
                onChange={(e) => updateStep(i, e.target.value)}
                placeholder={`手順 ${i + 1}`}
                rows={2}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-base resize-none"
              />
              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStep(i)}
                  className="mt-2 text-gray-400 hover:text-red-500 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          className="mt-2 text-sm text-gray-500 hover:text-orange-500 underline"
        >
          + 手順を追加
        </button>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-orange-500 text-white py-4 text-lg rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
      >
        {pending ? "保存中..." : submitLabel}
      </button>
    </form>
  )
}
