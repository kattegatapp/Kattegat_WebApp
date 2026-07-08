"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type QueueItem = {
  item: string;
  type: string;
  status: "Ready" | "Review" | "Blocked";
};

const queue: QueueItem[] = [
  { item: "Seller verification", type: "Identity", status: "Review" },
  { item: "White Glove lead", type: "Concierge", status: "Ready" },
  { item: "Requirement post", type: "Moderation", status: "Blocked" },
];

const columns: ColumnDef<QueueItem>[] = [
  { accessorKey: "item", header: "Queue" },
  { accessorKey: "type", header: "Type" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge>{row.original.status}</Badge>,
  },
];

const launchData = [
  { day: "Mon", waitlist: 24 },
  { day: "Tue", waitlist: 38 },
  { day: "Wed", waitlist: 57 },
  { day: "Thu", waitlist: 81 },
  { day: "Fri", waitlist: 116 },
];

export function AdminInsightPreview() {
  // TanStack Table intentionally returns callable table helpers; React Compiler skips this hook safely.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: queue,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <Card className="glass-panel transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-forest/10">
        <CardHeader>
          <CardTitle>Launch pulse</CardTitle>
          <CardDescription>Waitlist growth preview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={launchData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="waitlist"
                  stroke="#003912"
                  fill="#6fdb42"
                  fillOpacity={0.28}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-forest/10">
        <CardHeader>
          <CardTitle>Operations queue</CardTitle>
          <CardDescription>Table foundation for the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-3 py-2 font-semibold">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
