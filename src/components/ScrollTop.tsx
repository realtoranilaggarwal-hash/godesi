"use client";

import { useEffect } from "react";

/** Forces the page to open at the top — iOS Safari can keep the previous
 *  page's deep scroll position after client-side navigation. */
export function ScrollTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}
