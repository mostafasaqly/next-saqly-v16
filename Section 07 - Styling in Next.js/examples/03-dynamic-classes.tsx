// app/components/Badge.tsx
import clsx from "clsx";

export default function Badge({ status }: { status: "active" | "inactive" }) {
  return (
    <span
      className={clsx("badge", {
        "badge--active": status === "active",
        "badge--inactive": status === "inactive",
      })}
    >
      {status}
    </span>
  );
}
