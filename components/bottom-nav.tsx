"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, Utensils, Dumbbell, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Peso", icon: Scale },
  { href: "/cibo", label: "Cibo", icon: Utensils },
  { href: "/allenamento", label: "Allenamento", icon: Dumbbell },
  { href: "/ai", label: "AI", icon: Sparkles },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigazione principale"
      className="sticky bottom-0 z-20 border-t border-ligne bg-surface/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-fib1 py-fib2 text-xs transition-colors",
                  active ? "text-rouge" : "text-encre-2 hover:text-encre"
                )}
              >
                <Icon
                  className="size-5"
                  strokeWidth={active ? 2.4 : 1.8}
                  aria-hidden
                />
                <span className={cn(active && "font-medium")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
