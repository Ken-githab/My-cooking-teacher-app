"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_ORDER } from "@/lib/categories"
import type { RecipeListItem } from "@/lib/data"

const ALL = "all"

export default function RecipeBrowser({ recipes }: { recipes: RecipeListItem[] }) {
  const [category, setCategory] = useState<string>(ALL)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return recipes.filter((r) => {
      if (category !== ALL && r.category !== category) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        r.ingredients.some((ing) => ing.name.toLowerCase().includes(q))
      )
    })
  }, [recipes, category, query])

  const tabs = [
    { label: "すべて", value: ALL },
    ...CATEGORY_ORDER.map((c) => ({ label: CATEGORY_LABELS[c], value: c as string })),
  ]

  return (
    <div className="space-y-4">
      {/* 検索 */}
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="料理名・食材で検索"
          className="w-full bg-white border border-gray-300 rounded-xl pl-11 pr-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* カテゴリ（横スクロール・即時絞り込み） */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setCategory(tab.value)}
            className={`px-5 py-2 rounded-full text-base font-bold whitespace-nowrap shrink-0 transition-colors ${
              category === tab.value
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 一覧 */}
      {recipes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl">料理がまだ登録されていません</p>
          <Link href="/recipes/new" className="text-base underline mt-2 inline-block">
            最初の料理を追加する
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">条件に合う料理が見つかりませんでした</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 font-medium">{filtered.length}品</p>
          <div className="grid gap-3">
            {filtered.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all flex items-center"
              >
                {recipe.thumbUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={recipe.thumbUrl}
                    alt={recipe.name}
                    className="w-24 h-24 object-cover shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 bg-orange-50 flex items-center justify-center text-3xl shrink-0">
                    🍽️
                  </div>
                )}
                <div className="flex-1 flex items-center justify-between px-4 py-4 min-w-0">
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-gray-900 truncate">{recipe.name}</p>
                    {recipe.description && (
                      <p className="text-base text-gray-600 font-semibold mt-0.5 line-clamp-1">
                        {recipe.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full ml-4 shrink-0 ${CATEGORY_COLORS[recipe.category]}`}
                  >
                    {CATEGORY_LABELS[recipe.category]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
