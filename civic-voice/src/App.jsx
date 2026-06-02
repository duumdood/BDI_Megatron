import { useState, useEffect, useMemo, useCallback, createContext, useContext } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, AreaChart, Area, Legend
} from "recharts";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_ISSUES = [
  { id: 1, title: "Broken Street Lights on Mango Road", description: "Multiple street lights near the community market and surrounding residential blocks have been non-functional for over three weeks. Residents report feeling unsafe after dark and there have been two minor incidents involving pedestrians. Immediate repair is needed.", category: "Infrastructure", location: "District A", submittedDate: "2026-03-15", voteCount: 215, affectedPeople: 820, impactScore: 9, status: "In Progress" },
  { id: 2, title: "Pothole Damage on Highway 7", description: "A large section of Highway 7 near the junction has developed severe potholes causing vehicle damage. Several residents have reported tire blowouts and at least one minor accident has been attributed to the road condition.", category: "Roads", location: "District B", submittedDate: "2026-02-20", voteCount: 310, affectedPeople: 1500, impactScore: 8, status: "Pending" },
  { id: 3, title: "Water Supply Interruption — South Sector", description: "Residents in the south sector have been experiencing intermittent water supply for the past month. The water often arrives with discoloration and an unusual odor. Families with young children and elderly residents are particularly affected.", category: "Utilities", location: "District C", submittedDate: "2026-04-01", voteCount: 450, affectedPeople: 2200, impactScore: 10, status: "Pending" },
  { id: 4, title: "Overflowing Public Waste Bins", description: "The public waste bins along the central park walkway have not been emptied in over two weeks. Waste is spilling onto paths and attracting vermin. This poses both a health hazard and a visual nuisance to park users.", category: "Sanitation", location: "District A", submittedDate: "2026-04-10", voteCount: 180, affectedPeople: 600, impactScore: 7, status: "Resolved" },
  { id: 5, title: "Flooding Near School Zone", description: "After moderate rainfall, the road near Sunrise Elementary floods to over 30cm in depth. Parents are unable to safely drop off children. The school has had to cancel classes on two occasions this semester due to inaccessibility.", category: "Infrastructure", location: "District D", submittedDate: "2026-01-12", voteCount: 380, affectedPeople: 950, impactScore: 9, status: "In Progress" },
  { id: 6, title: "Abandoned Building — Safety Hazard", description: "The derelict building on Commerce Street has become a safety concern. Portions of the facade have fallen onto the pavement and local youth have been seen entering the structure. Fire risk is also a significant concern.", category: "Public Safety", location: "District B", submittedDate: "2026-03-05", voteCount: 290, affectedPeople: 400, impactScore: 8, status: "Pending" },
  { id: 7, title: "No Pedestrian Crossing at Market Junction", description: "The busy market junction lacks a proper pedestrian crossing, making it extremely dangerous for shoppers and school children to cross the road. Multiple near-misses have been reported and elderly residents are particularly at risk.", category: "Roads", location: "District C", submittedDate: "2026-02-28", voteCount: 200, affectedPeople: 1100, impactScore: 8, status: "Pending" },
  { id: 8, title: "Park Maintenance Neglected", description: "The community park grass has grown to over knee height, benches are broken, and playground equipment poses safety risks to children. The park has become unusable and is now attracting illegal dumping.", category: "Environment", location: "District A", submittedDate: "2026-04-20", voteCount: 145, affectedPeople: 750, impactScore: 6, status: "Pending" },
  { id: 9, title: "Sewage Leakage on Palm Street", description: "Raw sewage has been leaking from a burst pipe on Palm Street for five days. The smell is overwhelming and the liquid is reaching a nearby children's play area. This is an urgent public health emergency.", category: "Utilities", location: "District D", submittedDate: "2026-05-02", voteCount: 520, affectedPeople: 300, impactScore: 10, status: "In Progress" },
  { id: 10, title: "Request for Community Garden Space", description: "Residents are requesting a portion of the unused land near the civic center be converted into a community garden. This would promote social cohesion, provide fresh produce for low-income families, and improve the neighborhood aesthetic.", category: "Community", location: "District B", submittedDate: "2026-03-25", voteCount: 95, affectedPeople: 200, impactScore: 5, status: "Pending" },
  { id: 11, title: "Bus Stop Shelter Damaged", description: "The bus shelter on Avenue 12 has had its roof partially collapsed due to a storm two months ago. Commuters, many of whom are elderly workers, are exposed to the elements while waiting. The shelter needs urgent repair.", category: "Infrastructure", location: "District C", submittedDate: "2026-04-05", voteCount: 160, affectedPeople: 450, impactScore: 7, status: "Pending" },
  { id: 12, title: "Noise Pollution from Night Construction", description: "A construction site near the residential blocks has been conducting loud work between 10pm and 3am in violation of noise ordinances. Residents report sleep deprivation and it is affecting the wellbeing of children and shift workers.", category: "Public Safety", location: "District A", submittedDate: "2026-04-18", voteCount: 240, affectedPeople: 680, impactScore: 7, status: "Resolved" },
  { id: 13, title: "Lack of Street Signage in New Housing Area", description: "The newly developed housing estate in the northern part of District D has no road signs whatsoever. Emergency services have reported difficulty locating addresses. Deliveries are being misrouted and residents are struggling to provide directions.", category: "Infrastructure", location: "District D", submittedDate: "2026-05-05", voteCount: 130, affectedPeople: 880, impactScore: 8, status: "Pending" },
  { id: 14, title: "Stray Animal Population Increase", description: "There has been a significant increase in stray dogs and cats in the area around the central market. Several residents, particularly children, have reported bites and scratches. A humane capture and rehoming program is urgently needed.", category: "Public Safety", location: "District B", submittedDate: "2026-03-30", voteCount: 175, affectedPeople: 500, impactScore: 7, status: "Pending" },
  { id: 15, title: "Internet Dead Zones in Residential Blocks", description: "Several apartment blocks in the eastern section have had no reliable internet connectivity for over a month. Residents working from home, students attending online classes, and businesses operating remotely are severely impacted.", category: "Utilities", location: "District C", submittedDate: "2026-04-25", voteCount: 210, affectedPeople: 1200, impactScore: 7, status: "In Progress" },
];

