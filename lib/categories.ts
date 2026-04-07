import { Category } from "@/app/generated/prisma/enums"

export const CATEGORY_LABELS: Record<Category, string> = {
  MEAT: "肉料理",
  FISH: "魚料理",
  NABE: "鍋料理",
  PASTA: "パスタ",
}

export const CATEGORY_COLORS: Record<Category, string> = {
  MEAT: "bg-red-100 text-red-700",
  FISH: "bg-blue-100 text-blue-700",
  NABE: "bg-orange-100 text-orange-700",
  PASTA: "bg-yellow-100 text-yellow-700",
}
