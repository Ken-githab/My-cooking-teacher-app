"use client"

import Link from "next/link"
import { useSearchParams, usePathname } from "next/navigation"
import { Category } from "@/app/generated/prisma/enums"
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/categories"

const ALL = "all"

export default function CategoryFilter() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const current = searchParams.get("category") ?? ALL

  function href(value: string) {
    const params = new URLSearchParams(searchParams)
    if (value === ALL) {
      params.delete("category")
    } else {
      params.set("category", value)
    }
    const qs = params.toString()
    return `${pathname}${qs ? `?${qs}` : ""}`
  }

  const tabs = [
    { label: "すべて", value: ALL },
    ...CATEGORY_ORDER.map((c) => ({ label: CATEGORY_LABELS[c], value: c })),
  ]

  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={href(tab.value)}
          className={`px-5 py-2 rounded-full text-base font-bold transition-colors ${
            current === tab.value
              ? "bg-orange-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
