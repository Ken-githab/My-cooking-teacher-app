import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import RecipeForm from "@/components/RecipeForm"
import { updateRecipe, type RecipeFormData } from "@/lib/actions"

type Props = { params: Promise<{ id: string }> }

export default async function EditRecipePage({ params }: Props) {
  const { id } = await params

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
    },
  })

  if (!recipe) notFound()

  async function handleUpdate(data: RecipeFormData) {
    "use server"
    await updateRecipe(id, data)
  }

  const initial = {
    name: recipe.name,
    category: recipe.category,
    imageUrl: recipe.imageUrl ?? "",
    description: recipe.description ?? "",
    ingredients: recipe.ingredients.map((i) => ({
      name: i.name,
      amount: i.amount ?? "",
    })),
    steps: recipe.steps.map((s) => ({ description: s.description, imageUrl: s.imageUrl ?? "" })),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href={`/recipes/${id}`} className="text-gray-400 hover:text-gray-600 text-base">
            ← 戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">料理を編集</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <RecipeForm
            initial={initial}
            onSubmit={handleUpdate}
            submitLabel="更新する"
          />
        </div>
      </main>
    </div>
  )
}
