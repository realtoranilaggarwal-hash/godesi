"use client";

import { useEffect } from "react";

const WIDGET_URL = "https://widget.careerjet.net/search-box/020fa91ecf92e560925b199b466c0e07";
const SCRIPT_ID = "cj-search-box";

/** Careerjet's job search widget; the script is re-added on every mount so it finds the box after client navigation. */
export function CareerjetSearchBox() {
  useEffect(() => {
    document.getElementById(SCRIPT_ID)?.remove();
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://static.careerjet.org/js/all_widget_search_box_3rd_party.min.js?t=${Date.now()}`;
    document.body.appendChild(script);
  }, []);

  return <div className="cj-search-box" data-url={WIDGET_URL} />;
}
