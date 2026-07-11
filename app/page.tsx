
import Link from "next/link"
import { cacheLife, cacheTag } from "next/cache"
import { getRecipeList } from "@/lib/data"
import RecipeBrowser from "@/components/RecipeBrowser"

export default async function HomePage() {
  "use cache"
  cacheTag("recipes")
  cacheLife("max")

  const recipes = await getRecipeList()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-end">
          <Link
            href="/recipes/new"
            className="bg-orange-500 text-white text-base px-5 py-2.5 rounded-lg hover:bg-orange-600 transition-colors"
          >
            + 追加
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <RecipeBrowser recipes={recipes} />
      </main>
    </div>
  )
}
