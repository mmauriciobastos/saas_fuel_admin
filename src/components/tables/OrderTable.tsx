"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import Pagination from "./Pagination";

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

interface HydraView {
  "@id": string;
  "@type": string;
  first?: string;
  last?: string;
  next?: string;
  previous?: string;
}

type OrdersHydraResponse =
  | ({
      "@context": string;
      "@id": string;
      "@type": string;
      totalItems: number;
      member: ApiOrder[];
      view?: HydraView;
    } & Record<string, unknown>)
  | ({
      "@context": string;
      "@id": string;
      "@type": string;
      "hydra:totalItems": number;
      "hydra:member": ApiOrder[];
      "hydra:view"?: {
        "@id": string;
        "@type": string;
        "hydra:first"?: string;
        "hydra:last"?: string;
        "hydra:next"?: string;
        "hydra:previous"?: string;
      };
    } & Record<string, unknown>);

function getStatusColor(status: string): "success" | "warning" | "error" {
  const s = status.toLowerCase();
  if (s === "delivered" || s === "complete" || s === "completed") return "success";
  if (s === "pending" || s === "scheduled" || s === "in progress") return "warning";
  return "error"; // cancelled, failed, etc.
}

import { apiFetch, getApiBase } from "@/lib/api";
const API_BASE = getApiBase();

export default function OrderTable() {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchOrders() {
      setIsLoading(true);
      setError(null);
      try {
        const url = `${API_BASE}/orders?page=${page}`;
        const res = await apiFetch(url, {
          method: "GET",
          headers: {
            // Prefer JSON-LD to align with Hydra
            Accept: "application/ld+json, application/json",
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch orders (status ${res.status})`);
        }

        const data: OrdersHydraResponse = await res.json();
        if (!isMounted) return;

        // Support both Hydra and non-prefixed JSON-LD keys
        const members = (data as any).member || (data as any)["hydra:member"] || [];
        const itemsCount =
          (data as any).totalItems ?? (data as any)["hydra:totalItems"] ?? 0;
        const view = (data as any).view || (data as any)["hydra:view"];

        setOrders(members);
        setTotalItems(itemsCount);

        // Determine totalPages
        let pages = 1;
        const lastUrl = view?.last || view?.["hydra:last"];
        if (lastUrl) {
          try {
            const u = new URL(lastUrl, API_BASE);
            const p = u.searchParams.get("page");
            pages = p ? Math.max(1, parseInt(p, 10)) : 1;
          } catch {
            pages = 1;
          }
        } else {
          const perPage = members?.length || 1; // fallback to avoid divide-by-zero
          pages = perPage > 0 ? Math.max(1, Math.ceil(itemsCount / perPage)) : 1;
        }
        setTotalPages(pages);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setError(err?.message || "Failed to load orders");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchOrders();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [page]);

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

              {!isLoading && !error && orders.map((order) => {
                const liters = Number(order.fuelAmount);
                const formattedAmount = isFinite(liters)
                  ? `${liters.toLocaleString()} L`
                  : order.fuelAmount;
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
        <p className="text-theme-xs text-gray-500 dark:text-gray-400">
          Total: {totalItems.toLocaleString()} orders
        </p>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => {
            if (p < 1 || p > totalPages || p === page) return;
            setPage(p);
          }}
        />
      </div>
    </div>
  );
}
