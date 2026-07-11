
import Link from "next/link"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getRecipe, getRecipeList } from "@/lib/data"
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/categories"
import DeleteButton from "./DeleteButton"

type Props = { params: Promise<{ id: string }> }

export async function generateStaticParams() {
  const recipes = await getRecipeList()
  return recipes.map((r) => ({ id: r.id }))
}

export default function RecipeDetailPage({ params }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<DetailSkeleton />}>
        {params.then(({ id }) => (
          <RecipeDetail id={id} />
        ))}
      </Suspense>
    </div>
  )
}

async function RecipeDetail({ id }: { id: string }) {
  const recipe = await getRecipe(id)
  if (!recipe) notFound()

  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-700 hover:text-orange-500 text-base font-bold">
              ← 戻る
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/recipes/${id}/edit`}
              className="text-base px-4 py-2 border border-orange-400 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
            >
              編集
            </Link>
            <DeleteButton id={id} />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {recipe.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-56 object-cover" />
          )}
          <div className="p-6">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{recipe.name}</h1>
              <span
                className={`text-sm font-medium px-3 py-1.5 rounded-full shrink-0 mt-1 ${CATEGORY_COLORS[recipe.category]}`}
              >
                {CATEGORY_LABELS[recipe.category]}
              </span>
            </div>
            {recipe.description && (
              <p className="mt-2 text-gray-600 text-base font-medium">{recipe.description}</p>
            )}
          </div>
        </div>

        {recipe.ingredients.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">食材</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing) => (
                <li key={ing.id} className="flex justify-between text-lg">
                  <span className="text-gray-900 font-bold">{ing.name}</span>
                  {ing.amount && <span className="text-gray-700 font-bold">{ing.amount}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recipe.steps.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">作り方</h2>
            <ol className="space-y-5">
              {recipe.steps.map((step, i) => (
                <li key={step.id} className="space-y-2">
                  <div className="flex gap-3 text-lg">
                    <span className="font-bold text-orange-500 shrink-0 w-6">{i + 1}.</span>
                    <p className="text-gray-900 font-bold leading-relaxed">{step.description}</p>
                  </div>
                  {step.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={step.imageUrl}
                      alt={`手順${i + 1}の写真`}
                      className="w-full rounded-lg object-cover max-h-60 ml-9"
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </main>
    </>
  )
}

function DetailSkeleton() {
  return (
    <>
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-16 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-10 w-16 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="w-full h-56 bg-gray-200 animate-pulse" />
          <div className="p-6 space-y-3">
            <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-gray-100 rounded animate-pulse" />
        </div>
      </main>
    </>
  )
}
