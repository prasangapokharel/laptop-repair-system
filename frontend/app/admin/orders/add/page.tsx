"use client";
import { AdminSidebar } from "@/components/sidebar/admin"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDeviceList } from "@/hooks/useDeviceList"
import { useOrderMutations } from "@/hooks/useOrderMutations"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useUsers } from "@/hooks/useUsers"
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
import { useEffect } from "react"

export default function AdminAddOrderPage() {
  const { data: devices } = useDeviceList(100, 0)
  const { createOrder, assignOrder, loading, error: mutationError } = useOrderMutations()
  const { data: users } = useUsers(100, 0)
  const { data: brands } = useDeviceBrands()
  const { data: models } = useDeviceModels()
  const { data: types } = useDeviceTypes()
  const { data: problems } = useProblems(100, 0)
  const router = useRouter()
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
    if (!deviceId) return

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
      router.push("/admin/orders")
    } catch {}
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between space-y-2 py-4">
             <h2 className="text-3xl font-bold tracking-tight">Create Order</h2>
          </div>
          <div className="w-full">
            <Card className="w-full">
              <CardContent className="p-6">
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2 flex flex-col">
                      <Label>Device</Label>
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
                      <Label>Assign To</Label>
                      <Select onValueChange={(v) => setAssigneeId(Number(v))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              {u.full_name} • #{u.id}
                            </SelectItem>
                          ))}
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
                              placeholder="9800000000"
                            />
                          </div>
                        </div>
                      ) : (
                        <Select
                          onValueChange={(v) =>
                            setCustomerId(v === "none" ? null : Number(v))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {users.map((u) => (
                              <SelectItem key={u.id} value={String(u.id)}>
                                {u.full_name} • {u.phone} • #{u.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                     <div className="space-y-2 flex flex-col">
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
                              ? problems.find((p) => p.id === problemId)?.name
                              : "Select problem..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
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
                        type="text"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Discount</Label>
                      <Input
                        type="text"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                         placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Estimated Completion</Label>
                    <Input
                      type="datetime-local"
                      value={eta}
                      onChange={(e) => setEta(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Note</Label>
                    <Input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Optional note"
                    />
                  </div>

                  {(customError || mutationError) && (
                    <p className="text-sm text-red-500" role="alert">
                      {customError || mutationError}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Order"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
