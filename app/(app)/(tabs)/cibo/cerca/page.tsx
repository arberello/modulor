import type { Metadata } from "next";
import { FoodSearch } from "@/components/cibo/food-search";

export const metadata: Metadata = { title: "Aggiungi alimento" };

export default function CercaPage() {
  return (
    <div className="flex flex-col gap-fib4 p-fib4">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Aggiungi alimento
      </h1>
      <FoodSearch />
    </div>
  );
}
