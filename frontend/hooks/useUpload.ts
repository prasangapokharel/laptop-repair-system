/**
 * Upload Hook
 * Provides functionality for file uploads to Cloudinary CDN
 */

"use client"
import { api } from "@/lib/api-client"

/**
 * Upload profile image for a user to Cloudinary
 * Returns the CDN URL
 */
export async function uploadProfileImage(
  name: string,
  file: File
): Promise<string> {
  try {
    const result = await api.upload<{ path: string }>(
      `/users/${encodeURIComponent(name)}/profilepic`, 
      file
    )
    if (!result || !result.path) {
      throw new Error("Upload failed: No path returned")
    }
    // Return the Cloudinary CDN URL
    return result.path
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to upload profile image"
    throw new Error(message)
  }
}

/**
 * Generic file upload to Cloudinary
 */
export async function uploadFile(name: string, file: File): Promise<string> {
  try {
    const result = await api.upload<{ path: string }>(
      `/users/${encodeURIComponent(name)}/profilepic`,
      file
    )
    if (!result || !result.path) {
      throw new Error("Upload failed: No path returned")
    }
    return result.path
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload file"
    throw new Error(message)
  }
}

/**
 * Hook for uploading files
 */
export function useUpload() {
  return {
    uploadFile,
    uploadProfileImage,
  }
}
