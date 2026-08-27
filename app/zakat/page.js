"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useLocale } from "@/contexts/LocaleContext";

const schema = z.object({
  cash: z.coerce.number().min(0).default(0),
  bank: z.coerce.number().min(0).default(0),
  goldGrams: z.coerce.number().min(0).default(0),
  goldPricePerGram: z.coerce.number().min(0).default(0),
  silverGrams: z.coerce.number().min(0).default(0),
  silverPricePerGram: z.coerce.number().min(0).default(0),
  investments: z.coerce.number().min(0).default(0),
  businessAssets: z.coerce.number().min(0).default(0),
  receivables: z.coerce.number().min(0).default(0),
  debts: z.coerce.number().min(0).default(0),
  nisab: z.enum(["gold", "silver"]).default("gold"),
});

const fields = [
  ["cash", "Cash"],
  ["bank", "Bank"],
  ["goldGrams", "Gold (grams)"],
  ["goldPricePerGram", "Gold price / gram"],
  ["silverGrams", "Silver (grams)"],
  ["silverPricePerGram", "Silver price / gram"],
  ["investments", "Stocks / investments"],
  ["businessAssets", "Business assets"],
  ["receivables", "Receivables"],
  ["debts", "Debts"],
];

export default function ZakatPage() {
  const { t } = useLocale();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nisab: "gold" },
  });
  const calc = useMutation({
    mutationFn: async (values) => (await api.post("/zakat", values)).data.data,
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{t("zakat.title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("zakat.disclaimer")}</p>
      <form className="mt-4 space-y-3" onSubmit={form.handleSubmit((v) => calc.mutate(v))}>
        {fields.map(([name, label]) => (
          <label key={name} className="block text-sm">
            {label}
            <input
              type="number"
              step="0.01"
              className="mt-1 h-12 w-full rounded-2xl border border-border bg-surface px-3"
              {...form.register(name)}
            />
          </label>
        ))}
        <label className="block text-sm">
          {t("zakat.nisab")}
          <Select
            className="mt-1"
            value={form.watch("nisab")}
            onChange={(value) => form.setValue("nisab", value)}
            options={[
              { value: "gold", label: "Gold" },
              { value: "silver", label: "Silver" },
            ]}
            aria-label={t("zakat.nisab")}
          />
        </label>
        <Button type="submit">{t("common.save")}</Button>
      </form>
      {calc.data ? (
        <Card className="mt-4">
          <p className="text-sm text-muted">{t("zakat.due")}</p>
          <p className="text-3xl font-semibold">{calc.data.estimatedZakat}</p>
          <p className="mt-2 text-xs text-muted">{calc.data.disclaimer}</p>
        </Card>
      ) : null}
    </div>
  );
}
