"use client";
import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useMessages, useSendMessage, useMarkAsRead, useDeleteMessage, type Message } from "@/hooks/useMessages"
import { useUsers } from "@/hooks/useUsers"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Breadcrumb } from "@/components/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Inbox, Send, Mail, Trash2, Eye, Plus } from "lucide-react"
import { toast } from "sonner"

export default function AdminMessagesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "all">("inbox")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  
  // Form state for composing messages
  const [recipientId, setRecipientId] = useState("")
  const [subject, setSubject] = useState("")
  const [messageText, setMessageText] = useState("")
  const [messageType, setMessageType] = useState<"Query" | "Advice" | "Status Update" | "General">("General")

  // Fetch messages based on active tab
  const { data: messages, total, loading, error, refetch } = useMessages({
    message_type: activeTab,
    limit: 50,
    offset: 0,
  })

  // Fetch users for recipient dropdown
  const { data: users, loading: usersLoading } = useUsers(100, 0)

  // Mutations
  const { mutate: sendMessage, loading: sending } = useSendMessage()
  const { markAsRead } = useMarkAsRead()
  const { deleteItem } = useDeleteMessage(0)

  // Handle sending message
  const handleSendMessage = async () => {
    if (!recipientId || !messageText) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await sendMessage({
        recipient_id: parseInt(recipientId),
        message: messageText,
        subject: subject || undefined,
        message_type: messageType,
      })
      
      toast.success("Message sent successfully")
      setShowCompose(false)
      
      // Reset form
      setRecipientId("")
      setSubject("")
      setMessageText("")
      setMessageType("General")
      
      // Refetch messages
      refetch()
    } catch (err: any) {
      toast.error(err.message || "Failed to send message")
    }
  }

  // Handle viewing message
  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message)
    setShowViewDialog(true)
    
    // Mark as read if it's unread and user is recipient
    if (message.status === "Unread") {
      try {
        await markAsRead(message.id)
        refetch()
      } catch (err) {
        console.error("Failed to mark as read:", err)
      }
    }
  }

  // Handle deleting message
  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return
    }

    try {
      await deleteItem(messageId)
      toast.success("Message deleted successfully")
      refetch()
      if (selectedMessage?.id === messageId) {
        setShowViewDialog(false)
        setSelectedMessage(null)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete message")
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Breadcrumb
            items={[
              { label: "Admin", href: "/admin" },
              { label: "Messages", href: "/admin/messages" },
            ]}
          />

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Messages</h1>
              <p className="text-muted-foreground">
                Communicate with users across the system
              </p>
            </div>
            <Dialog open={showCompose} onOpenChange={setShowCompose}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Compose
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Compose Message</DialogTitle>
                  <DialogDescription>
                    Send a message to any user in the system
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="recipient">Recipient *</Label>
                    <Select value={recipientId} onValueChange={setRecipientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.full_name} ({user.username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Message subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message_type">Message Type</Label>
                    <Select value={messageType} onValueChange={(val: any) => setMessageType(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Query">Query</SelectItem>
                        <SelectItem value="Advice">Advice</SelectItem>
                        <SelectItem value="Status Update">Status Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      rows={6}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCompose(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendMessage} disabled={sending}>
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
            <TabsList>
              <TabsTrigger value="inbox">
                <Inbox className="mr-2 h-4 w-4" />
                Inbox
              </TabsTrigger>
              <TabsTrigger value="sent">
                <Send className="mr-2 h-4 w-4" />
                Sent
              </TabsTrigger>
              <TabsTrigger value="all">
                <Mail className="mr-2 h-4 w-4" />
                All
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">Loading messages...</p>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-destructive">{error}</p>
                  </CardContent>
                </Card>
              ) : messages.length === 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">No messages found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {messages.map((message) => (
                    <Card
                      key={message.id}
                      className={`cursor-pointer transition-colors hover:bg-accent ${
                        message.status === "Unread" ? "border-l-4 border-l-primary" : ""
                      }`}
                      onClick={() => handleViewMessage(message)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {/* Avatar */}
                            <Avatar className="h-10 w-10">
                              <AvatarImage 
                                src={activeTab === "sent" 
                                  ? message.recipient?.profile_picture || undefined
                                  : message.sender?.profile_picture || undefined
                                } 
                                alt={activeTab === "sent" 
                                  ? message.recipient?.full_name
                                  : message.sender?.full_name
                                } 
                              />
                              <AvatarFallback className="text-xs">
                                {(activeTab === "sent" 
                                  ? message.recipient?.full_name 
                                  : message.sender?.full_name
                                )?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            
                            {/* Message Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">
                                  {activeTab === "sent"
                                    ? `To: ${message.recipient?.full_name || "Unknown"}`
                                    : `From: ${message.sender?.full_name || "Unknown"}`}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {message.message_type}
                                </Badge>
                                {message.status === "Unread" && (
                                  <Badge variant="default" className="text-xs">
                                    Unread
                                  </Badge>
                                )}
                              </div>
                              {message.subject && (
                                <p className="font-medium text-sm mb-1">{message.subject}</p>
                              )}
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {message.message}
                              </p>
                              {message.order && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  Order #{message.order.id}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(message.created_at)}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewMessage(message)
                                }}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteMessage(message.id)
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>

      {/* View Message Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={selectedMessage.sender?.profile_picture || undefined} 
                        alt={selectedMessage.sender?.full_name}
                      />
                      <AvatarFallback className="text-xs">
                        {selectedMessage.sender?.full_name?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">From</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedMessage.sender?.full_name} ({selectedMessage.sender?.email})
                      </p>
                    </div>
                  </div>
                  <Badge variant={selectedMessage.status === "Unread" ? "default" : "outline"}>
                    {selectedMessage.status}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={selectedMessage.recipient?.profile_picture || undefined} 
                      alt={selectedMessage.recipient?.full_name}
                    />
                    <AvatarFallback className="text-xs">
                      {selectedMessage.recipient?.full_name?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">To</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedMessage.recipient?.full_name} ({selectedMessage.recipient?.email})
                    </p>
                  </div>
                </div>
              </div>
              {selectedMessage.subject && (
                <div className="grid gap-2">
                  <p className="text-sm font-medium">Subject</p>
                  <p className="text-sm">{selectedMessage.subject}</p>
                </div>
              )}
              <div className="grid gap-2">
                <p className="text-sm font-medium">Type</p>
                <Badge variant="outline" className="w-fit">
                  {selectedMessage.message_type}
                </Badge>
              </div>
              {selectedMessage.order && (
                <div className="grid gap-2">
                  <p className="text-sm font-medium">Related Order</p>
                  <Button
                    variant="link"
                    className="w-fit p-0 h-auto"
                    onClick={() => router.push(`/admin/orders/${selectedMessage.order?.id}/view`)}
                  >
                    Order #{selectedMessage.order.id}
                  </Button>
                </div>
              )}
              <div className="grid gap-2">
                <p className="text-sm font-medium">Message</p>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
              <div className="grid gap-2">
                <p className="text-xs text-muted-foreground">
                  Sent: {formatDate(selectedMessage.created_at)}
                </p>
                {selectedMessage.read_at && (
                  <p className="text-xs text-muted-foreground">
                    Read: {formatDate(selectedMessage.read_at)}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => selectedMessage && handleDeleteMessage(selectedMessage.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
