import Link from "next/link";

export default function PageHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <header className="lineupHeader"><Link href="/" className="back">←</Link><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div></header>;
}
