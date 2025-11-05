"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import Pagination from "./Pagination";

// API models for Delivery Trucks (based on provided payload)
interface ApiTruck {
  "@id": string;
  "@type": string;
  id: number;
  licensePlate: string;
  model: string;
  driverName: string;
  currentFuelLevel: number;
  status: string; // e.g. available | maintenance | in_transit
  createdAt?: string;
}

type TrucksHydraResponse =
  | ({
      "@context": string;
      "@id": string;
      "@type": string;
      totalItems: number;
      member: ApiTruck[];
      view?: {
        "@id": string;
        "@type": string;
        first?: string;
        last?: string;
        next?: string;
        previous?: string;
      };
    } & Record<string, unknown>)
  | ({
      "@context": string;
      "@id": string;
      "@type": string;
      "hydra:totalItems": number;
      "hydra:member": ApiTruck[];
      "hydra:view"?: {
        "@id": string;
        "@type": string;
        "hydra:first"?: string;
        "hydra:last"?: string;
        "hydra:next"?: string;
        "hydra:previous"?: string;
      };
    } & Record<string, unknown>);

function getStatusColor(
  status: string
): "success" | "warning" | "error" {
  const s = status?.toLowerCase?.() || "";
  if (s === "available" || s === "active") return "success";
  if (s.includes("transit") || s.includes("delivery") || s === "in_service")
    return "warning";
  return "error"; // maintenance, offline, etc.
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export default function TruckTable() {
  const [page, setPage] = useState(1);
  const [trucks, setTrucks] = useState<ApiTruck[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchTrucks() {
      setIsLoading(true);
      setError(null);
      try {
        const url = `${API_BASE}/delivery_trucks?page=${page}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/ld+json, application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch trucks (status ${res.status})`);
        }

        const data: TrucksHydraResponse = await res.json();
        if (!isMounted) return;

        const members = (data as any).member || (data as any)["hydra:member"] || [];
        const itemsCount =
          (data as any).totalItems ?? (data as any)["hydra:totalItems"] ?? 0;
        const view = (data as any).view || (data as any)["hydra:view"];

        setTrucks(members);
        setTotalItems(itemsCount);

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
          const perPage = members?.length || 1;
          pages = perPage > 0 ? Math.max(1, Math.ceil(itemsCount / perPage)) : 1;
        }
        setTotalPages(pages);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setError(err?.message || "Failed to load trucks");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchTrucks();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [page, token]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[980px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Truck
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Driver
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Fuel Level
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
                    Loading trucks...
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

              {!isLoading && !error && trucks.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-6 text-center text-gray-500 dark:text-gray-400">
                    No trucks found.
                  </TableCell>
                  <TableCell className="px-4 py-6">{""}</TableCell>
                  <TableCell className="px-4 py-6">{""}</TableCell>
                  <TableCell className="px-4 py-6">{""}</TableCell>
                </TableRow>
              )}

              {!isLoading && !error &&
                trucks.map((t) => {
                  const liters = Number(t.currentFuelLevel);
                  const formattedFuel = isFinite(liters)
                    ? `${liters.toLocaleString()} L`
                    : String(t.currentFuelLevel ?? "-");
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {t.licensePlate?.toUpperCase()}
                            </span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                              {t.model}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {t.driverName}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {formattedFuel}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge size="sm" color={getStatusColor(t.status)}>
                          {t.status}
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
          Total: {totalItems.toLocaleString()} trucks
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
