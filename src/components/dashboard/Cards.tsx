"use client";
import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowUpIcon, GroupIcon, InfoIcon, CheckCircleIcon, DollarLineIcon } from "@/icons";
import { apiFetch, getApiBase } from "@/lib/api";

const API_BASE = getApiBase();

type DashboardResponse = {
  totalLiters: number;
  totalCustomers: number;
  deliveredOrders: number;
  pendingOrders: number;
  scheduledOrders: number;
  litersByMonth: Array<{ month: string; totalLiters: number }>;
};

function formatNumber(n?: number | null) {
  if (n === null || n === undefined) return "-";
  try {
    return n.toLocaleString();
  } catch {
    return String(n);
  }
}

export default function CardWrapper() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`${API_BASE}/dashboard`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Failed to load dashboard (${res.status})`);
        const json: DashboardResponse = await res.json();
        if (!isMounted) return;
        setData(json);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.name === "AbortError") return;
          setError(e.message || "Failed to load dashboard");
        } else {
          setError("Failed to load dashboard");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Clients
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {error ? "-" : isLoading ? "…" : formatNumber(data?.totalCustomers)}
            </h4>
          </div>
          <Badge color="warning">
            <ArrowUpIcon />
            5.01%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <DollarLineIcon className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Liters Sold
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {error ? "-" : isLoading ? "…" : formatNumber(data?.totalLiters)}
            </h4>
          </div>

          <Badge color="success">
            <ArrowUpIcon  />
            19.05%
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <InfoIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Pending
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {error ? "-" : isLoading ? "…" : formatNumber(data?.pendingOrders)}
            </h4>
          </div>
          <Badge color="warning">
           Pending orders
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <CheckCircleIcon className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Delivered
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {error ? "-" : isLoading ? "…" : formatNumber(data?.deliveredOrders)}
            </h4>
          </div>

          <Badge color="success">
            Delivered orders
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
      
    </div>
  );
};
