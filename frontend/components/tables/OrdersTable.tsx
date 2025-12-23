"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type Order = {
  id: number;
  device_id: number;
  customer_id: number | null;
  problem_id: number | null;
  cost: string;
  discount: string;
  total_cost: string;
  note: string | null;
  status: string;
  estimated_completion_date: string | null;
  completed_at: string | null;
  created_at: string;
};

type OrdersTableProps = {
  orders: Order[];
};

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>#{order.id}</TableCell>
            <TableCell>
              <Badge variant="outline">{order.status}</Badge>
            </TableCell>
            <TableCell>रु {order.cost}</TableCell>
            <TableCell>रु {order.discount}</TableCell>
            <TableCell>रु {order.total_cost}</TableCell>
            <TableCell className="text-right">
              <Button variant="outline" asChild>
                <Link href={`/technician/orders/${order.id}`}>View</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {orders.length === 0 && <TableCaption>No orders found</TableCaption>}
    </Table>
  );
}

