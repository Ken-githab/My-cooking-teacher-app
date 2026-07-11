import "dotenv/config"
import { put } from "@vercel/blob"
import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
})

function decodeDataUrl(dataUrl: string): Buffer | null {
  const match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/)
  return match ? Buffer.from(match[1], "base64") : null
}

async function migrateOne(dataUrl: string | null, pathname: string): Promise<string | null> {
  if (!dataUrl) return null
  const buffer = decodeDataUrl(dataUrl)
  if (!buffer) return dataUrl // すでにURLなど
  const blob = await put(pathname, buffer, {
    access: "public",
    contentType: "image/jpeg",
    addRandomSuffix: true,
  })
  return blob.url
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN が見つかりません。Vercelダッシュボードでプロジェクトに")
    console.error("Blobストアをリンクし、`vercel env pull .env` を実行してから再試行してください。")
    process.exit(1)
  }

  const recipes = await prisma.recipe.findMany({
    include: { steps: { orderBy: { order: "asc" } } },
  })

  let migrated = 0
  for (const recipe of recipes) {
    const needsMigration =
      recipe.imageUrl?.startsWith("data:") ||
      recipe.thumbUrl?.startsWith("data:") ||
      recipe.steps.some((s) => s.imageUrl?.startsWith("data:"))
    if (!needsMigration) continue

    const imageUrl = await migrateOne(recipe.imageUrl, `recipes/${recipe.id}/main.jpg`)
    const thumbUrl = await migrateOne(recipe.thumbUrl, `recipes/${recipe.id}/thumb.jpg`)

    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { imageUrl, thumbUrl },
    })

    for (const [i, step] of recipe.steps.entries()) {
      const stepUrl = await migrateOne(step.imageUrl, `recipes/${recipe.id}/step-${i}.jpg`)
      if (stepUrl !== step.imageUrl) {
        await prisma.step.update({ where: { id: step.id }, data: { imageUrl: stepUrl } })
      }
    }

    migrated += 1
    console.log(`移行完了: ${recipe.name}`)
  }

  console.log(`${migrated}件のレシピをBlobに移行しました`)
}

main().then(() => process.exit(0))
