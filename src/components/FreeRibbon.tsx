/** Diagonal "FREE" sash across the top-right corner of a relative, overflow-hidden box. */
export function FreeRibbon({ large = false }: { large?: boolean }) {
  return (
    <span
      className={`pointer-events-none absolute z-10 rotate-45 bg-red-600 text-center font-black uppercase tracking-widest text-white shadow-md ${
        large
          ? "-right-11 top-6 w-44 py-1.5 text-base"
          : "-right-9 top-4 w-32 py-0.5 text-xs"
      }`}
    >
      Free
    </span>
  );
}
