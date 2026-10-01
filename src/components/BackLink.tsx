import Link from "next/link";

export default function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-base font-medium text-ink/70 transition-colors active:bg-ink/10"
    >
      <span aria-hidden="true">←</span>
      {label}
    </Link>
  );
}
