export async function uploadProfileImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append("file", file)
  const res = await fetch("/api/upload", {
    method: "POST",
    body: fd,
  })
  if (!res.ok) {
    let msg = "Upload failed"
    try {
      const j = await res.json()
      msg = j?.error || msg
    } catch {}
    throw new Error(msg)
  }
  const data = (await res.json()) as { path: string }
  return data.path
}
