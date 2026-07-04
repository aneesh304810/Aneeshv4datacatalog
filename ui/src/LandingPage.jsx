import React, { useState, useEffect } from "react";
import { SectionHeader } from "./AppShell.jsx";
import { api } from "./api.js";

const MODULES = [
  { key: "interface", label: "Interface 360", color: "modInterface", glyph: "\u{1F517}",
    desc: "System-to-system integration map across all projects." },
  { key: "api", label: "API 360", color: "modApi", glyph: "\u25C6",
    desc: "API explorer, SEI SWP domains and Non-SEI vendors." },
  { key: "data", label: "Data 360", color: "modData", glyph: "\u25C8",
    desc: "Lineage and feed dictionary, column-level." },
  { key: "datapoint", label: "Datapoint 360", color: "modDatapoint", glyph: "\u25C7",
    desc: "Cross-cutting datapoint index with provenance." },
];

export default function LandingPage({ t, onNav }) {
  const [cats, setCats] = useState(null);
  const [ifStats, setIfStats] = useState(null);
  const [pii, setPii] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.projectCategories().then(setCats).catch(() => {});
    api.interfaceStats().then(setIfStats).catch(() => {});
    api.piiStats().then(setPii).catch(() => {});
    api.projectLanding().then((r) => setProjects(r.projects || [])).catch(() => {});
  }, []);

  const kpi = (n, l, tone) => (
    <div style={{ background: t.panel, border: `1px solid ${t.disabled}`,
      borderRadius: t.radius.md, padding: "15px 20px", minWidth: 120 }}>
      <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1,
        color: tone === "danger" ? t.danger : tone === "warn" ? t.warning : t.navy }}>{n}</div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: 0.5, color: t.textMuted, marginTop: 4 }}>{l}</div>
    </div>
  );

  return (
    <div>
      <SectionHeader t={t}>CP Metadata Catalog</SectionHeader>

      <div style={{ display: "flex", gap: 15, marginBottom: 30, flexWrap: "wrap" }}>
        {kpi(ifStats?.total_interfaces ?? "\u2014", "Interfaces")}
        {kpi(ifStats?.total_systems ?? "\u2014", "Systems")}
        {kpi(pii?.attributes ?? "\u2014", "PII Attributes")}
        {kpi(pii?.affected_fields ?? "\u2014", "Carry PII", "danger")}
        {kpi(ifStats?.cross_project ?? "\u2014", "SEI \u2194 Non-SEI", "warn")}
      </div>

      {/* PROJECTS — the parent of all feeds/loaders/pipelines */}
      <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: 0.5, color: t.textMuted, margin: "0 0 12px" }}>Projects</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16, marginBottom: 30 }}>
        {projects.map((p) => (
          <div key={p.project_id} onClick={() => onNav("data")}
            style={{ background: t.panel, border: `1px solid ${t.disabled}`,
              borderTop: `4px solid ${p.color_hex || t.navy}`, borderRadius: t.radius.md,
              padding: 18, cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: t.navy }}>{p.display_name}</span>
              <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, color: "#fff",
                background: p.category === "SEI" ? (p.color_hex || "#0091bf") : "#5a6472",
                padding: "2px 7px", borderRadius: 3 }}>{p.category}</span>
            </div>
            <div style={{ fontSize: 12, color: t.textMuted, margin: "4px 0 12px" }}>{p.description}</div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {[["inbound_feeds", "Inbound Feeds"], ["loaders", "Loaders"],
                ["dbt_models", "dbt Models"], ["apis", "APIs"], ["interfaces", "Interfaces"]].map(([k, lbl]) => (
                <div key={k}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: t.navy }}>{p.counts?.[k] ?? 0}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    color: t.textMuted }}>{lbl}</div>
                </div>))}
            </div>
            {p.sources?.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${t.bg}`,
                fontSize: 11, color: t.textMuted }}>
                Sources: {p.sources.map((s) => s.source_label).join(" · ")}</div>)}
          </div>))}
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: 0.5, color: t.textMuted, margin: "0 0 12px" }}>Modules</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 30 }}>
        {MODULES.map((m) => (
          <div key={m.key} onClick={() => onNav(m.key)}
            style={{ background: t.panel, border: `1px solid ${t.disabled}`,
              borderRadius: t.radius.md, padding: 20, cursor: "pointer",
              transition: t.transition }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.hover;
              e.currentTarget.style.boxShadow = t.shadow.sm; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.disabled;
              e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ width: 40, height: 40, borderRadius: t.radius.md,
              background: t[m.color], display: "grid", placeItems: "center",
              color: "#fff", fontSize: 18, marginBottom: 12 }}>{m.glyph}</div>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 500 }}>{m.label}</h3>
            <p style={{ margin: 0, fontSize: 12, color: t.sub }}>{m.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ background: t.panel, border: `1px solid ${t.disabled}`,
        borderRadius: t.radius.md, padding: 20 }}>
        <h4 style={{ margin: "0 0 15px", fontSize: 11, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: 0.6, color: t.textMuted }}>
          SEI vs Non-SEI breakdown</h4>
        <div style={{ display: "flex", gap: 30 }}>
          <Breakdown t={t} title="SEI \u00b7 SWP" color={t.projSei}
            stats={[["APIs", cats?.sei?.apis ?? 215], ["Feeds", cats?.sei?.feeds ?? 48],
              ["dbt models", cats?.sei?.models ?? 62], ["Airflow DAGs", cats?.sei?.dags ?? 14]]} />
          <Breakdown t={t} title="Non-SEI" color={t.catNonSei}
            stats={[["APIs", cats?.non_sei?.apis ?? 212], ["Datasets", cats?.non_sei?.datasets ?? 340],
              ["dbt models", cats?.non_sei?.models ?? 118], ["Airflow DAGs", cats?.non_sei?.dags ?? 27]]} />
        </div>
        <div style={{ fontSize: 12, color: t.textMuted, fontStyle: "italic", marginTop: 12 }}>
          Click a module card above to open it pre-filtered by project.
        </div>
      </div>
    </div>
  );
}

function Breakdown({ t, title, color, stats }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10,
        display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: color }} />{title}
      </div>
      {stats.map(([l, v]) => (
        <div key={l} style={{ display: "flex", justifyContent: "space-between",
          padding: "7px 0", borderBottom: `1px solid ${t.bg}`, fontSize: 13 }}>
          <span style={{ color: t.sub }}>{l}</span><b style={{ color: t.navy }}>{v}</b>
        </div>
      ))}
    </div>
  );
}
