import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide",
  {
    variants: {
      status: {
        verified:
          "border-transparent bg-verified text-verified-foreground",
        invalid: "border-transparent bg-invalid text-invalid-foreground",
        simulated: "border-transparent bg-simulated text-simulated-foreground",
        neutral: "border-border bg-secondary text-secondary-foreground",
      },
    },
    defaultVariants: {
      status: "neutral",
    },
  }
);

function StatusBadge({
  className,
  status = "neutral",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof statusBadgeVariants>) {
  return (
    <span
      data-slot="status-badge"
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    />
  );
}

export { StatusBadge, statusBadgeVariants };