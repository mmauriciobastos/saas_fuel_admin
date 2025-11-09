import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrderTable from "@/components/tables/OrderTable";
import { Metadata } from "next";
import React from "react";
import OrderSuccessAlert from "@/components/orders/OrderSuccessAlert";

export const metadata: Metadata = {
  title: "Orders Table",
  description:
    "This is the Orders Table page. It contains a list of all orders.",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Orders" />
      <div className="space-y-6">
        {/* Flash success message when redirected from Create Order */}
        <OrderSuccessAlert />
        <ComponentCard title="Orders Table">
          <OrderTable />
        </ComponentCard>
      </div>
    </div>
  );
}
