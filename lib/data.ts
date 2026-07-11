import { cacheLife, cacheTag } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function getRecipeList() {
  "use cache"
  cacheTag("recipes")
  cacheLife("max")

  return prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      category: true,
      thumbUrl: true,
      description: true,
      ingredients: { select: { name: true }, orderBy: { order: "asc" } },
    },
  })
}

export type RecipeListItem = Awaited<ReturnType<typeof getRecipeList>>[number]

export async function getRecipe(id: string) {
  "use cache"
  cacheTag("recipes", `recipe-${id}`)
  cacheLife("max")

  return prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
    },
  })
}
