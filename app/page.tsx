import Link from "next/link"
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { Category } from "@/app/generated/prisma/enums"
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/categories"
import CategoryFilter from "@/components/CategoryFilter"

type Props = {
  searchParams: Promise<{ category?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { category } = await searchParams

  const where =
    category && Object.values(Category).includes(category as Category)
      ? { category: category as Category }
      : {}

  const recipes = await prisma.recipe.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">料理管理</h1>
          <Link
            href="/recipes/new"
            className="bg-orange-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            + 追加
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Suspense>
          <CategoryFilter />
        </Suspense>

        {recipes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">料理がまだ登録されていません</p>
            <Link href="/recipes/new" className="text-sm underline mt-2 inline-block">
              最初の料理を追加する
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-gray-300 hover:shadow-sm transition-all flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{recipe.name}</p>
                  {recipe.description && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{recipe.description}</p>
                  )}
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ml-4 shrink-0 ${CATEGORY_COLORS[recipe.category]}`}
                >
                  {CATEGORY_LABELS[recipe.category]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
