import { Category } from "@/app/generated/prisma/enums"

export const CATEGORY_ORDER: Category[] = [
  Category.MEAT,
  Category.FISH,
  Category.NABE,
  Category.RICE,
  Category.PASTA,
  Category.SINGLE,
  Category.DESSERT,
]

export const CATEGORY_LABELS: Record<Category, string> = {
  MEAT: "肉料理",
  FISH: "魚料理",
  NABE: "鍋料理",
  PASTA: "パスタ",
  RICE: "ご飯物",
  SINGLE: "一品物",
  DESSERT: "デザート",
}

export const CATEGORY_COLORS: Record<Category, string> = {
  MEAT: "bg-red-100 text-red-700",
  FISH: "bg-blue-100 text-blue-700",
  NABE: "bg-orange-100 text-orange-700",
  PASTA: "bg-yellow-100 text-yellow-700",
  RICE: "bg-green-100 text-green-700",
  SINGLE: "bg-purple-100 text-purple-700",
  DESSERT: "bg-pink-100 text-pink-700",
}
