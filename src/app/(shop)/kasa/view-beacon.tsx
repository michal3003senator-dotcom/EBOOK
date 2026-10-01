"use client";

import { useEffect } from "react";
import { track } from "@/components/tracker";

export function CheckoutViewBeacon() {
  useEffect(() => track("checkout_view"), []);
  return null;
}
