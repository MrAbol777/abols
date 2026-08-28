import { redirect } from "next/navigation";
import {
  getSessionUser,
  CUSTOMER_SESSION_COOKIE,
  type SessionUser,
} from "./session";

/**
 * Customer authorization helpers for the storefront dashboard. A customer is
 * any active non-ADMIN user (role "CUSTOMER" by default).
 */

export type CustomerUser = SessionUser;

export async function getCurrentCustomer(): Promise<CustomerUser | null> {
  const user = await getSessionUser(CUSTOMER_SESSION_COOKIE);
  if (!user || !user.isActive || user.role === "ADMIN") return null;
  return user;
}

/** Require a signed-in customer; redirect to /login otherwise. */
export async function requireCustomer(): Promise<CustomerUser> {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");
  return customer;
}

/** True only when a customer (not an admin) is currently signed in. */
export async function isCustomerSignedIn(): Promise<boolean> {
  return (await getCurrentCustomer()) !== null;
}