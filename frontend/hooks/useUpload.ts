/**
 * Upload Hook
 * Provides functionality for file uploads
 */

"use client"
import { api } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/config/api.config"

/**
 * Upload profile image for a user
 */
export async function uploadProfileImage(
  name: string,
  file: File
): Promise<string> {
  try {
    const result = await api.upload<{ file_path: string }>(API_ENDPOINTS.UPLOAD, file)
    if (!result || !result.file_path) {
      throw new Error("Upload failed: No file path returned")
    }
    return result.file_path
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to upload profile image"
    throw new Error(message)
  }
}

/**
 * Generic file upload
 */
export async function uploadFile(file: File): Promise<string> {
  try {
    const result = await api.upload<{ file_path: string }>(API_ENDPOINTS.UPLOAD, file)
    if (!result || !result.file_path) {
      throw new Error("Upload failed: No file path returned")
    }
    return result.file_path
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload file"
    throw new Error(message)
  }
}
