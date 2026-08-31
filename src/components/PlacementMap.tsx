import type { AdRegion } from "@/lib/ads";

const BLOCK = "rounded bg-slate-200";
const LIVE = "rounded bg-indigo-600 text-white";

function Spot({
  on,
  className,
  children,
}: {
  on: boolean;
  className: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center justify-center text-center text-[9px] font-bold leading-tight ${
        on ? LIVE : BLOCK
      } ${className}`}
    >
      {on ? "YOUR BANNER" : children}
    </div>
  );
}

/**
 * A wireframe of a Godesi page with the placement lit up, so an advertiser can
 * see where the spot they are buying actually sits before paying for it.
 */
export function PlacementMap({ region }: { region: AdRegion }) {
  if (region === "phone") {
    return (
      <div className="mx-auto w-40 rounded-2xl border-4 border-slate-300 bg-white p-1.5">
        <div className="mb-1 h-2 rounded bg-slate-300" />
        <div className="space-y-1">
          <div className={`${BLOCK} h-8`} />
          <Spot on className="h-6" />
          <div className={`${BLOCK} h-8`} />
          <div className={`${BLOCK} h-8`} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-2">
      <Spot on={region === "header"} className="h-5">
        HEADER
      </Spot>

      {region === "hero" ? (
        <Spot on className="mt-1.5 h-10" />
      ) : (
        <div className={`${BLOCK} mt-1.5 h-10`} />
      )}

      <div className="mt-1.5 flex gap-1.5">
        <div className="flex-1 space-y-1.5">
          {region === "top" ? (
            <Spot on className="h-8" />
          ) : (
            <div className={`${BLOCK} h-4`} />
          )}
          <div className={`${BLOCK} h-10`} />
          {region === "incontent" ? (
            <Spot on className="h-6" />
          ) : (
            <div className={`${BLOCK} h-10`} />
          )}
          <div className={`${BLOCK} h-10`} />
        </div>
        <div className="w-1/4 space-y-1.5">
          {region === "rail" ? (
            <Spot on className="h-16" />
          ) : (
            <div className={`${BLOCK} h-16`} />
          )}
          <div className={`${BLOCK} h-10`} />
        </div>
      </div>

      <div className={`${BLOCK} mt-1.5 h-4`} />
    </div>
  );
}
