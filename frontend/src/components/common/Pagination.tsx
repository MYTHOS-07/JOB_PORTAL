"use client";

import NextLink from "next/link";
import { Link as TransitionLink } from "next-view-transitions";
import type { PaginationMeta } from "@/types/api";

export function Pagination({
  meta,
  onPage,
  previousHref,
  nextHref,
  smooth = false,
}: {
  meta?: PaginationMeta;
  onPage?: (page: number) => void;
  previousHref?: string;
  nextHref?: string;
  smooth?: boolean;
}) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-6 text-sm text-muted">
      <span>
        Page {meta.currentPage} of {meta.totalPages}
      </span>
      <div className="flex gap-2">
        <PageControl
          disabled={!meta.hasPreviousPage}
          href={meta.hasPreviousPage ? previousHref : undefined}
          onClick={onPage && meta.hasPreviousPage ? () => onPage(meta.currentPage - 1) : undefined}
          smooth={smooth}
        >
          Previous
        </PageControl>
        <PageControl
          disabled={!meta.hasNextPage}
          href={meta.hasNextPage ? nextHref : undefined}
          onClick={onPage && meta.hasNextPage ? () => onPage(meta.currentPage + 1) : undefined}
          smooth={smooth}
        >
          Next
        </PageControl>
      </div>
    </div>
  );
}

function PageControl({
  href,
  onClick,
  disabled,
  children,
  smooth,
}: {
  href?: string;
  onClick?: () => void;
  disabled: boolean;
  children: React.ReactNode;
  smooth?: boolean;
}) {
  const className = "rounded-lg border border-line px-3 py-1.5 disabled:opacity-40";
  if (href && !disabled) {
    const Link = smooth ? TransitionLink : NextLink;
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={className}>
      {children}
    </button>
  );
}
