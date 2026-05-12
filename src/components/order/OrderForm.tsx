"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useAppStore } from "@/store/useAppStore";
import { ShippingAddress } from "@/types";

const COUNTRY_OPTIONS = [
  { label: "India", value: "IN" },
  { label: "United States", value: "US" },
  { label: "United Kingdom", value: "GB" },
  { label: "Australia", value: "AU" },
  { label: "Canada", value: "CA" },
  { label: "Germany", value: "DE" },
  { label: "France", value: "FR" },
  { label: "United Arab Emirates", value: "AE" },
  { label: "Singapore", value: "SG" },
];

export function OrderForm() {
  const { setStep } = useAppStore();
  const { initiatePayment, isProcessing, paymentError } = useRazorpay();

  const [form, setForm] = useState<ShippingAddress>({
    first_name: "Manan",
    last_name: "Aggrawal",
    address1: "Hill Ridge, Saki Vihar",
    address2: "Powai",
    phone: "+919876543210",
    email: "manan.aggrawal@vegapay.tech",
    city: "Mumbai",
    zip: "400072",
    province: "Maharashtra",
    country_code: "IN",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.first_name.trim()) e.first_name = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!form.address1.trim()) e.address1 = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.zip.trim()) e.zip = "Required";
    if (!form.province.trim()) e.province = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    initiatePayment(form);
  };

  const field = (key: keyof ShippingAddress) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
    error: errors[key],
  });

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold text-gray-100">Shipping Details</h2>

      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name *" placeholder="John" {...field("first_name")} />
        <Input label="Last Name" placeholder="Doe" {...field("last_name")} />
      </div>

      <Input label="Email *" type="email" placeholder="john@example.com" {...field("email")} />
      <Input label="Phone *" type="tel" placeholder="+91 98765 43210" {...field("phone")} />
      <Input label="Address Line 1 *" placeholder="123 Main Street" {...field("address1")} />
      <Input label="Address Line 2" placeholder="Apt 4B (optional)" {...field("address2")} />

      <div className="grid grid-cols-2 gap-4">
        <Input label="City *" placeholder="Mumbai" {...field("city")} />
        <Input label="ZIP / PIN *" placeholder="400001" {...field("zip")} />
      </div>

      <Input label="State / Province *" placeholder="Maharashtra" {...field("province")} />

      <Select
        label="Country"
        value={form.country_code}
        onChange={(e) => setForm((f) => ({ ...f, country_code: e.target.value }))}
        options={COUNTRY_OPTIONS}
      />

      {paymentError && (
        <div className="px-4 py-3 bg-red-900/50 border border-red-700 rounded-lg text-sm text-red-300">
          {paymentError}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={() => setStep("design")} disabled={isProcessing}>
          ← Back to Design
        </Button>
        <Button size="lg" onClick={handleSubmit} loading={isProcessing} className="flex-1">
          {isProcessing ? "Placing Order…" : "Place Order →"}
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Secure payment via Razorpay. Order fulfilled by Qikink Print on Demand.
      </p>
    </div>
  );
}
