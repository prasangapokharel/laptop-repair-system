/**
 * Messages/Communication Hook
 * Provides functionality for sending, receiving, and managing messages
 */

"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { useApiMutation, useApiUpdate, useApiDelete } from "@/hooks/useApi"

export type MessageType = "Query" | "Advice" | "Status Update" | "General"
export type MessageStatus = "Sent" | "Read" | "Unread"

export interface Message {
  id: number
  order_id: number | null
  sender_id: number
  recipient_id: number
  subject: string | null
  message: string
  message_type: MessageType
  status: MessageStatus
  created_at: string
  read_at: string | null
  sender?: {
    id: number
    full_name: string
    email: string
    username: string
    profile_picture?: string | null
  }
  recipient?: {
    id: number
    full_name: string
    email: string
    username: string
    profile_picture?: string | null
  }
  order?: {
    id: number
    status: string
    device_id: number
  }
}

interface MessageListResponse {
  items: Message[]
  total: number
  page: number
  limit: number
}

interface ConversationResponse {
  order_id: number
  messages: Message[]
  participants: Array<{
    id: number
    full_name: string
    email: string
    username: string
  }>
}

interface MessageFilters {
  message_type?: "inbox" | "sent" | "all"
  status?: MessageStatus
  limit?: number
  offset?: number
}

interface CreateMessagePayload {
  recipient_id: number
  order_id?: number | null
  subject?: string | null
  message: string
  message_type?: MessageType
}

interface UpdateMessagePayload {
  status?: MessageStatus
  message?: string
}

/**
 * Fetch messages with optional filters
 */
export function useMessages(filters?: MessageFilters) {
  const [data, setData] = useState<Message[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters?.message_type)
        params.append("message_type", filters.message_type)
      if (filters?.status) params.append("status", filters.status)
      if (filters?.limit) params.append("limit", String(filters.limit))
      if (filters?.offset) params.append("offset", String(filters.offset))

      const path = params.toString()
        ? `/api/v1/messages?${params.toString()}`
        : "/api/v1/messages"

      const res = await api.get<MessageListResponse>(path)
      setData(res.items)
      setTotal(res.total)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load messages"
      setError(message)
      console.error("Error fetching messages:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [
    filters?.message_type,
    filters?.status,
    filters?.limit,
    filters?.offset,
  ])

  return { data, total, loading, error, refetch: fetchMessages }
}

/**
 * Get a single message by ID
 */
export function useMessage(messageId: number | null) {
  const [data, setData] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!messageId) {
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchMessage = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get<Message>(`/api/v1/messages/${messageId}`)
        if (!cancelled) {
          setData(res)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load message"
        if (!cancelled) {
          setError(message)
          console.error("Error fetching message:", err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchMessage()

    return () => {
      cancelled = true
    }
  }, [messageId])

  return { data, loading, error }
}

/**
 * Get unread message count
 */
export function useUnreadCount() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCount = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<{ unread_count: number }>(
        "/api/v1/messages/unread-count"
      )
      setCount(res.unread_count)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load unread count"
      setError(message)
      console.error("Error fetching unread count:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCount()
  }, [])

  return { count, loading, error, refetch: fetchCount }
}

/**
 * Get conversation for a specific order
 */
export function useConversation(orderId: number | null) {
  const [data, setData] = useState<ConversationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConversation = async () => {
    if (!orderId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await api.get<ConversationResponse>(
        `/api/v1/messages/conversation/${orderId}`
      )
      setData(res)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load conversation"
      setError(message)
      console.error("Error fetching conversation:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversation()
  }, [orderId])

  return { data, loading, error, refetch: fetchConversation }
}

/**
 * Send a new message
 */
export function useSendMessage() {
  return useApiMutation<CreateMessagePayload, Message>("/api/v1/messages", {
    method: "POST",
  })
}

/**
 * Mark message as read
 */
export function useMarkAsRead() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const markAsRead = async (messageId: number): Promise<Message | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.patch<Message>(
        `/api/v1/messages/${messageId}/read`,
        {}
      )
      return res
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to mark message as read"
      setError(message)
      console.error("Error marking message as read:", err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { markAsRead, loading, error }
}

/**
 * Update a message
 */
export function useUpdateMessage(messageId: number) {
  return useApiUpdate<UpdateMessagePayload, Message>(
    `/api/v1/messages/${messageId}`
  )
}

/**
 * Delete a message
 */
export function useDeleteMessage(messageId: number) {
  return useApiDelete(`/api/v1/messages/${messageId}`)
}

/**
 * Combined hook for managing messages in a component
 * Provides all common message operations
 */
export function useMessageManager() {
  const { mutate: sendMessage, loading: sending, error: sendError } = useSendMessage()
  const { markAsRead, loading: marking, error: markError } = useMarkAsRead()

  const send = async (payload: CreateMessagePayload) => {
    return await sendMessage(payload)
  }

  const read = async (messageId: number) => {
    return await markAsRead(messageId)
  }

  return {
    send,
    read,
    loading: sending || marking,
    error: sendError || markError,
  }
}
