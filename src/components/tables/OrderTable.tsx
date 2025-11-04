import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";

interface Order {
  id: number;
  fuelAmount: string;
  deliveryAddress: string;
  status: string;
}

// Sample table data using the Order interface
const tableData: Order[] = [
  {
    id: 1001,
    fuelAmount: "5,000 L Diesel",
    deliveryAddress: "123 Main St, Springfield",
    status: "Pending",
  },
  {
    id: 1002,
    fuelAmount: "12,500 L Gasoline",
    deliveryAddress: "456 Oak Ave, Riverdale",
    status: "Scheduled",
  },
  {
    id: 1003,
    fuelAmount: "8,000 L Diesel",
    deliveryAddress: "789 Pine Rd, Lakeside",
    status: "Delivered",
  },
  {
    id: 1004,
    fuelAmount: "2,500 L Kerosene",
    deliveryAddress: "22 Industrial Park, Metropolis",
    status: "Cancelled",
  },
  {
    id: 1005,
    fuelAmount: "10,000 L Gasoline",
    deliveryAddress: "77 Harbor Blvd, Bay City",
    status: "Delivered",
  },
];

function getStatusColor(status: string): "success" | "warning" | "error" {
  const s = status.toLowerCase();
  if (s === "delivered" || s === "complete" || s === "completed") return "success";
  if (s === "pending" || s === "scheduled" || s === "in progress") return "warning";
  return "error"; // cancelled, failed, etc.
}

export default function BasicTableOne() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[820px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Order ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Fuel Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Delivery Address
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-800 text-theme-sm dark:text-white/90">
                    #{order.id}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.fuelAmount}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {order.deliveryAddress}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge size="sm" color={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
