import Link from "next/link"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getRecipe } from "@/lib/data"
import RecipeForm from "@/components/RecipeForm"
import { updateRecipe, type RecipeFormData } from "@/lib/actions"

type Props = { params: Promise<{ id: string }> }

export default function EditRecipePage({ params }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<EditSkeleton />}>
        {params.then(({ id }) => (
          <EditRecipe id={id} />
        ))}
      </Suspense>
    </div>
  )
}

async function EditRecipe({ id }: { id: string }) {
  const recipe = await getRecipe(id)
  if (!recipe) notFound()

  async function handleUpdate(data: RecipeFormData) {
    "use server"
    await updateRecipe(id, data)
  }

  const initial = {
    name: recipe.name,
    category: recipe.category,
    imageUrl: recipe.imageUrl ?? "",
    thumbUrl: recipe.thumbUrl ?? "",
    description: recipe.description ?? "",
    ingredients: recipe.ingredients.map((i) => ({
      name: i.name,
      amount: i.amount ?? "",
    })),
    steps: recipe.steps.map((s) => ({ description: s.description, imageUrl: s.imageUrl ?? "" })),
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href={`/recipes/${id}`}
            className="text-gray-700 hover:text-orange-500 text-base font-bold"
          >
            ← 戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">料理を編集</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <RecipeForm initial={initial} onSubmit={handleUpdate} submitLabel="更新する" />
        </div>
      </main>
    </>
  )
}

function EditSkeleton() {
  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="h-52 w-full bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-12 w-full bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-12 w-full bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-24 w-full bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </main>
    </>
  )
}
