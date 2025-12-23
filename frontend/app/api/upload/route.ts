import { NextRequest, NextResponse } from "next/server"
import path from "node:path"
import fs from "node:fs"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "file required" }, { status: 400 })
  }
  const name = file.name || "upload"
  const ext = name.split(".").pop()?.toLowerCase()
  if (!ext || !["png", "jpg", "jpeg"].includes(ext)) {
    return NextResponse.json({ error: "invalid file type" }, { status: 415 })
  }
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const dir = path.join(process.cwd(), "public", "customer", "profile_image")
  await fs.promises.mkdir(dir, { recursive: true })
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const filepath = path.join(dir, filename)
  await fs.promises.writeFile(filepath, buffer)
  const publicPath = `/customer/profile_image/${filename}`
  return NextResponse.json({ path: publicPath })
}
