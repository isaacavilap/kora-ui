"use client";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export const templates: Record<string, ComponentType> = {
  dashboard: dynamic(() => import("./dashboard")),
  orders: dynamic(() => import("./orders")),
  login: dynamic(() => import("./login")),
  "login-split": dynamic(() => import("./login-split")),
  register: dynamic(() => import("./register")),
  "forgot-password": dynamic(() => import("./forgot-password")),
  "reset-password": dynamic(() => import("./reset-password")),
  "verify-email": dynamic(() => import("./verify-email")),
  otp: dynamic(() => import("./otp")),
  "accept-invite": dynamic(() => import("./accept-invite")),
  "error-404": dynamic(() => import("./error-404")),
  "error-403": dynamic(() => import("./error-403")),
  "error-500": dynamic(() => import("./error-500")),
  maintenance: dynamic(() => import("./maintenance")),
  account: dynamic(() => import("./account")),
  members: dynamic(() => import("./members")),
  onboarding: dynamic(() => import("./onboarding")),
};
