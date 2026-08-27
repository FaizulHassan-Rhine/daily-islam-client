"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function HadithCollectionPage() {
  const { collection } = useParams();
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["hadith-list", collection, page],
    queryFn: async () => (await api.get(`/hadith/${collection}`, { params: { page, limit: 15 } })).data.data,
  });
  if (query.isLoading) return <ListSkeleton />;
  const data = query.data;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{data?.collection?.name}</h1>
      <ul className="mt-4 space-y-3">
        {(data?.items || []).map((h) => (
          <li key={h.hadithNumber}>
            <Link href={`/hadith/${collection}/${h.hadithNumber}`}>
              <Card>
                <p className="text-xs text-muted">#{h.hadithNumber}</p>
                {h.text?.ar ? <p className="arabic-text mt-2 text-lg">{h.text.ar}</p> : null}
                <p className="mt-2 line-clamp-4 text-sm">{h.text?.en}</p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between">
        <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <Button variant="secondary" disabled={(data?.items || []).length < 15} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
