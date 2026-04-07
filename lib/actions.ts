"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Category } from "@/app/generated/prisma/enums"

export type RecipeFormData = {
  name: string
  category: Category
  imageUrl: string
  description: string
  ingredients: { name: string; amount: string }[]
  steps: { description: string; imageUrl: string }[]
}

export async function createRecipe(data: RecipeFormData) {
  const recipe = await prisma.recipe.create({
    data: {
      name: data.name,
      category: data.category,
      imageUrl: data.imageUrl || null,
      description: data.description || null,
      ingredients: {
        create: data.ingredients.map((ing, i) => ({
          name: ing.name,
          amount: ing.amount || null,
          order: i,
        })),
      },
      steps: {
        create: data.steps.map((step, i) => ({
          description: step.description,
          imageUrl: step.imageUrl || null,
          order: i,
        })),
      },
    },
  })
  revalidatePath("/")
  redirect(`/recipes/${recipe.id}`)
}

export async function updateRecipe(id: string, data: RecipeFormData) {
  await prisma.recipe.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category,
      imageUrl: data.imageUrl || null,
      description: data.description || null,
      ingredients: {
        deleteMany: {},
        create: data.ingredients.map((ing, i) => ({
          name: ing.name,
          amount: ing.amount || null,
          order: i,
        })),
      },
      steps: {
        deleteMany: {},
        create: data.steps.map((step, i) => ({
          description: step.description,
          imageUrl: step.imageUrl || null,
          order: i,
        })),
      },
    },
  })
  revalidatePath("/")
  revalidatePath(`/recipes/${id}`)
  redirect(`/recipes/${id}`)
}

export async function deleteRecipe(id: string) {
  await prisma.recipe.delete({ where: { id } })
  revalidatePath("/")
  redirect("/")
}
