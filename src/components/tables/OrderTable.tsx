"use client";
import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import Pagination from "./Pagination";
import { useHydraPaginatedResource } from "@/hooks/useHydraPaginatedResource";

// API models (based on the Hydra payload shape provided)
interface ApiOrder {
  "@id": string;
  "@type": string;
  id: number;
  fuelAmount: string; // numeric string in payload
  deliveryAddress: string;
  status: string; // e.g. pending | delivered | scheduled
  createdAt?: string;
  deliveredAt?: string;
  notes?: string;
  client?: string; // IRI
  deliveryTruck?: string; // IRI
}

function getStatusColor(status: string): "success" | "warning" | "error" | "primary" {
  const s = status.toLowerCase();
  if (s === "delivered" || s === "complete" || s === "completed") return "success";
  if (s === "scheduled" || s === "in progress") return "primary";
  if (s === "pending") return "warning";
  if (s === "cancelled" || s === "failed") return "error";
  return "error"; // cancelled, failed, etc.
}

function formatCreatedAt(raw?: string): string {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  const DD = String(d.getDate()).padStart(2, "0");
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const YYYY = d.getFullYear();
  const HH = String(d.getHours()).padStart(2, "0");
  const ii = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${DD}/${MM}/${YYYY} ${HH}:${ii}:${ss}`;
}

export default function OrderTable() {
  const { page, setPage, items: orders, totalItems, totalPages, isLoading, error } =
    useHydraPaginatedResource<ApiOrder>({ endpoint: "orders" });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[820px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Order ID
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Fuel Amount
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Delivery Address
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Created
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {isLoading && (
                <TableRow>
                  <TableCell className="px-5 py-6 text-center text-gray-500 dark:text-gray-400">
                    Loading orders...
                  </TableCell>
                  <TableCell className="px-4 py-6">{""}</TableCell>
                  <TableCell className="px-4 py-6">{""}</TableCell>
                  <TableCell className="px-4 py-6">{""}</TableCell>
                </TableRow>
              )}

              {!isLoading && error && (
                <TableRow>
                  <TableCell className="px-5 py-6 text-center text-error-600 dark:text-error-400">
                    {error}
                  </TableCell>
                  <TableCell className="px-4 py-6">{""}</TableCell>
                  <TableCell className="px-4 py-6">{""}</TableCell>
                  <TableCell className="px-4 py-6">{""}</TableCell>
                </TableRow>
              )}

              {!isLoading && !error && orders.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-6 text-center text-gray-500 dark:text-gray-400">
                    No orders found.
                  </TableCell>
                  <TableCell className="px-4 py-6">{""}</TableCell>
                  <TableCell className="px-4 py-6">{""}</TableCell>
                  <TableCell className="px-4 py-6">{""}</TableCell>
                </TableRow>
              )}

              {!isLoading && !error &&
                orders.map((order) => {
                  const liters = Number(order.fuelAmount);
                  const formattedAmount = isFinite(liters) ? `${liters.toLocaleString()} L` : order.fuelAmount;
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start text-gray-800 text-theme-sm dark:text-white/90">
                        #{order.id}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formattedAmount}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {order.deliveryAddress}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formatCreatedAt(order.createdAt)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge size="sm" color={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer with pagination */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/[0.05]">
        <p className="text-theme-xs text-gray-500 dark:text-gray-400">Total: {totalItems.toLocaleString()} orders</p>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => {
            if (p < 1) return;
            const clamped = Math.min(p, totalPages);
            if (clamped === page) return;
            setPage(clamped);
          }}
        />
      </div>
    </div>
  );
}
