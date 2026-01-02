"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { usePaymentMutations } from "@/hooks/usePaymentMutations"
import { useOrders } from "@/hooks/useOrders"
import { useState, useMemo } from "react"

interface PaymentFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function PaymentForm({ onSuccess, onError }: PaymentFormProps) {
  const { data: orders = [] } = useOrders({ limit: 100, offset: 0 })
  const { createPayment, loading, error: mutationError } = usePaymentMutations()

  const [orderId, setOrderId] = useState<number | null>(null)
  const [amount, setAmount] = useState<string>("")
  const [dueAmount, setDueAmount] = useState<string>("")
  const [status, setStatus] = useState("Paid")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [openOrder, setOpenOrder] = useState(false)
  const [customError, setCustomError] = useState("")

  // Get selected order
  const selectedOrder = useMemo(() => {
    return orders.find((o) => o.id === orderId)
  }, [orderId, orders])

  // Auto-calculate due amount when amount changes
  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (selectedOrder && value) {
      const paid = parseFloat(value)
      const total = parseFloat(String(selectedOrder.total_cost || 0))
      if (!isNaN(paid) && !isNaN(total)) {
        const due = Math.max(0, total - paid)
        setDueAmount(due.toFixed(2))
      }
    }
  }

  // Auto-populate due amount when order is selected
  const handleOrderSelect = (id: number) => {
    setOrderId(id)
    const order = orders.find((o) => o.id === id)
    if (order) {
      setDueAmount(String(order.total_cost || 0))
      setAmount("")
    }
    setOpenOrder(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCustomError("")

    if (!orderId || !amount) {
      setCustomError("Order and payment amount are required")
      if (onError) onError("Order and payment amount are required")
      return
    }

    const paymentAmount = parseFloat(amount)
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setCustomError("Valid payment amount is required")
      if (onError) onError("Valid payment amount is required")
      return
    }

    try {
      await createPayment({
        order_id: orderId,
        amount,
        due_amount: dueAmount || "0",
        status,
        payment_method: paymentMethod || null,
        transaction_id: transactionId || null,
      })
      if (onSuccess) onSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to record payment"
      setCustomError(message)
      if (onError) onError(message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* Order Selection with Combobox */}
      <div className="space-y-2">
        <Label>Select Order *</Label>
        <Popover open={openOrder} onOpenChange={setOpenOrder}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openOrder}
              className="w-full justify-between"
            >
              {orderId
                ? (() => {
                    const order = orders.find((o) => o.id === orderId)
                    if (!order) return "Select order..."
                    return `Order #${order.id} - रु ${order.total_cost}`
                  })()
                : "Select order..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search order..." />
              <CommandList>
                <CommandEmpty>No order found.</CommandEmpty>
                <CommandGroup>
                  {orders.map((order) => (
                    <CommandItem
                      key={order.id}
                      value={`${order.id} Order ${order.id} ${order.total_cost}`}
                      onSelect={() => handleOrderSelect(order.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          orderId === order.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Order #{order.id} - रु {order.total_cost}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Payment Amount */}
      <div className="space-y-2">
        <Label>Payment Amount (रु) *</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="Enter payment amount"
          min="0"
          step="0.01"
          className="text-lg"
        />
        {selectedOrder && (
          <p className="text-sm text-muted-foreground">
            Order total: रु {selectedOrder.total_cost}
          </p>
        )}
      </div>

      {/* Due Amount (Auto-calculated) */}
      <div className="space-y-2">
        <Label>Due Amount (रु)</Label>
        <Input
          type="number"
          value={dueAmount}
          readOnly
          placeholder="Auto-calculated"
          min="0"
          step="0.01"
          className="text-lg bg-gray-50"
        />
        <p className="text-sm text-muted-foreground">
          Automatically calculated from order total minus payment amount
        </p>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>Payment Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Partial">Partial</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Card">Card</SelectItem>
            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
            <SelectItem value="Online">Online Payment</SelectItem>
            <SelectItem value="Check">Check</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction ID */}
      <div className="space-y-2">
        <Label>Transaction ID</Label>
        <Input
          type="text"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          placeholder="Enter transaction ID (optional)"
        />
      </div>

      {/* Errors */}
      {(customError || mutationError) && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {customError || mutationError}
        </div>
      )}

      {/* Summary */}
      {selectedOrder && amount && (
        <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
          <h3 className="font-semibold text-sm mb-2">Payment Summary</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Order Total:</span>
              <span>रु {selectedOrder.total_cost}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Amount:</span>
              <span>रु {parseFloat(amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-1">
              <span>Due Amount:</span>
              <span>रु {dueAmount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={loading} size="lg" className="w-full">
        {loading ? "Recording..." : "Record Payment"}
      </Button>
    </form>
  )
}
