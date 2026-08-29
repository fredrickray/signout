"use client";

import dynamic from "next/dynamic";
import type { ShirtViewerProps } from "./ShirtViewer";

const ShirtViewer = dynamic(() => import("./ShirtViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-40 w-40 animate-pulse rounded-[2rem] bg-ink/5" />
    </div>
  ),
});

export default function ShirtViewerLazy(props: ShirtViewerProps) {
  return <ShirtViewer {...props} />;
}
