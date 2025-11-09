"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Alert from "@/components/ui/alert/Alert";

/**
 * Displays a flash success alert on the Orders page when redirected
 * from the Create Order page. Reads values from the URL search params:
 * - created=1
 * - orderId=<number>
 * - clientName=<string>
 * After showing the alert, it cleans the URL (removes the params).
 */
export default function OrderSuccessAlert() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  const { created, orderId, clientName } = useMemo(() => {
    return {
      created: searchParams.get("created"),
      orderId: searchParams.get("orderId"),
      clientName: searchParams.get("clientName"),
    };
  }, [searchParams]);

  const message = useMemo(() => {
    if (orderId && clientName) {
      return `Order #${orderId} for Client ${clientName} created successfully.`;
    }
    return "Order created successfully.";
  }, [orderId, clientName]);

  // Show alert when flag present, then clean URL after a short delay
  useEffect(() => {
    if (created === "1") {
      setVisible(true);
    }
  }, [created, router]);

  if (created !== "1" || !visible) return null;

  return (
    <div className="mb-4">
      <Alert variant="success" title="Success" message={message} />
    </div>
  );
}
