"use server";

import { redirect } from "next/navigation";

import { isLocale, type Locale } from "@/i18n/config";
import {
  createCustomer,
  currentCustomer,
  endSession,
  findCustomerByEmail,
  setCustomerPassword,
  startSession,
  updateCustomer,
  verifyPassword,
} from "@/lib/customers";
import { isGovernorate } from "@/lib/orders/types";
import { routes } from "@/lib/routes";

export type AccountState = {
  status?: "saved" | "passwordChanged" | "failed";
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
  attempt?: number;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

function read(formData: FormData, keys: readonly string[]) {
  return Object.fromEntries(
    keys.map((k) => [k, String(formData.get(k) ?? "").trim()]),
  );
}

function localeOf(formData: FormData): Locale {
  const raw = String(formData.get("lang") ?? "en");
  return isLocale(raw) ? raw : "en";
}

/** Where to go after signing in: a same-site path only, never an external URL. */
function nextPath(formData: FormData, locale: Locale): string {
  const next = String(formData.get("next") ?? "");
  return next.startsWith("/") && !next.startsWith("//")
    ? next
    : routes.account(locale);
}

export async function signUp(
  prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const locale = localeOf(formData);
  const values = read(formData, ["name", "email"]);
  const password = String(formData.get("password") ?? "");
  const attempt = (prev.attempt ?? 0) + 1;

  const fieldErrors: Record<string, string> = {};
  if (!values.name) fieldErrors.name = "required";
  if (!values.email) fieldErrors.email = "required";
  else if (!EMAIL.test(values.email)) fieldErrors.email = "invalidEmail";
  if (password.length < MIN_PASSWORD) fieldErrors.password = "weakPassword";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values, attempt };

  if (await findCustomerByEmail(values.email)) {
    return { fieldErrors: { email: "emailTaken" }, values, attempt };
  }

  try {
    const customer = await createCustomer({
      email: values.email,
      password,
      name: values.name,
      locale,
    });
    await startSession(customer.id);
  } catch (error) {
    console.error("sign-up failed", error);
    return { status: "failed", values, attempt };
  }
  redirect(nextPath(formData, locale));
}

export async function signIn(
  prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const locale = localeOf(formData);
  const values = read(formData, ["email"]);
  const password = String(formData.get("password") ?? "");
  const attempt = (prev.attempt ?? 0) + 1;

  const fieldErrors: Record<string, string> = {};
  if (!values.email) fieldErrors.email = "required";
  if (!password) fieldErrors.password = "required";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values, attempt };

  const customer = await findCustomerByEmail(values.email);
  // Same answer whether the email or the password is wrong: saying which
  // would let anyone test whether an address has an account.
  if (!customer || !(await verifyPassword(password, customer.passwordHash))) {
    return { fieldErrors: { password: "wrongCredentials" }, values, attempt };
  }

  await startSession(customer.id);
  if (customer.locale !== locale) await updateCustomer(customer.id, { locale });
  redirect(nextPath(formData, locale));
}

export async function signOut(formData: FormData): Promise<void> {
  const locale = localeOf(formData);
  await endSession();
  redirect(routes.home(locale));
}

export async function saveProfile(
  prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const customer = await currentCustomer();
  if (!customer) redirect(routes.signIn(localeOf(formData)));

  const values = read(formData, [
    "name",
    "phone",
    "governorate",
    "area",
    "block",
    "street",
    "building",
    "extra",
  ]);
  const attempt = (prev.attempt ?? 0) + 1;
  const fieldErrors: Record<string, string> = {};
  if (!values.name) fieldErrors.name = "required";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values, attempt };

  // An address is saved only when it is usable: all four required parts.
  const complete =
    isGovernorate(values.governorate) &&
    values.area &&
    values.block &&
    values.street &&
    values.building;

  await updateCustomer(customer.id, {
    name: values.name.slice(0, 80),
    phone: values.phone.slice(0, 40),
    address: complete
      ? {
          governorate: values.governorate as never,
          area: values.area,
          block: values.block,
          street: values.street,
          building: values.building,
          extra: values.extra,
        }
      : null,
  });
  // Echo the values with the success too: the form remounts per attempt,
  // and the page's own props still hold what was loaded before the save.
  return { status: "saved", values, attempt };
}

export async function changePassword(
  prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const customer = await currentCustomer();
  if (!customer) redirect(routes.signIn(localeOf(formData)));

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const attempt = (prev.attempt ?? 0) + 1;
  const fieldErrors: Record<string, string> = {};
  if (!(await verifyPassword(current, customer.passwordHash)))
    fieldErrors.currentPassword = "wrongPassword";
  if (next.length < MIN_PASSWORD) fieldErrors.newPassword = "weakPassword";
  if (Object.keys(fieldErrors).length) return { fieldErrors, attempt };

  await setCustomerPassword(customer.id, next);
  await startSession(customer.id);
  return { status: "passwordChanged", attempt };
}