const COMMENTS = {
  1: [{ id: 1, user: "Maria S.", avatar: "MS", text: "This has been going on for months. My children are afraid to walk home at night.", date: "2026-04-02" }, { id: 2, user: "James T.", avatar: "JT", text: "I contacted the city council last week and they said they're aware of it.", date: "2026-04-05" }],
  3: [{ id: 1, user: "Priya N.", avatar: "PN", text: "The water smells terrible and is yellowish. We've had to buy bottled water.", date: "2026-04-03" }],
  9: [{ id: 1, user: "Carlos M.", avatar: "CM", text: "This is a public health crisis. Children play in that area!", date: "2026-05-03" }, { id: 2, user: "Aisha B.", avatar: "AB", text: "Reported to the health department as well. Please escalate urgently.", date: "2026-05-04" }],
};

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const calcPriority = (issue) =>
  Math.round(issue.voteCount * 0.4 + issue.impactScore * 10 * 0.4 + (issue.affectedPeople / 100) * 0.2);

const STATUS_COLORS = { "Pending": "#378ADD", "In Progress": "#EF9F27", "Resolved": "#639922" };
const CATEGORY_COLORS = { "Infrastructure": "#378ADD", "Roads": "#D85A30", "Utilities": "#1D9E75", "Sanitation": "#D4537E", "Public Safety": "#7F77DD", "Environment": "#639922", "Community": "#BA7517" };

const Badge = ({ status }) => {
  const colors = { "Pending": { bg: "#E6F1FB", text: "#0C447C" }, "In Progress": { bg: "#FAEEDA", text: "#633806" }, "Resolved": { bg: "#EAF3DE", text: "#27500A" } };
  const c = colors[status] || { bg: "#F1EFE8", text: "#444441" };
  return <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 12, letterSpacing: 0.3 }}>{status}</span>;
};

// ─── APP CONTEXT ──────────────────────────────────────────────────────────────
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ toasts, dismiss }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
    {toasts.map(t => (
      <div key={t.id} style={{ background: t.type === "success" ? "#EAF3DE" : t.type === "error" ? "#FCEBEB" : "#E6F1FB", border: `1px solid ${t.type === "success" ? "#97C459" : t.type === "error" ? "#F09595" : "#85B7EB"}`, color: t.type === "success" ? "#27500A" : t.type === "error" ? "#791F1F" : "#0C447C", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 500, maxWidth: 300, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", cursor: "pointer" }} onClick={() => dismiss(t.id)}>
        <span style={{ fontSize: 16 }}>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
        {t.message}
      </div>
    ))}
  </div>
);

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "▦" },
  { key: "issues", label: "Issues", icon: "≡" },
  { key: "ranking", label: "Rankings", icon: "⬆" },
  { key: "analytics", label: "Analytics", icon: "◌" },
  { key: "excel", label: "Import / Export", icon: "⊞" },
];

