import Link from "next/link"
import RecipeForm from "@/components/RecipeForm"
import { createRecipe } from "@/lib/actions"

export default function NewRecipePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
            ← 戻る
          </Link>
          <h1 className="text-xl font-bold text-gray-900">料理を追加</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <RecipeForm onSubmit={createRecipe} submitLabel="保存する" />
        </div>
      </main>
    </div>
  )
}
