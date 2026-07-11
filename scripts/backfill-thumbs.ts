import "dotenv/config"
import sharp from "sharp"
import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
})

async function toThumb(dataUrl: string): Promise<string | null> {
  const match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/)
  if (!match) return null
  const input = Buffer.from(match[1], "base64")
  const output = await sharp(input)
    .resize(240, 240, { fit: "cover" })
    .jpeg({ quality: 65 })
    .toBuffer()
  return `data:image/jpeg;base64,${output.toString("base64")}`
}

async function main() {
  const recipes = await prisma.recipe.findMany({
    where: { imageUrl: { not: null }, thumbUrl: null },
    select: { id: true, name: true, imageUrl: true },
  })
  console.log(`対象: ${recipes.length}件`)
  for (const r of recipes) {
    const thumb = await toThumb(r.imageUrl!)
    if (!thumb) {
      console.log(`skip (not base64): ${r.name}`)
      continue
    }
    await prisma.recipe.update({ where: { id: r.id }, data: { thumbUrl: thumb } })
    console.log(`done: ${r.name} (${Math.round(r.imageUrl!.length / 1024)}KB → ${Math.round(thumb.length / 1024)}KB)`)
  }
}

main().then(() => process.exit(0))
