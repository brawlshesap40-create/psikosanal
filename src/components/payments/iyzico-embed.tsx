"use client";

import { useEffect, useRef } from "react";

export function IyzicoEmbed({ checkoutFormContent }: { checkoutFormContent: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(checkoutFormContent, "text/html");
    const nodes = Array.from(doc.body.childNodes);

    for (const node of nodes) {
      if (node.nodeName === "SCRIPT") {
        const original = node as HTMLScriptElement;
        const script = document.createElement("script");
        for (const attr of Array.from(original.attributes)) {
          script.setAttribute(attr.name, attr.value);
        }
        script.text = original.textContent ?? "";
        container.appendChild(script);
      } else {
        container.appendChild(node.cloneNode(true));
      }
    }
  }, [checkoutFormContent]);

  return <div ref={containerRef} className="min-h-[500px] w-full" />;
}
