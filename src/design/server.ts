import { cookies } from "next/headers";

import { DEFAULT_DESIGN, DESIGN_COOKIE, isDesign, type Design } from "./config";

/**
 * Which design direction to render.
 *
 * Reading a cookie opts routes out of static prerendering, which is the price
 * of letting the client flip between directions on the same URLs. Fine for a
 * review build; when a direction is picked, delete this and the pages go back
 * to being fully static.
 */
export async function getDesign(): Promise<Design> {
  const store = await cookies();
  const value = store.get(DESIGN_COOKIE)?.value;
  return isDesign(value) ? value : DEFAULT_DESIGN;
}