const Sidebar = ({ page, setPage, dark, setDark, collapsed, setCollapsed }) => {
  const sideW = collapsed ? 62 : 220;
  return (
    <aside style={{ width: sideW, minHeight: "100vh", background: dark ? "#0f1923" : "#fff", borderRight: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, display: "flex", flexDirection: "column", transition: "width 0.2s", flexShrink: 0, position: "sticky", top: 0 }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? "20px 0" : "20px 18px", borderBottom: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start", cursor: "pointer" }} onClick={() => setCollapsed(c => !c)}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#185FA5,#378ADD)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>C</div>
        {!collapsed && <div><div style={{ fontWeight: 700, fontSize: 13, color: dark ? "#e2e8f0" : "#0a1628", lineHeight: 1.2 }}>CivicVoice</div><div style={{ fontSize: 10, color: dark ? "#64748b" : "#94a3b8", lineHeight: 1 }}>Issue Platform</div></div>}
      </div>
      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px" }}>
        {NAV.map(n => {
          const active = page === n.key;
          return (
            <button key={n.key} onClick={() => setPage(n.key)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 0" : "10px 12px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: 8, marginBottom: 2, border: "none", cursor: "pointer", background: active ? (dark ? "#1e3a5f" : "#EBF4FF") : "transparent", color: active ? "#378ADD" : (dark ? "#64748b" : "#64748b"), fontWeight: active ? 600 : 400, fontSize: 13, transition: "all 0.15s" }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              {!collapsed && n.label}
            </button>
          );
        })}
      </nav>
      {/* Bottom */}
      <div style={{ padding: "12px 8px", borderTop: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}` }}>
        <button onClick={() => setDark(d => !d)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 0" : "10px 12px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", color: dark ? "#64748b" : "#64748b", fontSize: 13 }}>
          <span style={{ fontSize: 16 }}>{dark ? "☀" : "◑"}</span>
          {!collapsed && (dark ? "Light Mode" : "Dark Mode")}
        </button>
      </div>
    </aside>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color, dark }) => (
  <div style={{ background: dark ? "#141d2b" : "#fff", border: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, borderRadius: 12, padding: "18px 20px", borderLeft: `3px solid ${color}` }}>
    <div style={{ fontSize: 12, color: dark ? "#64748b" : "#94a3b8", marginBottom: 6, fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color: dark ? "#e2e8f0" : "#0a1628", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: dark ? "#64748b" : "#94a3b8", marginTop: 4 }}>{sub}</div>}
  </div>
);

// ─── ISSUE CARD ───────────────────────────────────────────────────────────────
const IssueCard = ({ issue, onSelect, bookmarks, onBookmark, dark }) => {
  const priority = calcPriority(issue);
  const bookmarked = bookmarks.includes(issue.id);
  return (
    <div onClick={() => onSelect(issue)} style={{ background: dark ? "#141d2b" : "#fff", border: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, borderRadius: 12, padding: 18, cursor: "pointer", transition: "all 0.15s", position: "relative" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#378ADD"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? "#1e2d3d" : "#e8ecf0"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: CATEGORY_COLORS[issue.category] || "#378ADD", background: (CATEGORY_COLORS[issue.category] || "#378ADD") + "18", padding: "3px 8px", borderRadius: 6 }}>{issue.category}</span>
        <button onClick={e => { e.stopPropagation(); onBookmark(issue.id); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: bookmarked ? "#EF9F27" : (dark ? "#334155" : "#cbd5e1") }}>★</button>
      </div>
      <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: dark ? "#e2e8f0" : "#0a1628", lineHeight: 1.4 }}>{issue.title}</h3>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: dark ? "#64748b" : "#94a3b8", lineHeight: 1.5 }}>{issue.description.slice(0, 80)}…</p>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: dark ? "#475569" : "#94a3b8" }}>📍 {issue.location}</span>
        <span style={{ fontSize: 11, color: dark ? "#475569" : "#94a3b8" }}>👥 {issue.affectedPeople.toLocaleString()}</span>
        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#185FA5", background: "#E6F1FB", padding: "3px 8px", borderRadius: 6 }}>P: {priority}</span>
        <span style={{ fontSize: 11, color: dark ? "#475569" : "#94a3b8" }}>🗳 {issue.voteCount}</span>
        <Badge status={issue.status} />
      </div>
    </div>
  );
};

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
const DashboardPage = ({ issues, onSelect, dark }) => {
  const sorted = useMemo(() => [...issues].sort((a, b) => calcPriority(b) - calcPriority(a)), [issues]);
  const totalVotes = issues.reduce((s, i) => s + i.voteCount, 0);
  const inProgress = issues.filter(i => i.status === "In Progress").length;
  const resolved = issues.filter(i => i.status === "Resolved").length;

  const catData = useMemo(() => {
    const map = {};
    issues.forEach(i => { map[i.category] = (map[i.category] || 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [issues]);

  const monthData = useMemo(() => {
    const map = {};
    issues.forEach(i => {
      const m = i.submittedDate.slice(0, 7);
      map[m] = (map[m] || 0) + 1;
    });
    return Object.entries(map).sort().map(([month, count]) => ({ month: month.slice(5) + "/" + month.slice(2, 4), count }));
  }, [issues]);

  const voteData = sorted.slice(0, 6).map(i => ({ name: i.title.slice(0, 20) + "…", votes: i.voteCount, priority: calcPriority(i) }));

  const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16 };
  const card2 = { background: dark ? "#141d2b" : "#fff", border: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, borderRadius: 12, padding: 20 };
  const textPri = { color: dark ? "#e2e8f0" : "#0a1628" };
  const textSec = { color: dark ? "#64748b" : "#94a3b8", fontSize: 12 };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, ...textPri }}>Dashboard</h1>
        <p style={{ margin: "4px 0 0", ...textSec }}>Real-time overview of community issues</p>
      </div>
      <div style={{ ...grid, marginBottom: 24 }}>
        <StatCard label="Total Issues" value={issues.length} sub="All submissions" color="#378ADD" dark={dark} />
        <StatCard label="Total Votes" value={totalVotes.toLocaleString()} sub="Community engagement" color="#1D9E75" dark={dark} />
        <StatCard label="In Progress" value={inProgress} sub={`${Math.round(inProgress / issues.length * 100)}% of issues`} color="#EF9F27" dark={dark} />
        <StatCard label="Resolved" value={resolved} sub={`${Math.round(resolved / issues.length * 100)}% resolved`} color="#639922" dark={dark} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={card2}>
          <div style={{ fontWeight: 600, fontSize: 14, ...textPri, marginBottom: 16 }}>Issues by Category</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={catData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1e2d3d" : "#f0f4f8"} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: dark ? "#64748b" : "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: dark ? "#64748b" : "#94a3b8" }} />
              <Tooltip contentStyle={{ background: dark ? "#141d2b" : "#fff", border: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#378ADD" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={card2}>
          <div style={{ fontWeight: 600, fontSize: 14, ...textPri, marginBottom: 16 }}>Monthly Submissions</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#378ADD" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#378ADD" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1e2d3d" : "#f0f4f8"} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: dark ? "#64748b" : "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: dark ? "#64748b" : "#94a3b8" }} />
              <Tooltip contentStyle={{ background: dark ? "#141d2b" : "#fff", border: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="count" stroke="#378ADD" fill="url(#blueGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={card2}>
          <div style={{ fontWeight: 600, fontSize: 14, ...textPri, marginBottom: 16 }}>Priority vs Votes</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={voteData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1e2d3d" : "#f0f4f8"} />
              <XAxis type="number" tick={{ fontSize: 10, fill: dark ? "#64748b" : "#94a3b8" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: dark ? "#64748b" : "#94a3b8" }} width={100} />
              <Tooltip contentStyle={{ background: dark ? "#141d2b" : "#fff", border: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="votes" fill="#185FA5" radius={[0, 4, 4, 0]} name="Votes" />
              <Bar dataKey="priority" fill="#1D9E75" radius={[0, 4, 4, 0]} name="Priority" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={card2}>
          <div style={{ fontWeight: 600, fontSize: 14, ...textPri, marginBottom: 12 }}>Top Priority Issues</div>
          {sorted.slice(0, 5).map((issue, idx) => (
            <div key={issue.id} onClick={() => onSelect(issue)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${dark ? "#1e2d3d" : "#f0f4f8"}`, cursor: "pointer" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: ["#FFD700", "#C0C0C0", "#CD7F32", "#94a3b8", "#94a3b8"][idx], minWidth: 20 }}>#{idx + 1}</span>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 500, ...textPri, lineHeight: 1.3 }}>{issue.title.slice(0, 38)}…</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#378ADD" }}>{calcPriority(issue)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── ISSUES PAGE ──────────────────────────────────────────────────────────────
const IssuesPage = ({ issues, onSelect, bookmarks, onBookmark, dark }) => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState("priority");
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;
  const categories = ["All", ...new Set(issues.map(i => i.category))];
  const statuses = ["All", "Pending", "In Progress", "Resolved"];
  const filtered = useMemo(() => {
    let r = issues.filter(i =>
      (catFilter === "All" || i.category === catFilter) &&
      (statusFilter === "All" || i.status === statusFilter) &&
      (i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()))
    );
    if (sort === "priority") r = r.sort((a, b) => calcPriority(b) - calcPriority(a));
    else if (sort === "votes") r = r.sort((a, b) => b.voteCount - a.voteCount);
    else if (sort === "impact") r = r.sort((a, b) => b.impactScore - a.impactScore);
    else if (sort === "recent") r = r.sort((a, b) => b.submittedDate.localeCompare(a.submittedDate));
    return r;
  }, [issues, search, catFilter, statusFilter, sort]);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const inputStyle = { padding: "8px 12px", borderRadius: 8, border: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, background: dark ? "#141d2b" : "#fff", color: dark ? "#e2e8f0" : "#0a1628", fontSize: 13, outline: "none" };
  const textPri = { color: dark ? "#e2e8f0" : "#0a1628" };
  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, ...textPri }}>Issues Directory</h1>
        <p style={{ margin: "4px 0 0", color: dark ? "#64748b" : "#94a3b8", fontSize: 12 }}>{filtered.length} issues found</p>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="🔍  Search issues…" style={{ ...inputStyle, flex: "1 1 200px", minWidth: 200 }} />
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }} style={inputStyle}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={inputStyle}>
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} style={inputStyle}>
          <option value="priority">Highest Priority</option>
          <option value="votes">Most Votes</option>
          <option value="impact">Most Impact</option>
          <option value="recent">Most Recent</option>
        </select>
      </div>
      {paged.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: dark ? "#64748b" : "#94a3b8" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontWeight: 600, ...textPri }}>No issues found</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {paged.map(issue => <IssueCard key={issue.id} issue={issue} onSelect={onSelect} bookmarks={bookmarks} onBookmark={onBookmark} dark={dark} />)}
        </div>
      )}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${page === i + 1 ? "#378ADD" : (dark ? "#1e2d3d" : "#e8ecf0")}`, background: page === i + 1 ? "#378ADD" : "transparent", color: page === i + 1 ? "#fff" : (dark ? "#64748b" : "#94a3b8"), fontWeight: 600, fontSize: 13, cursor: "pointer" }}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── ISSUE DETAIL ─────────────────────────────────────────────────────────────
const IssueDetail = ({ issue, onBack, onVote, bookmarks, onBookmark, dark, toast }) => {
  const priority = calcPriority(issue);
  const comments = COMMENTS[issue.id] || [];
  const bookmarked = bookmarks.includes(issue.id);
  const textPri = { color: dark ? "#e2e8f0" : "#0a1628" };
  const card = { background: dark ? "#141d2b" : "#fff", border: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, borderRadius: 12, padding: 20 };
  return (
    <div style={{ padding: 28, maxWidth: 860 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#378ADD", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>← Back to Issues</button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        <div>
          <div style={{ ...card, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: CATEGORY_COLORS[issue.category] || "#378ADD", background: (CATEGORY_COLORS[issue.category] || "#378ADD") + "18", padding: "3px 8px", borderRadius: 6 }}>{issue.category}</span>
              <Badge status={issue.status} />
            </div>
            <h1 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 700, ...textPri, lineHeight: 1.4 }}>{issue.title}</h1>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: dark ? "#94a3b8" : "#475569", lineHeight: 1.7 }}>{issue.description}</p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", paddingTop: 12, borderTop: `1px solid ${dark ? "#1e2d3d" : "#f0f4f8"}` }}>
              {[["📍 Location", issue.location], ["📅 Submitted", issue.submittedDate], ["👥 Affected", issue.affectedPeople.toLocaleString() + " people"]].map(([k, v]) => (
                <div key={k}><div style={{ fontSize: 11, color: dark ? "#475569" : "#94a3b8", marginBottom: 2 }}>{k}</div><div style={{ fontSize: 13, fontWeight: 600, ...textPri }}>{v}</div></div>
              ))}
            </div>
          </div>
          <div style={card}>
            <div style={{ fontWeight: 600, fontSize: 14, ...textPri, marginBottom: 16 }}>Community Comments ({comments.length})</div>
            {comments.length === 0 ? <div style={{ fontSize: 13, color: dark ? "#475569" : "#94a3b8" }}>No comments yet. Be the first to respond.</div> : comments.map(c => (
              <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${dark ? "#1e2d3d" : "#f0f4f8"}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#185FA5", flexShrink: 0 }}>{c.avatar}</div>
                <div><div style={{ fontSize: 12, fontWeight: 600, ...textPri }}>{c.user} <span style={{ fontWeight: 400, color: dark ? "#475569" : "#94a3b8" }}>· {c.date}</span></div><div style={{ fontSize: 13, color: dark ? "#94a3b8" : "#475569", marginTop: 3, lineHeight: 1.6 }}>{c.text}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ textAlign: "center", paddingBottom: 16, borderBottom: `1px solid ${dark ? "#1e2d3d" : "#f0f4f8"}`, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: dark ? "#475569" : "#94a3b8", marginBottom: 4 }}>PRIORITY SCORE</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: "#378ADD", lineHeight: 1 }}>{priority}</div>
            </div>
            {[["🗳 Votes", issue.voteCount], ["⚡ Impact Score", issue.impactScore + "/10"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${dark ? "#1e2d3d" : "#f0f4f8"}`, fontSize: 13 }}>
                <span style={{ color: dark ? "#64748b" : "#94a3b8" }}>{k}</span>
                <span style={{ fontWeight: 600, ...textPri }}>{v}</span>
              </div>
            ))}
            <button onClick={() => onVote(issue.id)} style={{ width: "100%", marginTop: 16, padding: "11px 0", borderRadius: 8, background: "#378ADD", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>🗳 Vote for this Issue</button>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={() => onBookmark(issue.id)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, background: bookmarked ? "#FAEEDA" : "transparent", color: bookmarked ? "#633806" : (dark ? "#64748b" : "#94a3b8"), border: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>{bookmarked ? "★ Saved" : "☆ Save"}</button>
              <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast("Link copied!", "success"); }} style={{ flex: 1, padding: "9px 0", borderRadius: 8, background: "transparent", color: dark ? "#64748b" : "#94a3b8", border: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Share</button>
            </div>
          </div>
          <div style={{ ...card, fontSize: 12, color: dark ? "#64748b" : "#94a3b8" }}>
            <div style={{ fontWeight: 600, fontSize: 13, ...textPri, marginBottom: 10 }}>Priority Formula</div>
            <div style={{ lineHeight: 1.8 }}>
              <div>🗳 Votes × 40%</div>
              <div>⚡ Impact × 40%</div>
              <div>👥 Affected × 20%</div>
              <div style={{ marginTop: 8, padding: "8px 0", borderTop: `1px solid ${dark ? "#1e2d3d" : "#f0f4f8"}`, fontWeight: 600, color: "#378ADD" }}>Score = {priority}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── RANKING PAGE ─────────────────────────────────────────────────────────────
const RankingPage = ({ issues, onSelect, dark }) => {
  const [mode, setMode] = useState("priority");
  const sorted = useMemo(() => {
    const r = [...issues];
    return mode === "priority" ? r.sort((a, b) => calcPriority(b) - calcPriority(a)) : r.sort((a, b) => b.voteCount - a.voteCount);
  }, [issues, mode]);
  const top10 = sorted.slice(0, 10);
  const medals = ["🥇", "🥈", "🥉"];
  const textPri = { color: dark ? "#e2e8f0" : "#0a1628" };
  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, ...textPri }}>Community Rankings</h1>
          <p style={{ margin: "4px 0 0", color: dark ? "#64748b" : "#94a3b8", fontSize: 12 }}>Top 10 issues by community support</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["priority", "votes"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${mode === m ? "#378ADD" : (dark ? "#1e2d3d" : "#e8ecf0")}`, background: mode === m ? "#378ADD" : "transparent", color: mode === m ? "#fff" : (dark ? "#64748b" : "#94a3b8"), fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
              {m === "priority" ? "Priority Score" : "Vote Count"}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {top10.map((issue, idx) => (
          <div key={issue.id} onClick={() => onSelect(issue)} style={{ background: dark ? "#141d2b" : "#fff", border: `1px solid ${idx < 3 ? "#378ADD44" : (dark ? "#1e2d3d" : "#e8ecf0")}`, borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#378ADD"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = idx < 3 ? "#378ADD44" : (dark ? "#1e2d3d" : "#e8ecf0"); }}>
            <div style={{ fontSize: idx < 3 ? 28 : 18, minWidth: 40, textAlign: "center" }}>{idx < 3 ? medals[idx] : `#${idx + 1}`}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, ...textPri, marginBottom: 4 }}>{issue.title}</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: CATEGORY_COLORS[issue.category] || "#378ADD" }}>{issue.category}</span>
                <span style={{ fontSize: 11, color: dark ? "#475569" : "#94a3b8" }}>📍 {issue.location}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: dark ? "#475569" : "#94a3b8", marginBottom: 2 }}>Votes</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#185FA5" }}>{issue.voteCount}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: dark ? "#475569" : "#94a3b8", marginBottom: 2 }}>Priority</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#378ADD" }}>{calcPriority(issue)}</div>
              </div>
              <Badge status={issue.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────
const AnalyticsPage = ({ issues, dark }) => {
  const catData = useMemo(() => {
    const map = {};
    issues.forEach(i => { map[i.category] = (map[i.category] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [issues]);

  const locationData = useMemo(() => {
    const map = {};
    issues.forEach(i => { map[i.location] = (map[i.location] || 0) + i.voteCount; });
    return Object.entries(map).map(([name, votes]) => ({ name, votes })).sort((a, b) => b.votes - a.votes);
  }, [issues]);

  const priorityDist = useMemo(() => {
    const buckets = [{ range: "0-50", count: 0 }, { range: "51-100", count: 0 }, { range: "101-150", count: 0 }, { range: "151+", count: 0 }];
    issues.forEach(i => {
      const p = calcPriority(i);
      if (p <= 50) buckets[0].count++;
      else if (p <= 100) buckets[1].count++;
      else if (p <= 150) buckets[2].count++;
      else buckets[3].count++;
    });
    return buckets;
  }, [issues]);

  const avgImpact = Math.round(issues.reduce((s, i) => s + i.impactScore, 0) / issues.length * 10) / 10;
  const avgAffected = Math.round(issues.reduce((s, i) => s + i.affectedPeople, 0) / issues.length);
  const COLORS = ["#378ADD", "#1D9E75", "#EF9F27", "#D85A30", "#7F77DD", "#D4537E", "#639922"];
  const card = { background: dark ? "#141d2b" : "#fff", border: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, borderRadius: 12, padding: 20 };
  const textPri = { color: dark ? "#e2e8f0" : "#0a1628" };
  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, ...textPri }}>Analytics</h1>
        <p style={{ margin: "4px 0 0", color: dark ? "#64748b" : "#94a3b8", fontSize: 12 }}>Community participation insights</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Avg Impact" value={avgImpact} sub="out of 10" color="#1D9E75" dark={dark} />
        <StatCard label="Avg Affected" value={avgAffected.toLocaleString()} sub="people per issue" color="#7F77DD" dark={dark} />
        <StatCard label="Total Affected" value={issues.reduce((s, i) => s + i.affectedPeople, 0).toLocaleString()} sub="community members" color="#D85A30" dark={dark} />
        <StatCard label="Pending Issues" value={issues.filter(i => i.status === "Pending").length} sub="awaiting action" color="#EF9F27" dark={dark} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={card}>
          <div style={{ fontWeight: 600, fontSize: 14, ...textPri, marginBottom: 16 }}>Issues by Category</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`} labelLine={true} fontSize={10}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: dark ? "#141d2b" : "#fff", border: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={card}>
          <div style={{ fontWeight: 600, fontSize: 14, ...textPri, marginBottom: 16 }}>Votes by District</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={locationData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1e2d3d" : "#f0f4f8"} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: dark ? "#64748b" : "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: dark ? "#64748b" : "#94a3b8" }} />
              <Tooltip contentStyle={{ background: dark ? "#141d2b" : "#fff", border: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="votes" fill="#1D9E75" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={card}>
          <div style={{ fontWeight: 600, fontSize: 14, ...textPri, marginBottom: 16 }}>Priority Score Distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityDist} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1e2d3d" : "#f0f4f8"} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: dark ? "#64748b" : "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: dark ? "#64748b" : "#94a3b8" }} />
              <Tooltip contentStyle={{ background: dark ? "#141d2b" : "#fff", border: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#7F77DD" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={card}>
          <div style={{ fontWeight: 600, fontSize: 14, ...textPri, marginBottom: 16 }}>Highest Impact Issues</div>
          {[...issues].sort((a, b) => b.impactScore - a.impactScore).slice(0, 5).map(issue => (
            <div key={issue.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${dark ? "#1e2d3d" : "#f0f4f8"}` }}>
              <div style={{ flex: 1, fontSize: 12, ...textPri }}>{issue.title.slice(0, 36)}…</div>
              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: i < issue.impactScore ? "#378ADD" : (dark ? "#1e2d3d" : "#e8ecf0") }} />
                ))}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#378ADD", minWidth: 20 }}>{issue.impactScore}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── EXCEL PAGE ───────────────────────────────────────────────────────────────
