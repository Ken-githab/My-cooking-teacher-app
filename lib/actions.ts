"use server"

import { updateTag } from "next/cache"
import { redirect } from "next/navigation"
import { del } from "@vercel/blob"
import { prisma } from "@/lib/prisma"
import { Category } from "@/app/generated/prisma/enums"

export type RecipeFormData = {
  name: string
  category: Category
  imageUrl: string
  thumbUrl: string
  description: string
  ingredients: { name: string; amount: string }[]
  steps: { description: string; imageUrl: string }[]
}

function isBlobUrl(url: string | null | undefined): url is string {
  return !!url && url.includes(".public.blob.vercel-storage.com")
}

async function deleteBlobs(urls: (string | null | undefined)[]) {
  const targets = urls.filter(isBlobUrl)
  if (!targets.length) return
  try {
    await del(targets)
  } catch (error) {
    console.error("Blob削除に失敗しました", error)
  }
}

export async function createRecipe(data: RecipeFormData) {
  const recipe = await prisma.recipe.create({
    data: {
      name: data.name,
      category: data.category,
      imageUrl: data.imageUrl || null,
      thumbUrl: data.thumbUrl || null,
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
  updateTag("recipes")
  redirect(`/recipes/${recipe.id}`)
}

export async function updateRecipe(id: string, data: RecipeFormData) {
  const existing = await prisma.recipe.findUnique({
    where: { id },
    select: { imageUrl: true, thumbUrl: true, steps: { select: { imageUrl: true } } },
  })

  await prisma.recipe.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category,
      imageUrl: data.imageUrl || null,
      thumbUrl: data.thumbUrl || null,
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

  if (existing) {
    const keep = new Set(
      [data.imageUrl, data.thumbUrl, ...data.steps.map((s) => s.imageUrl)].filter(Boolean)
    )
    const stale = [existing.imageUrl, existing.thumbUrl, ...existing.steps.map((s) => s.imageUrl)].filter(
      (url) => isBlobUrl(url) && !keep.has(url)
    )
    await deleteBlobs(stale)
  }

  updateTag("recipes")
  updateTag(`recipe-${id}`)
  redirect(`/recipes/${id}`)
}

export async function deleteRecipe(id: string) {
  const existing = await prisma.recipe.findUnique({
    where: { id },
    select: { imageUrl: true, thumbUrl: true, steps: { select: { imageUrl: true } } },
  })

  await prisma.recipe.delete({ where: { id } })

  if (existing) {
    await deleteBlobs([existing.imageUrl, existing.thumbUrl, ...existing.steps.map((s) => s.imageUrl)])
  }

  updateTag("recipes")
  updateTag(`recipe-${id}`)
  redirect("/")
}
