"use client";
import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Pagination from "./Pagination";
import { useHydraPaginatedResource } from "@/hooks/useHydraPaginatedResource";
// API models for Clients (based on the provided Hydra payload)
interface ApiClient {
  "@id": string;
  "@type": string;
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  stateProvince: string;
  createdAt?: string;
}

export default function ClientTable() {
  const { page, setPage, items: clients, totalItems, totalPages, isLoading, error } =
    useHydraPaginatedResource<ApiClient>({ endpoint: "clients" });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Client
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Address
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Phone
                </TableCell>
                
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {isLoading && (
                <TableRow>
                  <TableCell className="px-5 py-6 text-center text-gray-500 dark:text-gray-400">
                    Loading clients...
                  </TableCell>
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
                </TableRow>
              )}

              {!isLoading && !error && clients.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-6 text-center text-gray-500 dark:text-gray-400">
                    No clients found.
                  </TableCell>
                  <TableCell className="px-4 py-6">{""}</TableCell>
                  <TableCell className="px-4 py-6">{""}</TableCell>
                </TableRow>
              )}

              {!isLoading && !error && clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {/* Placeholder avatar circle with initials */}
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {c.name?.slice(0, 1) || "C"}
                        </span>
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {c.name}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {c.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {c.address}, {c.city}, {c.stateProvince} {c.postalCode}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {c.phone}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer with pagination */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/[0.05]">
        <p className="text-theme-xs text-gray-500 dark:text-gray-400">
          Total: {totalItems.toLocaleString()} clients
        </p>
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
