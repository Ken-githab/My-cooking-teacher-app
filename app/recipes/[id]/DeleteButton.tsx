"use client"

import { useTransition } from "react"
import { deleteRecipe } from "@/lib/actions"

export default function DeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm("この料理を削除しますか？")) return
    startTransition(() => deleteRecipe(id))
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="text-base px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
    >
      {pending ? "削除中..." : "削除"}
    </button>
  )
}
