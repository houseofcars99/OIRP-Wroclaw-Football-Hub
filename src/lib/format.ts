export function formatDateTime(value:string){return new Intl.DateTimeFormat("pl-PL",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",timeZone:"Europe/Warsaw"}).format(new Date(value)).replace(",", " ·")}
export function initials(first?:string|null,last?:string|null){return `${first?.[0]??""}${last?.[0]??""}`.toUpperCase()||"?"}
