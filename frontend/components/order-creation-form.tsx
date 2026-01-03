"use client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDeviceList } from "@/hooks/useDeviceList"
import { useOrderMutations } from "@/hooks/useOrderMutations"
import { useCustomers, useTechnicians } from "@/hooks/useUsers"
import { useDeviceBrands } from "@/hooks/useDeviceBrands"
import { useDeviceModels } from "@/hooks/useDeviceModels"
import { useDeviceTypes } from "@/hooks/useDeviceTypes"
import { useProblems } from "@/hooks/useProblems"
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
import { Checkbox } from "@/components/ui/checkbox"
import { apiJson } from "@/lib/api"
import { useEffect, useState } from "react"

interface OrderCreationFormProps {
  onSuccess?: (orderId: number) => void
  onError?: (error: string) => void
}

export function OrderCreationForm({ onSuccess, onError }: OrderCreationFormProps) {
  const { data: devices = [] } = useDeviceList(100, 0)
  const { createOrder, assignOrder, loading, error: mutationError } = useOrderMutations()
  const { data: customers = [], loading: customersLoading, error: customersError } = useCustomers(100, 0)
  const { data: technicians = [], loading: techniciansLoading, error: techniciansError } = useTechnicians(100, 0)
  const { data: brands = [] } = useDeviceBrands()
  const { data: models = [] } = useDeviceModels()
  const { data: types = [] } = useDeviceTypes()
  const { data: problems = [] } = useProblems(100, 0)
  
  // Debug logging
  useEffect(() => {
    console.log('Customers:', customers.length, 'Loading:', customersLoading, 'Error:', customersError)
    console.log('Technicians:', technicians.length, 'Loading:', techniciansLoading, 'Error:', techniciansError)
  }, [customers, customersLoading, customersError, technicians, techniciansLoading, techniciansError])
  
  const [deviceId, setDeviceId] = useState<number | null>(null)
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [problemId, setProblemId] = useState<number | null>(null)
  const [cost, setCost] = useState<string>("0.00")
  const [discount, setDiscount] = useState<string>("0.00")
  const [note, setNote] = useState<string>("")
  const [assigneeId, setAssigneeId] = useState<number | null>(null)
  const [eta, setEta] = useState<string>("")

  // New Customer State
  const [isNewCustomer, setIsNewCustomer] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState("")
  const [newCustomerPhone, setNewCustomerPhone] = useState("")
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([])
  const [customError, setCustomError] = useState<string | null>(null)

  const [openDevice, setOpenDevice] = useState(false)
  const [openProblem, setOpenProblem] = useState(false)
  const [openCustomer, setOpenCustomer] = useState(false)

  const brandMap = Object.fromEntries(brands.map((b) => [b.id, b.name]))
  const modelMap = Object.fromEntries(models.map((m) => [m.id, m.name]))
  const typeMap = Object.fromEntries(types.map((t) => [t.id, t.name]))

  useEffect(() => {
    apiJson<{ id: number; name: string }[]>("/users/roles")
      .then(setRoles)
      .catch(() => {})
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCustomError(null)
    if (!deviceId) {
      setCustomError("Device is required")
      return
    }

    let finalCustomerId = customerId

    if (isNewCustomer) {
      if (!newCustomerName || !newCustomerPhone) {
        setCustomError("Please fill in customer name and phone")
        return
      }
      try {
        // Generate a random password
        const password = Math.random().toString(36).slice(-8) + "Aa1!"
        
        const newUser = await apiJson<{ id: number }>(`/users`, {
          method: "POST",
          body: JSON.stringify({
            full_name: newCustomerName,
            phone: newCustomerPhone,
            password: password,
          }),
        })

        const customerRole = roles.find((r) => r.name === "Customer")
        if (customerRole) {
          await apiJson(`/users/${newUser.id}/roles`, {
            method: "POST",
            body: JSON.stringify({
              user_id: newUser.id,
              role_id: customerRole.id,
            }),
          })
        }
        finalCustomerId = newUser.id
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to create customer"
        setCustomError(message)
        if (onError) onError(message)
        return
      }
    }

    try {
      const created = await createOrder({
        device_id: deviceId,
        customer_id: finalCustomerId ?? null,
        problem_id: problemId ?? null,
        cost,
        discount,
        note,
        status: "Pending",
        estimated_completion_date: eta || null,
      })
      if (created?.id && assigneeId) {
        await assignOrder(created.id, assigneeId)
      }
      if (onSuccess) onSuccess(created?.id || 0)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create order"
      setCustomError(message)
      if (onError) onError(message)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2 flex flex-col">
          <Label>Device *</Label>
          <Popover open={openDevice} onOpenChange={setOpenDevice}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openDevice}
                className="w-full justify-between"
              >
                {deviceId
                  ? (() => {
                      const d = devices.find((device) => device.id === deviceId)
                      if (!d) return "Select device..."
                      return `${brandMap[d.brand_id] ?? ""} ${modelMap[d.model_id] ?? ""} - ${d.serial_number ?? "N/A"}`
                    })()
                  : "Select device..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Search device..." />
                <CommandList>
                  <CommandEmpty>No device found.</CommandEmpty>
                  <CommandGroup>
                    {devices.map((d) => (
                      <CommandItem
                        key={d.id}
                        value={`${d.id} ${brandMap[d.brand_id] ?? ""} ${modelMap[d.model_id] ?? ""} ${d.serial_number ?? ""}`}
                        onSelect={() => {
                          setDeviceId(d.id)
                          setOpenDevice(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            deviceId === d.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {brandMap[d.brand_id] ?? `Brand ${d.brand_id}`}{" "}
                        {modelMap[d.model_id] ?? `Model ${d.model_id}`}{" "}
                        • {typeMap[d.device_type_id] ?? `Type ${d.device_type_id}`}{" "}
                        • SN {d.serial_number ?? "N/A"} • #{d.id}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Assign To (Technician)</Label>
          <Select onValueChange={(v) => setAssigneeId(Number(v) || null)}>
            <SelectTrigger>
              <SelectValue placeholder="Select technician" />
            </SelectTrigger>
            <SelectContent>
              {technicians.length > 0 ? (
                technicians.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.full_name} • #{u.id}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">No technicians available</div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Customer</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="new-customer"
                checked={isNewCustomer}
                onCheckedChange={(checked) => setIsNewCustomer(!!checked)}
              />
              <Label
                htmlFor="new-customer"
                className="text-sm font-normal cursor-pointer"
              >
                New Customer?
              </Label>
            </div>
          </div>

          {isNewCustomer ? (
            <div className="space-y-2 border p-3 rounded-md">
              <div className="space-y-1">
                <Label className="text-xs">Full Name</Label>
                <Input
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Phone</Label>
                <Input
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="1234567890"
                />
              </div>
            </div>
          ) : (
            <>
              {customersError && (
                <div className="text-sm text-red-600 mb-2">
                  Error loading customers: {customersError}
                </div>
              )}
              <Popover open={openCustomer} onOpenChange={setOpenCustomer}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCustomer}
                    className="w-full justify-between"
                    disabled={customersLoading}
                  >
                    {customersLoading ? "Loading customers..." : (
                      customerId
                        ? customers.find((u) => u.id === customerId)?.full_name || "Select customer..."
                        : "Select customer..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search customer..." />
                    <CommandList>
                      <CommandEmpty>
                        {customersLoading ? "Loading..." : "No customer found."}
                      </CommandEmpty>
                      <CommandGroup>
                        {customers.map((u) => (
                          <CommandItem
                            key={u.id}
                            value={`${u.id} ${u.full_name} ${u.phone}`}
                            onSelect={() => {
                              setCustomerId(u.id)
                              setOpenCustomer(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                customerId === u.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {u.full_name} • {u.phone}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label>Problem</Label>
          <Popover open={openProblem} onOpenChange={setOpenProblem}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openProblem}
                className="w-full justify-between"
              >
                {problemId
                  ? problems.find((p) => p.id === problemId)?.name || "Select problem..."
                  : "Select problem..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search problem..." />
                <CommandList>
                  <CommandEmpty>No problem found.</CommandEmpty>
                  <CommandGroup>
                    {problems.map((p) => (
                      <CommandItem
                        key={p.id}
                        value={`${p.id} ${p.name}`}
                        onSelect={() => {
                          setProblemId(p.id)
                          setOpenProblem(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            problemId === p.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {p.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Cost</Label>
          <Input
            type="number"
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label>Discount</Label>
          <Input
            type="number"
            step="0.01"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Note</Label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional notes..."
          />
        </div>
        <div className="space-y-2">
          <Label>Est. Completion Date</Label>
          <Input
            type="datetime-local"
            value={eta}
            onChange={(e) => setEta(e.target.value)}
          />
        </div>
      </div>

      {customError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {customError}
        </div>
      )}

      {mutationError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {mutationError}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Order"}
        </Button>
      </div>
    </form>
  )
}