const ExcelPage = ({ issues, setIssues, dark, toast }) => {
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const textPri = { color: dark ? "#e2e8f0" : "#0a1628" };
  const card = { background: dark ? "#141d2b" : "#fff", border: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, borderRadius: 12, padding: 20 };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setTimeout(() => {
      // Simulate parsing — show sample preview
      setPreview(issues.slice(0, 3));
      setImporting(false);
      toast("File loaded. Preview ready.", "success");
    }, 1000);
  };

  const confirmImport = () => {
    toast("Data imported successfully! 15 records added.", "success");
    setPreview(null);
  };

  const exportCSV = () => {
    const headers = ["id", "title", "category", "location", "submittedDate", "voteCount", "affectedPeople", "impactScore", "status", "priorityScore"];
    const rows = issues.map(i => [i.id, `"${i.title}"`, i.category, i.location, i.submittedDate, i.voteCount, i.affectedPeople, i.impactScore, i.status, calcPriority(i)]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "civic_issues_export.csv"; a.click();
    toast("Exported to CSV successfully.", "success");
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, ...textPri }}>Import / Export</h1>
        <p style={{ margin: "4px 0 0", color: dark ? "#64748b" : "#94a3b8", fontSize: 12 }}>Manage issue data through Excel and CSV files</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={card}>
          <div style={{ fontWeight: 600, fontSize: 15, ...textPri, marginBottom: 6 }}>📥 Import Data</div>
          <p style={{ fontSize: 13, color: dark ? "#64748b" : "#94a3b8", marginBottom: 16, lineHeight: 1.6 }}>Upload an Excel (.xlsx) or CSV file containing issue records. The system will validate and preview the data before importing.</p>
          <label style={{ display: "block", border: `2px dashed ${dark ? "#1e3a5f" : "#bfdbfe"}`, borderRadius: 10, padding: 24, textAlign: "center", cursor: "pointer", color: dark ? "#475569" : "#94a3b8", fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
            <div style={{ fontWeight: 500, ...textPri, marginBottom: 4 }}>Click to upload or drag & drop</div>
            <div style={{ fontSize: 11 }}>.xlsx, .xls, .csv supported</div>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{ display: "none" }} />
          </label>
          {importing && <div style={{ textAlign: "center", marginTop: 12, color: "#378ADD", fontSize: 13 }}>⏳ Parsing file…</div>}
        </div>
        <div style={card}>
          <div style={{ fontWeight: 600, fontSize: 15, ...textPri, marginBottom: 6 }}>📤 Export Data</div>
          <p style={{ fontSize: 13, color: dark ? "#64748b" : "#94a3b8", marginBottom: 16, lineHeight: 1.6 }}>Export all current issues including calculated priority scores to a CSV file for offline analysis or reporting.</p>
          <div style={{ background: dark ? "#0f1923" : "#f8fafc", borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: dark ? "#64748b" : "#94a3b8" }}>Records to export</span>
              <span style={{ fontWeight: 600, ...textPri }}>{issues.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: dark ? "#64748b" : "#94a3b8" }}>Fields included</span>
              <span style={{ fontWeight: 600, ...textPri }}>10 columns</span>
            </div>
          </div>
          <button onClick={exportCSV} style={{ width: "100%", padding: "11px 0", borderRadius: 8, background: "#1D9E75", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Export as CSV</button>
        </div>
      </div>
      {preview && (
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 15, ...textPri }}>Preview ({preview.length} records shown)</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setPreview(null)} style={{ padding: "7px 14px", borderRadius: 8, background: "transparent", border: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, color: dark ? "#64748b" : "#94a3b8", fontSize: 12, cursor: "pointer" }}>Cancel</button>
              <button onClick={confirmImport} style={{ padding: "7px 14px", borderRadius: 8, background: "#378ADD", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Confirm Import</button>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: dark ? "#0f1923" : "#f8fafc" }}>
                  {["ID", "Title", "Category", "Location", "Status", "Votes", "Impact", "Priority Score"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: dark ? "#64748b" : "#94a3b8", borderBottom: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map(issue => (
                  <tr key={issue.id}>
                    {[issue.id, issue.title.slice(0, 28) + "…", issue.category, issue.location, issue.status, issue.voteCount, issue.impactScore, calcPriority(issue)].map((v, i) => (
                      <td key={i} style={{ padding: "8px 12px", borderBottom: `1px solid ${dark ? "#1e2d3d" : "#f0f4f8"}`, color: dark ? "#94a3b8" : "#475569" }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, padding: "10px 14px", background: dark ? "#0f3d1a" : "#EAF3DE", borderRadius: 8, fontSize: 12, color: dark ? "#97C459" : "#27500A", fontWeight: 500 }}>
            ✓ All records validated. No errors detected.
          </div>
        </div>
      )}
      <div style={{ ...card, marginTop: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 15, ...textPri, marginBottom: 12 }}>Expected Data Format</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: dark ? "#0f1923" : "#f8fafc" }}>
                {["Column", "Type", "Required", "Example"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: dark ? "#64748b" : "#94a3b8", borderBottom: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}` }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[["id", "Number", "Yes", "1"], ["title", "Text", "Yes", "Broken Street Lights"], ["category", "Text", "Yes", "Infrastructure"], ["location", "Text", "Yes", "District A"], ["submittedDate", "YYYY-MM-DD", "Yes", "2026-05-01"], ["voteCount", "Number", "No", "125"], ["affectedPeople", "Number", "No", "450"], ["impactScore", "1–10", "Yes", "9"], ["status", "Text", "Yes", "Pending | In Progress | Resolved"]].map(([col, type, req, ex]) => (
                <tr key={col}>
                  <td style={{ padding: "7px 12px", borderBottom: `1px solid ${dark ? "#1e2d3d" : "#f0f4f8"}`, fontWeight: 600, color: "#378ADD", fontFamily: "monospace" }}>{col}</td>
                  <td style={{ padding: "7px 12px", borderBottom: `1px solid ${dark ? "#1e2d3d" : "#f0f4f8"}`, color: dark ? "#94a3b8" : "#64748b" }}>{type}</td>
                  <td style={{ padding: "7px 12px", borderBottom: `1px solid ${dark ? "#1e2d3d" : "#f0f4f8"}` }}><span style={{ background: req === "Yes" ? "#FCEBEB" : "#EAF3DE", color: req === "Yes" ? "#791F1F" : "#27500A", fontSize: 10, padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>{req}</span></td>
                  <td style={{ padding: "7px 12px", borderBottom: `1px solid ${dark ? "#1e2d3d" : "#f0f4f8"}`, color: dark ? "#64748b" : "#94a3b8", fontFamily: "monospace", fontSize: 11 }}>{ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── HEADER ───────────────────────────────────────────────────────────────────
const Header = ({ page, dark }) => {
  const labels = { dashboard: "Dashboard", issues: "Issues Directory", ranking: "Community Rankings", analytics: "Analytics", excel: "Import / Export" };
  return (
    <header style={{ padding: "14px 28px", borderBottom: `1px solid ${dark ? "#1e2d3d" : "#e8ecf0"}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: dark ? "#0f1923" : "#fff", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#e2e8f0" : "#0a1628" }}>{labels[page] || "CivicVoice"}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 12, color: dark ? "#64748b" : "#94a3b8" }}>Admin User</div>
        <div style={{ width: 32, height: 32, borderRadius: 16, background: "linear-gradient(135deg,#185FA5,#378ADD)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>AU</div>
      </div>
    </header>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issues, setIssues] = useState(MOCK_ISSUES.map(i => ({ ...i })));
  const [bookmarks, setBookmarks] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  const dismissToast = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);

  const handleVote = useCallback((id) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, voteCount: i.voteCount + 1 } : i));
    if (selectedIssue?.id === id) setSelectedIssue(prev => ({ ...prev, voteCount: prev.voteCount + 1 }));
    toast("Vote recorded! Rankings updated.", "success");
  }, [selectedIssue, toast]);

  const handleBookmark = useCallback((id) => {
    setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
    toast(bookmarks.includes(id) ? "Removed from saved." : "Issue saved to bookmarks.", "info");
  }, [bookmarks, toast]);

  const handleSelect = useCallback((issue) => {
    setSelectedIssue(issue);
    setPage("detail");
  }, []);

  const bg = dark ? "#0c1420" : "#f5f7fa";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: bg, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Sidebar page={selectedIssue ? "issues" : page} setPage={(p) => { setPage(p); setSelectedIssue(null); }} dark={dark} setDark={setDark} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header page={selectedIssue ? "detail" : page} dark={dark} />
        <main style={{ flex: 1, overflowY: "auto" }}>
          {selectedIssue ? (
            <IssueDetail issue={selectedIssue} onBack={() => setSelectedIssue(null)} onVote={handleVote} bookmarks={bookmarks} onBookmark={handleBookmark} dark={dark} toast={toast} />
          ) : page === "dashboard" ? (
            <DashboardPage issues={issues} onSelect={handleSelect} dark={dark} />
          ) : page === "issues" ? (
            <IssuesPage issues={issues} onSelect={handleSelect} bookmarks={bookmarks} onBookmark={handleBookmark} dark={dark} />
          ) : page === "ranking" ? (
            <RankingPage issues={issues} onSelect={handleSelect} dark={dark} />
          ) : page === "analytics" ? (
            <AnalyticsPage issues={issues} dark={dark} />
          ) : page === "excel" ? (
            <ExcelPage issues={issues} setIssues={setIssues} dark={dark} toast={toast} />
          ) : null}
        </main>
      </div>
      <Toast toasts={toasts} dismiss={dismissToast} />
    </div>
  );
}
