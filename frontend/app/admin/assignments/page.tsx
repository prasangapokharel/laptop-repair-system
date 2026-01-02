"use client";
import { AdminSidebar } from "@/components/sidebar/admin";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAssignments, type Assignment } from "@/hooks/useAssignments";
import { useAssignmentMutations } from "@/hooks/useAssignments";
import { useRouter } from "next/navigation";
import { TableList, ColumnDef } from "@/components/tables/table-list";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { useState } from "react";

export default function AdminAssignmentsPage() {
  const { data, loading } = useAssignments({ limit: 15, offset: 0 });
  const { deleteAssignment } = useAssignmentMutations();
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const columns: ColumnDef<Assignment>[] = [
    {
      key: "id",
      header: "Assignment ID",
      render: (assignment) => `#${assignment.id}`,
      sortable: true,
    },
    {
      key: "order_id",
      header: "Order ID",
      render: (assignment) => `#${assignment.order_id}`,
      sortable: true,
    },
    {
      key: "technician_id",
      header: "Technician ID",
      render: (assignment) => `#${assignment.technician_id}`,
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      render: (assignment) => (
        <Badge
          variant={
            assignment.status === "completed"
              ? "default"
              : assignment.status === "in_progress"
                ? "secondary"
                : "outline"
          }
        >
          {assignment.status}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "assigned_at",
      header: "Assigned At",
      render: (assignment) => 
        new Date(assignment.assigned_at).toLocaleDateString(),
      sortable: true,
    },
    {
      key: "completed_at",
      header: "Completed At",
      render: (assignment) =>
        assignment.completed_at
          ? new Date(assignment.completed_at).toLocaleDateString()
          : "Pending",
      sortable: true,
    },
  ];

  const handleDelete = async (assignment: Assignment) => {
    try {
      await deleteAssignment(assignment.id);
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete assignment:", error);
    }
  };

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Order Assignments</h1>
              <p className="text-sm text-muted-foreground">
                Manage technician assignments for service orders
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/assignments/add">Assign Order</Link>
            </Button>
          </div>

          <TableList<Assignment>
            title="Assignments"
            description="View and manage technician assignments"
            data={data}
            columns={columns}
            loading={loading}
            emptyMessage="No assignments found"
            searchableFields={["id", "order_id", "technician_id", "status"]}
            onView={(assignment) =>
              router.push(`/admin/assignments/${assignment.id}`)
            }
            onEdit={(assignment) =>
              router.push(`/admin/assignments/${assignment.id}/edit`)
            }
            onDelete={(assignment) => setDeleteId(assignment.id)}
          />

          <DeleteConfirmationDialog
            open={deleteId !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteId(null);
            }}
            title="Delete Assignment"
            description="Are you sure you want to delete this assignment? This action cannot be undone."
            onConfirm={async () => {
              const assignment = data.find((a) => a.id === deleteId);
              if (assignment) await handleDelete(assignment);
            }}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
