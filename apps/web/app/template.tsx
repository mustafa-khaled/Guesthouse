/**
 * A template re-mounts on every navigation, which lets each page settle in with
 * one short rise. Layouts (header, footer, portals) stay mounted, so only the
 * page segment moves.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-settle">{children}</div>;
}
