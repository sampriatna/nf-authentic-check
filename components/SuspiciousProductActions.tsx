"use client";

import { useTransition } from "react";
import { Trash2, Lock } from "lucide-react";
import { blockSuspiciousProductAction, deleteSuspiciousProductAction } from "@/app/actions";

type SuspiciousProductActionsProps = {
  productId: string;
};

export function SuspiciousProductActions({ productId }: SuspiciousProductActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleBlock = async () => {
    if (!confirm("Block kode ini? Kode tidak akan bisa dicek lagi.")) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("product_id", productId);
      await blockSuspiciousProductAction({} as any, formData);
    });
  };

  const handleDelete = async () => {
    if (!confirm("Hapus kode ini? Tindakan tidak dapat dibatalkan.")) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("product_id", productId);
      await deleteSuspiciousProductAction({} as any, formData);
    });
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleBlock}
        disabled={isPending}
        className="inline-flex items-center gap-1 rounded bg-orange-100 px-2.5 py-1.5 text-xs font-bold text-orange-700 hover:bg-orange-200 disabled:opacity-50"
      >
        <Lock className="h-3.5 w-3.5" />
        Block
      </button>
      <button 
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex items-center gap-1 rounded bg-red-100 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Hapus
      </button>
    </div>
  );
}
