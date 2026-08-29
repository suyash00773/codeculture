import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pravaah/head";
import { DEMO_USERS } from "@/lib/pravaah/demo-data";
import { DemoBanner, PageHeader, Panel } from "@/components/pravaah/primitives";

export const Route = createFileRoute("/admin/users")({
  head: pageHead(
    "Users & Roles",
    "Role matrix for administrators, district authorities, response teams, analysts and citizens.",
  ),
  component: UsersPage,
});

const PERMISSIONS = [
  { area: "Dashboard & maps", ADMIN: "Full", AUTHORITY: "Full", RESPONSE_TEAM: "Full", ANALYST: "Full", CITIZEN: "Own area" },
  { area: "Issue alerts", ADMIN: "Yes", AUTHORITY: "Yes", RESPONSE_TEAM: "No", ANALYST: "Draft only", CITIZEN: "No" },
  { area: "Update incidents", ADMIN: "Yes", AUTHORITY: "Yes", RESPONSE_TEAM: "Yes", ANALYST: "No", CITIZEN: "Report only" },
  { area: "Run simulations", ADMIN: "Yes", AUTHORITY: "Yes", RESPONSE_TEAM: "No", ANALYST: "Yes", CITIZEN: "No" },
  { area: "Tune model weights", ADMIN: "Yes", AUTHORITY: "No", RESPONSE_TEAM: "No", ANALYST: "Yes", CITIZEN: "No" },
  { area: "Manage users", ADMIN: "Yes", AUTHORITY: "No", RESPONSE_TEAM: "No", ANALYST: "No", CITIZEN: "No" },
];

const ROLES = ["ADMIN", "AUTHORITY", "RESPONSE_TEAM", "ANALYST", "CITIZEN"] as const;

function UsersPage() {
  return (
    <>
      <PageHeader
        title="Users & Roles"
        subtitle="Role-based access model. In this prototype, roles shape the intended UI surface; they are not enforced by a server-side auth layer yet."
      />
      <DemoBanner text="Demo accounts share the password shown below. Do not reuse this pattern in a real deployment." />

      <Panel title="Demo accounts">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Name", "Email", "Role", "Password"].map((h) => (
                  <th key={h} className="label-mono py-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEMO_USERS.map((u) => (
                <tr key={u.email} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-4 font-medium">{u.name}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{u.email}</td>
                  <td className="py-2 pr-4">{u.role}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{u.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Permission matrix">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="label-mono py-2 pr-4">Capability</th>
                {ROLES.map((r) => (
                  <th key={r} className="label-mono py-2 pr-4">{r.replace("_", " ")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.area} className="border-b border-border/60 last:border-0">
                  <td className="py-2 pr-4 font-medium">{p.area}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="py-2 pr-4 text-muted-foreground">{p[r]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
