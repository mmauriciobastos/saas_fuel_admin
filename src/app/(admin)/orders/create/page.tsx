"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
 
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getApiBase } from "@/lib/api";

 

// API base (same approach used in tables)
const API_BASE = getApiBase();

// Client model (subset used in the form)
interface ApiClient {
  "@id": string;
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  stateProvince: string;
}

type ClientsHydraResponse =
  | {
      "@context": string;
      "@id": string;
      "@type": string;
      totalItems: number;
      member: ApiClient[];
      view?: any;
    }
  | {
      "@context": string;
      "@id": string;
      "@type": string;
      "hydra:totalItems": number;
      "hydra:member": ApiClient[];
      "hydra:view"?: any;
    };

export default function NewOrderPage() {
  const router = useRouter();

  // Form state
  const [clientId, setClientId] = useState<string>("");
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [fuelAmount, setFuelAmount] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch clients for the combobox (first page)
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    (async () => {
      try {
        setIsLoadingClients(true);
        const res = await apiFetch(`${API_BASE}/clients?page=1`, {
          headers: {
            Accept: "application/ld+json, application/json",
          },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Failed to load clients (${res.status})`);
        const data: ClientsHydraResponse = await res.json();
        if (!isMounted) return;
        const members = (data as any).member || (data as any)["hydra:member"] || [];
        setClients(members);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error(e);
        }
      } finally {
        if (isMounted) setIsLoadingClients(false);
      }
    })();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // When client changes, auto-fill address
  useEffect(() => {
    if (!clientId) return;
    const idNum = parseInt(clientId, 10);
    const c = clients.find((cl) => cl.id === idNum);
    if (c) {
      const addr = `${c.address}, ${c.city} ${c.stateProvince} ${c.postalCode}`;
      setDeliveryAddress(addr.slice(0, 255));
    }
  }, [clientId, clients]);

  const clientOptions = useMemo(
    () =>
      clients.map((c) => ({
        value: String(c.id),
        label: `${c.name} • ${c.email}`,
      })),
    [clients]
  );

  // Simple validation
  const validate = () => {
    if (!clientId) return "Please select a client.";
    const val = Number(fuelAmount);
    if (!fuelAmount || isNaN(val) || val <= 0) return "Please enter a valid fuel amount (L).";
    if (!deliveryAddress || deliveryAddress.length > 255) return "Delivery address is required and must be at most 255 characters.";
    if (notes.length > 500) return "Notes must be at most 500 characters.";
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    try {
      setSubmitting(true);
      const idNum = parseInt(clientId, 10);
      const clientIri = `/api/clients/${idNum}`;
      const payload = {
        client: clientIri,
        fuelAmount: String(Number(fuelAmount)),
        deliveryAddress,
        status: "scheduled",
        notes: notes || undefined,
      };

      const res = await apiFetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
          Accept: "application/ld+json, application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = `Failed to create order (${res.status})`;
        throw new Error(msg);
      }

      setSuccess("Order created successfully. Redirecting to Orders...");
      setTimeout(() => router.push("/orders"), 900);
    } catch (e: any) {
      setError(e?.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="New Order" />
      <ComponentCard title="Create New Order">
        {error && (
          <div className="mb-4 rounded-lg border border-error-300 bg-error-50 px-4 py-3 text-error-700 dark:border-error-700/50 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-success-300 bg-success-50 px-4 py-3 text-success-700 dark:border-success-700/50 dark:bg-success-500/10 dark:text-success-400">
            {success}
          </div>
        )}

        <Form
          onSubmit={() => {
            if (!submitting) handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Client */}
          <div>
            <Label>Client <span className="text-error-500">*</span></Label>
            <Select
              options={clientOptions}
              placeholder={isLoadingClients ? "Loading clients..." : "Select a client"}
              onChange={setClientId}
              className="mt-1"
            />
          </div>

          {/* Fuel Amount */}
          <div>
            <Label>Fuel Amount (L) <span className="text-error-500">*</span></Label>
            <Input
              type="number"
              step={0.01 as any}
              placeholder="e.g. 400.52"
              value={fuelAmount}
              onChange={(e) => setFuelAmount(e.target.value)}
            />
          </div>

          {/* Delivery Address */}
          <div>
            <Label>Delivery Address <span className="text-error-500">*</span></Label>
            <Input
              type="text"
              placeholder="Street, City ST ZIP"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value.slice(0, 255))}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Max 255 characters</p>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <TextArea
              rows={4}
              value={notes}
              onChange={(v) => setNotes(v.slice(0, 500))}
              placeholder="Optional notes (max 500 chars)"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Max 500 characters</p>
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Order"}
            </button>
          </div>
        </Form>
      </ComponentCard>
    </div>
  );
}
