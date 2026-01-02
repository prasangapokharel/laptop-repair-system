"use client";
import { AdminSidebar } from "@/components/sidebar/admin";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAssignmentMutations } from "@/hooks/useAssignments";
import { useOrders } from "@/hooks/useOrders";
import { useUsers } from "@/hooks/useUsers";

export default function AdminAddAssignmentPage() {
  const router = useRouter();
  const { createAssignment, loading, error } = useAssignmentMutations();
  const { data: orders = [] } = useOrders({ limit: 100 });
  const { data: users = [] } = useUsers(100, 0);

  const [orderId, setOrderId] = useState<number | null>(null);
  const [technicianId, setTechnicianId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  // Filter only technicians
  const technicians = users.filter((u) => u.role?.name === "technician");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId || !technicianId) return;
    try {
      await createAssignment({
        order_id: orderId,
        technician_id: technicianId,
        notes: notes || undefined,
      });
      router.push("/admin/assignments");
    } catch {}
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between space-y-2 py-4">
            <h2 className="text-3xl font-bold tracking-tight">Assign Order</h2>
          </div>
          <div className="w-full">
            <Card className="w-full">
              <CardContent className="p-6">
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel>Select Order *</FieldLabel>
                      <Select
                        onValueChange={(v) =>
                          setOrderId(v ? Number(v) : null)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an order" />
                        </SelectTrigger>
                        <SelectContent>
                          {orders.map((order) => (
                            <SelectItem key={order.order_id} value={String(order.order_id)}>
                              Order #{order.order_id} - {order.device_name || `Device #${order.order_id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Select Technician *</FieldLabel>
                      <Select
                        onValueChange={(v) =>
                          setTechnicianId(v ? Number(v) : null)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a technician" />
                        </SelectTrigger>
                        <SelectContent>
                          {technicians.map((tech) => (
                            <SelectItem
                              key={tech.id}
                              value={String(tech.id)}
                            >
                              {tech.full_name} (#{tech.id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Notes (Optional)</FieldLabel>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes for the technician"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500" role="alert">
                      {error}
                    </p>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Assigning..." : "Assign Order"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
