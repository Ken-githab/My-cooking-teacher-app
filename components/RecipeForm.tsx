"use client"

import { useState, useTransition, useRef } from "react"
import { upload } from "@vercel/blob/client"
import { Category } from "@/app/generated/prisma/enums"
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/categories"
import type { RecipeFormData } from "@/lib/actions"

type Props = {
  initial?: {
    name: string
    category: Category
    imageUrl: string
    thumbUrl: string
    description: string
    ingredients: { name: string; amount: string }[]
    steps: { description: string; imageUrl: string }[]
  }
  onSubmit: (data: RecipeFormData) => Promise<void>
  submitLabel: string
}

export default function RecipeForm({ initial, onSubmit, submitLabel }: Props) {
  const [name, setName] = useState(initial?.name ?? "")
  const [category, setCategory] = useState<Category>(initial?.category ?? Category.MEAT)
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "")
  const [thumbUrl, setThumbUrl] = useState(initial?.thumbUrl ?? "")
  const [imagePreview, setImagePreview] = useState(initial?.imageUrl ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [ingredients, setIngredients] = useState<{ name: string; amount: string }[]>(
    initial?.ingredients ?? [{ name: "", amount: "" }]
  )
  const [steps, setSteps] = useState<{ description: string; imageUrl: string }[]>(
    initial?.steps ?? [{ description: "", imageUrl: "" }]
  )
  const [stepPreviews, setStepPreviews] = useState<string[]>(
    initial?.steps.map((s) => s.imageUrl) ?? [""]
  )
  const [uploading, setUploading] = useState(false)
  const [stepUploading, setStepUploading] = useState<boolean[]>([false])
  const [pending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stepFileRefs = useRef<(HTMLInputElement | null)[]>([])

  function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.onload = () => resolve(img)
      img.src = URL.createObjectURL(file)
    })
  }

  function resizeCanvas(img: HTMLImageElement, maxWidth: number): HTMLCanvasElement {
    const scale = Math.min(1, maxWidth / img.width)
    const canvas = document.createElement("canvas")
    canvas.width = img.width * scale
    canvas.height = img.height * scale
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas
  }

  // 一覧表示用に中央を正方形に切り出した小さいサムネイルを作る
  function thumbCanvas(img: HTMLImageElement, size: number): HTMLCanvasElement {
    const side = Math.min(img.width, img.height)
    const sx = (img.width - side) / 2
    const sy = (img.height - side) / 2
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    canvas.getContext("2d")!.drawImage(img, sx, sy, side, side, 0, 0, size, size)
    return canvas
  }

  function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg", quality)
    })
  }

  async function uploadImage(blob: Blob): Promise<string> {
    const result = await upload(`recipes/${crypto.randomUUID()}.jpg`, blob, {
      access: "public",
      handleUploadUrl: "/api/blob-upload",
    })
    return result.url
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const img = await loadImage(file)
    const mainCanvas = resizeCanvas(img, 800)
    setImagePreview(mainCanvas.toDataURL("image/jpeg", 0.8))
    const [mainBlob, thumbBlob] = await Promise.all([
      canvasToBlob(mainCanvas, 0.8),
      canvasToBlob(thumbCanvas(img, 240), 0.65),
    ])
    const [mainUrl, thumbUrlResult] = await Promise.all([
      uploadImage(mainBlob),
      uploadImage(thumbBlob),
    ])
    setImageUrl(mainUrl)
    setThumbUrl(thumbUrlResult)
    setUploading(false)
  }

  async function handleStepImageChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStepUploading((prev) => {
      const next = [...prev]
      next[i] = true
      return next
    })
    const img = await loadImage(file)
    const canvas = resizeCanvas(img, 800)
    setStepPreviews((prev) => {
      const next = [...prev]
      next[i] = canvas.toDataURL("image/jpeg", 0.8)
      return next
    })
    const blob = await canvasToBlob(canvas, 0.8)
    const url = await uploadImage(blob)
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, imageUrl: url } : s)))
    setStepUploading((prev) => {
      const next = [...prev]
      next[i] = false
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await onSubmit({ name, category, imageUrl, thumbUrl, description, ingredients, steps })
    })
  }

  function addIngredient() {
    setIngredients([...ingredients, { name: "", amount: "" }])
  }
  function removeIngredient(i: number) {
    setIngredients(ingredients.filter((_, idx) => idx !== i))
  }
  function updateIngredient(i: number, field: "name" | "amount", value: string) {
    setIngredients(ingredients.map((ing, idx) => (idx === i ? { ...ing, [field]: value } : ing)))
  }

  function addStep() {
    setSteps([...steps, { description: "", imageUrl: "" }])
    setStepPreviews((prev) => [...prev, ""])
    setStepUploading((prev) => [...prev, false])
  }
  function removeStep(i: number) {
    setSteps(steps.filter((_, idx) => idx !== i))
    setStepPreviews((prev) => prev.filter((_, idx) => idx !== i))
    setStepUploading((prev) => prev.filter((_, idx) => idx !== i))
  }
  function updateStepDesc(i: number, value: string) {
    setSteps(steps.map((s, idx) => (idx === i ? { ...s, description: value } : s)))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 写真 */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">写真</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-full h-52 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer hover:border-orange-400 transition-colors"
        >
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePreview} alt="料理の写真" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <span className="text-4xl">📷</span>
              <span className="text-base font-medium">
                {uploading ? "アップロード中..." : "タップして写真を選ぶ"}
              </span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="text-white text-base font-semibold">アップロード中...</span>
            </div>
          )}
          {imagePreview && !uploading && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-base font-semibold bg-black/50 px-3 py-1 rounded-lg">
                写真を変更
              </span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {/* 料理名 */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-1">料理名 *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
          placeholder="例: 鶏の唐揚げ"
        />
      </div>

      {/* カテゴリ */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-1">カテゴリ *</label>
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-5 py-2 rounded-full text-base font-medium border transition-colors ${
                category === c
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-600 border-gray-300 hover:border-orange-400 hover:text-orange-500"
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* 食材 */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">食材</label>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={ing.name}
                onChange={(e) => updateIngredient(i, "name", e.target.value)}
                placeholder="食材名"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-base"
              />
              <input
                type="text"
                value={ing.amount}
                onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                placeholder="分量"
                className="w-28 border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-base"
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  className="text-gray-400 hover:text-red-500 text-2xl leading-none px-1"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="mt-3 text-base text-gray-600 font-medium hover:text-orange-500"
        >
          + 食材を追加
        </button>
      </div>

      {/* 作り方 */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">作り方</label>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
              <div className="flex gap-2 items-start">
                <span className="mt-3 text-base font-bold text-orange-500 w-6 shrink-0">
                  {i + 1}.
                </span>
                <textarea
                  value={step.description}
                  onChange={(e) => updateStepDesc(i, e.target.value)}
                  placeholder={`手順 ${i + 1}`}
                  rows={2}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-base resize-none"
                />
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="mt-2 text-gray-400 hover:text-red-500 text-2xl leading-none px-1"
                  >
                    ×
                  </button>
                )}
              </div>
              {/* 手順ごとの写真 */}
              <div
                onClick={() => stepFileRefs.current[i]?.click()}
                className="relative w-full h-32 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer hover:border-orange-400 transition-colors"
              >
                {stepPreviews[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={stepPreviews[i]} alt={`手順${i + 1}の写真`} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-1">
                    <span className="text-2xl">📷</span>
                    <span className="text-sm font-medium">
                      {stepUploading[i] ? "アップロード中..." : "写真を追加（任意）"}
                    </span>
                  </div>
                )}
                {stepUploading[i] && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">アップロード中...</span>
                  </div>
                )}
                {stepPreviews[i] && !stepUploading[i] && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded-lg">
                      写真を変更
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={(el) => { stepFileRefs.current[i] = el }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleStepImageChange(i, e)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          className="mt-3 text-base text-gray-600 font-medium hover:text-orange-500"
        >
          + 手順を追加
        </button>
      </div>

      {/* メモ（一番下） */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-1">メモ（任意）</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          placeholder="備考など"
        />
      </div>

      <button
        type="submit"
        disabled={pending || uploading || stepUploading.some(Boolean)}
        className="w-full bg-orange-500 text-white py-4 text-lg rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
      >
        {pending ? "保存中..." : submitLabel}
      </button>
    </form>
  )
}
