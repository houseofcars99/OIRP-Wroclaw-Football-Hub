import AccessForm from "@/components/AccessForm";
import PageHeader from "@/components/PageHeader";
import { accessConfig, isAccessArea } from "@/lib/accessGate";

export default async function AccessPage({ searchParams }: { searchParams: Promise<{ area?: string; next?: string }> }) {
  const params = await searchParams; const area = isAccessArea(params.area) ? params.area : "player";
  const nextPath = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/";
  return <main className="lineupShell"><PageHeader eyebrow="STREFA CHRONIONA" title={accessConfig[area].label} /><p className="accessLead">Podaj hasło udostępnione członkom zespołu.</p><AccessForm area={area} label={accessConfig[area].label} nextPath={nextPath} /></main>;
}
