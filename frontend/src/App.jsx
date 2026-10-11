import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import SpaceMap from "./SpaceMap";

const API = "http://localhost:8081/api";

const sections = {
  Missions: {
    endpoint: "/missions",
    title: "Mission Control",
    subtitle: "Plan, monitor, and manage space exploration missions.",
    nameField: "missionName",
    codeField: "missionCode",
    fields: [
      {
        name: "missionName",
        label: "Mission Name",
        required: true,
        maxLength: 100,
      },
      {
        name: "missionCode",
        label: "Mission Code",
        required: true,
        maxLength: 50,
      },
      {
        name: "destination",
        label: "Destination",
        maxLength: 100,
      },
      {
        name: "latitude",
        label: "Earth Location Latitude",
        type: "number",
        min: -90,
        max: 90,
        step: "any",
      },
      {
        name: "longitude",
        label: "Earth Location Longitude",
        type: "number",
        min: -180,
        max: 180,
        step: "any",
      },
      {
        name: "launchDate",
        label: "Launch Date",
        type: "date",
      },
      {
        name: "plannedEndDate",
        label: "Planned End Date",
        type: "date",
      },
      {
        name: "status",
        label: "Status",
        required: true,
        options: [
          "PLANNED",
          "SCHEDULED",
          "ACTIVE",
          "COMPLETED",
          "CANCELLED",
        ],
      },
      {
        name: "description",
        label: "Description",
        maxLength: 1000,
        fullWidth: true,
      },
    ],
    columns: [
      ["missionName", "Mission Name"],
      ["missionCode", "Code"],
      ["destination", "Destination"],
      ["launchDate", "Launch Date"],
      ["plannedEndDate", "Planned End Date"],
      ["status", "Status"],
    ],
  },

  Satellites: {
    endpoint: "/satellites",
    title: "Satellites",
    description: "Manage satellites and their simulated orbital parameters.",
    fields: [
      {
        name: "satelliteName",
        label: "Satellite Name",
        type: "text",
        required: true,
      },
      {
        name: "satelliteCode",
        label: "Satellite Code",
        type: "text",
        required: true,
      },
      {
        name: "orbitType",
        label: "Orbit Type",
        type: "select",
        options: [
          "LEO",
          "MEO",
          "GEO",
          "Polar",
          "Sun-Synchronous",
          "Other",
        ],
        required: false,
      },
      {
        name: "orbitalAltitudeKm",
        label: "Altitude (km)",
        type: "number",
        min: 200,
        max: 50000,
        step: "any",
      },
      {
        name: "inclinationDeg",
        label: "Inclination (°)",
        type: "number",
        min: 0,
        max: 180,
        step: "any",
      },
      {
        name: "raanDeg",
        label: "RAAN (°)",
        type: "number",
        min: 0,
        max: 360,
        step: "any",
      },
      {
        name: "orbitPhaseDeg",
        label: "Orbit Phase (°)",
        type: "number",
        min: 0,
        max: 360,
        step: "any",
      },
      {
        name: "orbitSpeedMultiplier",
        label: "Orbit Speed Multiplier",
        type: "number",
        min: 0.1,
        max: 20,
        step: "any",
      },
      {
        name: "launchDate",
        label: "Launch Date",
        type: "date",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["ACTIVE", "INACTIVE", "MAINTENANCE"],
        required: true,
      },
      {
        name: "operator",
        label: "Operator",
        type: "text",
      },
    ],
    columns: [
      ["satelliteName", "Satellite Name"],
      ["satelliteCode", "Satellite Code"],
      ["orbitType", "Orbit Type"],
      ["orbitalAltitudeKm", "Altitude (km)"],
      ["status", "Status"],
      ["operator", "Operator"],
    ],
  },

  "Ground Stations": {
    endpoint: "/ground-stations",
    title: "Ground Station Network",
    subtitle: "Manage ground stations and communication infrastructure.",
    nameField: "stationName",
    codeField: "stationCode",
    fields: [
      {
        name: "stationName",
        label: "Station Name",
        required: true,
        maxLength: 100,
      },
      {
        name: "stationCode",
        label: "Station Code",
        required: true,
        maxLength: 50,
      },
      {
        name: "location",
        label: "Location",
        maxLength: 200,
      },
      {
        name: "latitude",
        label: "Latitude",
        type: "number",
        min: -90,
        max: 90,
        step: "any",
      },
      {
        name: "longitude",
        label: "Longitude",
        type: "number",
        min: -180,
        max: 180,
        step: "any",
      },
      {
        name: "antennaType",
        label: "Antenna Type",
        maxLength: 100,
      },
      {
        name: "status",
        label: "Status",
        required: true,
        options: ["ACTIVE", "INACTIVE", "MAINTENANCE"],
      },
      {
        name: "operator",
        label: "Operator",
        maxLength: 100,
      },
    ],
    columns: [
      ["stationName", "Station"],
      ["stationCode", "Code"],
      ["location", "Location"],
      ["latitude", "Latitude"],
      ["longitude", "Longitude"],
      ["antennaType", "Antenna"],
      ["status", "Status"],
      ["operator", "Operator"],
    ],
  },
};

const navItems = [
  { name: "Overview", icon: "◫" },
  { name: "Missions", icon: "◉" },
  { name: "Satellites", icon: "◎" },
  { name: "Ground Stations", icon: "⌘" },
  { name: "Space Map", icon: "🌍" }
];

const emptyForm = (section) =>
  Object.fromEntries(section.fields.map((field) => [field.name, ""]));

const normalizeStatus = (value) =>
  String(value || "").trim().toUpperCase();

const formatDate = (value) =>
  value ? String(value).slice(0, 10) : "—";

const statusClass = (value) =>
  normalizeStatus(value).toLowerCase().replaceAll("_", "-");

function StatusBadge({ value }) {
  return (
    <span className={`status-badge ${statusClass(value)}`}>
      <i />
      {value || "UNKNOWN"}
    </span>
  );
}

function StatCard({ label, value, foot, icon, tone = "" }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <b className={`stat-icon ${tone}`}>{icon}</b>
      </div>

      <div className="stat-value">{value}</div>
      <div className="stat-foot">{foot}</div>
    </article>
  );
}

export default function App() {
  const [active, setActive] = useState("Overview");

  const [allData, setAllData] = useState({
    Missions: [],
    Satellites: [],
    "Ground Stations": [],
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("default");

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm(sections.Missions));

  // NEW: selected mission for the right-side details panel
  const [detailsMission, setDetailsMission] = useState(null);
  const [assignedSatellites, setAssignedSatellites] = useState([]);
  const [selectedSatelliteId, setSelectedSatelliteId] = useState("");
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [assignmentNotice, setAssignmentNotice] = useState("");

  const isOverview = active === "Overview";
  const isSpaceMap = active === "Space Map";

  const section =
    isOverview || isSpaceMap ? null : sections[active];

  const data = section ? allData[active] || [] : [];

  // Fetch all modules for the overview.
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const entries = await Promise.all(
        Object.entries(sections).map(async ([name, config]) => {
          const response = await fetch(`${API}${config.endpoint}`);

          if (!response.ok) {
            throw new Error(`${name} request failed (${response.status})`);
          }

          const result = await response.json();

          return [name, Array.isArray(result) ? result : []];
        })
      );

      setAllData(Object.fromEntries(entries));
    } catch {
      setError(
        "Cannot connect to the backend. Make sure Spring Boot is running on port 8081."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch one module.
  const loadSectionData = useCallback(async (name) => {
    const config = sections[name];

    if (!config) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}${config.endpoint}`);

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const result = await response.json();

      setAllData((previous) => ({
        ...previous,
        [name]: Array.isArray(result) ? result : [],
      }));
    } catch {
      setError(
        "Cannot connect to the backend. Make sure Spring Boot is running on port 8081."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSearch("");
    setStatusFilter("ALL");
    setSortBy("default");
    setError("");
    setNotice("");

    if (active === "Overview" || active === "Space Map") {
      loadAllData();
    } else {
      loadSectionData(active);
    }
  }, [active, loadAllData, loadSectionData]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(""), 4200);

    return () => window.clearTimeout(timer);
  }, [notice]);

  // Dashboard statistics.
  const totals = useMemo(() => {
    const missions = allData.Missions;
    const satellites = allData.Satellites;
    const stations = allData["Ground Stations"];

    return {
      missions: missions.length,
      satellites: satellites.length,
      stations: stations.length,

      activeSatellites: satellites.filter(
        (item) => normalizeStatus(item.status) === "ACTIVE"
      ).length,

      plannedMissions: missions.filter((item) =>
        ["PLANNED", "SCHEDULED"].includes(normalizeStatus(item.status))
      ).length,

      activeStations: stations.filter(
        (item) => normalizeStatus(item.status) === "ACTIVE"
      ).length,

      activeMissions: missions.filter(
        (item) => normalizeStatus(item.status) === "ACTIVE"
      ).length,
    };
  }, [allData]);

  const missionStatuses = useMemo(
    () =>
      ["PLANNED", "SCHEDULED", "ACTIVE", "COMPLETED", "CANCELLED"].map(
        (status) => ({
          status,
          count: allData.Missions.filter(
            (item) => normalizeStatus(item.status) === status
          ).length,
        })
      ),
    [allData.Missions]
  );

  // Search, filter, and sort.
  const filtered = useMemo(() => {
    let result = data.filter((item) => {
      const matchesSearch = Object.values(item).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(search.toLowerCase().trim())
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        normalizeStatus(item.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });

    if (sortBy !== "default") {
      result = [...result].sort((a, b) =>
        String(a[sortBy] ?? "")
          .toLowerCase()
          .localeCompare(String(b[sortBy] ?? "").toLowerCase())
      );
    }

    return result;
  }, [data, search, statusFilter, sortBy]);

  const activeCount = data.filter(
    (item) => normalizeStatus(item.status) === "ACTIVE"
  ).length;

  const recentMissions = [...allData.Missions]
    .sort((a, b) =>
      String(b.launchDate || "").localeCompare(String(a.launchDate || ""))
    )
    .slice(0, 5);

  // NEW: Open the mission details drawer.
  async function openMissionDetails(mission) {
    setDetailsMission(mission);
    setAssignedSatellites([]);
    setSelectedSatelliteId("");
    setAssignmentError("");
    setAssignmentNotice("");
    setError("");
    setAssignmentLoading(true);

    try {
      // Load satellite records for the assignment dropdown
      const satelliteResponse = await fetch(`${API}/satellites`);

      if (!satelliteResponse.ok) {
        throw new Error(await readError(satelliteResponse));
      }

      const satelliteData = await satelliteResponse.json();
      console.log("SATELLITE DATA:", satelliteData);

      setAllData((previous) => ({
        ...previous,
        Satellites: Array.isArray(satelliteData) ? satelliteData : [],
      }));

      // Load satellites already assigned to this mission
      const response = await fetch(
        `${API}/missions/${mission.id}/satellites`
      );

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const result = await response.json();

      setAssignedSatellites(Array.isArray(result) ? result : []);
    } catch (err) {
      setAssignmentError(
        err.message || "Unable to load satellite records."
      );
    } finally {
      setAssignmentLoading(false);
    }
  }

  async function assignSatellite() {
    if (!detailsMission || !selectedSatelliteId || assignmentLoading) {
      return;
    }

    setAssignmentLoading(true);
    setAssignmentError("");
    setAssignmentNotice("");

    try {
      const response = await fetch(
        `${API}/missions/${detailsMission.id}/satellites/${selectedSatelliteId}`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const result = await response.json();

      setAssignmentNotice(
        result.message || "Satellite assigned successfully."
      );

      setSelectedSatelliteId("");

      const refreshResponse = await fetch(
        `${API}/missions/${detailsMission.id}/satellites`
      );

      if (!refreshResponse.ok) {
        throw new Error(await readError(refreshResponse));
      }

      const satellites = await refreshResponse.json();

      setAssignedSatellites(
        Array.isArray(satellites) ? satellites : []
      );

      await loadAllData();
    } catch (err) {
      setAssignmentError(
        err.message || "Unable to assign satellite."
      );
    } finally {
      setAssignmentLoading(false);
    }
  }

  async function removeSatelliteAssignment(satelliteId) {
    if (!detailsMission || assignmentLoading) {
      return;
    }

    if (
      !window.confirm(
        "Remove this satellite from the mission? The satellite record itself will not be deleted."
      )
    ) {
      return;
    }

    setAssignmentLoading(true);
    setAssignmentError("");
    setAssignmentNotice("");

    try {
      const response = await fetch(
        `${API}/missions/${detailsMission.id}/satellites/${satelliteId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const result = await response.json();

      setAssignmentNotice(
        result.message || "Satellite removed from mission."
      );

      const refreshResponse = await fetch(
        `${API}/missions/${detailsMission.id}/satellites`
      );

      if (!refreshResponse.ok) {
        throw new Error(await readError(refreshResponse));
      }

      const satellites = await refreshResponse.json();

      setAssignedSatellites(
        Array.isArray(satellites) ? satellites : []
      );

      await loadAllData();
    } catch (err) {
      setAssignmentError(
        err.message || "Unable to remove satellite assignment."
      );
    } finally {
      setAssignmentLoading(false);
    }
  }

  // Open a blank form for the selected module.
  function openAdd() {
    if (!section) return;

    setEditing(null);
    setForm(emptyForm(section));
    setError("");
    setModal(true);
  }

  // Open the edit form for a record in the specified module.
  // Passing the module explicitly also fixes editing from the Overview panel.
  function openEditInSection(sectionName, item) {
    const config = sections[sectionName];

    if (!config) return;

    setActive(sectionName);
    setEditing(item.id);

    setForm(
      Object.fromEntries(
        config.fields.map((field) => [
          field.name,
          item[field.name] == null
            ? ""
            : String(item[field.name]).slice(0, 10),
        ])
      )
    );

    setError("");
    setDetailsMission(null);
    setModal(true);
  }

  function openEdit(item) {
    if (!section) return;
    openEditInSection(active, item);
  }

  async function readError(response) {
    const body = await response.json().catch(() => ({}));

    if (body.messages && typeof body.messages === "object") {
      return Object.values(body.messages).join(" ");
    }

    if (body.details && typeof body.details === "object") {
      return Object.values(body.details).join(" ");
    }

    return (
      body.message ||
      body.error ||
      `Request failed (${response.status}).`
    );
  }

  // Create or update a record.
  async function saveItem(event) {
    event.preventDefault();

    if (!section || saving) return;

    if (
      active === "Missions" &&
      form.launchDate &&
      form.plannedEndDate &&
      form.plannedEndDate < form.launchDate
    ) {
      setError("Planned end date cannot be before the launch date.");
      return;
    }

    setError("");
    setNotice("");
    setSaving(true);

    try {
      const url = `${API}${section.endpoint}${editing !== null ? `/${editing}` : ""
        }`;


      const payload = {
        ...form,
      };

      if (active === "Satellites") {
        const numericFields = [
          "altitudeKm",
          "inclinationDeg",
          "raanDeg",
          "orbitPhaseDeg",
          "orbitSpeedMultiplier",
        ];

        numericFields.forEach((field) => {
          payload[field] =
            form[field] === "" || form[field] == null
              ? null
              : Number(form[field]);
        });
      }

      if (active === "Missions" || active === "Ground Stations") {
        payload.latitude =
          form.latitude === "" || form.latitude == null
            ? null
            : Number(form.latitude);

        payload.longitude =
          form.longitude === "" || form.longitude == null
            ? null
            : Number(form.longitude);
      }

      const response = await fetch(url, {
        method: editing !== null ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      setModal(false);

      const recordLabel =
        active === "Missions"
          ? "Mission"
          : active === "Satellites"
            ? "Satellite"
            : "Ground station";

      setNotice(
        `${recordLabel} ${editing !== null ? "updated" : "created"
        } successfully.`
      );

      if (active === "Overview") {
        await loadAllData();
      } else {
        await loadSectionData(active);
      }
    } catch (err) {
      setError(err.message || "Unable to save the record.");
    } finally {
      setSaving(false);
    }
  }

  // Delete a record.
  async function deleteItem(item) {
    if (
      !section ||
      !window.confirm(
        `Delete "${item[section.nameField]}" ? This action cannot be undone.`
      )
    ) {
      return;
    }

    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API}${section.endpoint}/${item.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      setNotice("Record deleted successfully.");
      await loadSectionData(active);
    } catch (err) {
      setError(err.message || "Unable to delete the record.");
    }
  }

  function navigate(name) {
    setDetailsMission(null);
    setModal(false);
    setActive(name);
    setNotice("");
    setError("");
  }

  // Planned duration, calculated from date-only values.
  function getPlannedDuration(mission) {
    const { launchDate, plannedEndDate } = mission;

    if (!launchDate || !plannedEndDate || plannedEndDate < launchDate) {
      return "Not available";
    }

    const start = new Date(`${launchDate.slice(0, 10)}T00:00:00Z`);
    const end = new Date(`${plannedEndDate.slice(0, 10)}T00:00:00Z`);

    const days = Math.round((end.getTime() - start.getTime()) / 86400000);

    return `${days} ${days === 1 ? "day" : "days"}`;
  }
  if (new URLSearchParams(window.location.search).has("cesiumTest")) {
    return <CesiumGlobeTest />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✦</div>

          <div className="brand-copy">
            <h2>ORBITAL</h2>
            <span>MISSION SYSTEMS</span>
          </div>
        </div>

        <div className="side-label">WORKSPACE</div>

        <nav className="navigation">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${active === item.name ? "selected" : ""
                }`}
              onClick={() => navigate(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>

              {active === item.name && (
                <span className="nav-arrow">›</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-indicator">
            <span className={`pulse-dot ${error ? "offline" : ""}`} />

            <div>
              <strong>MISSION SYSTEM</strong>
              <span>
                {error
                  ? "Connection issue"
                  : loading
                    ? "Syncing records…"
                    : "Workspace ready"}
              </span>
            </div>
          </div>

          <div className="sidebar-version">
            SPACE OPS PLATFORM · V2.0
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="crumb-separator">/</span>
            <strong>{active}</strong>
          </div>

          <div className="topbar-right">
            <span
              className={`live-indicator ${error ? "offline-text" : ""}`}
            >
              <i />
              {error
                ? "API DISCONNECTED"
                : loading
                  ? "SYNCING DATA"
                  : "SYSTEM ONLINE"}
            </span>

            <div className="avatar">SO</div>
          </div>
        </header>

        <div className="page-content">
          {notice && (
            <div className="toast success-toast" role="status">
              <span>✓</span>
              {notice}

              <button
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <div className="toast error-toast" role="alert">
              <span>!</span>
              {error}

              <button
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {isOverview ? (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow">
                    SPACE OPERATIONS / COMMAND CENTER
                  </div>

                  <h1>Mission Overview</h1>

                  <p className="subtitle">
                    A unified view of missions, satellite assets, and ground
                    infrastructure.
                  </p>
                </div>

                <button
                  className="secondary-button"
                  onClick={loadAllData}
                  disabled={loading}
                >
                  <span className={loading ? "spin" : ""}>↻</span>
                  Refresh data
                </button>
              </section>

              <section className="hero-panel">
                <div className="hero-content">
                  <div className="hero-kicker">
                    <span>✦</span> OPERATIONS SUMMARY
                  </div>

                  <h2>
                    Your space operations,
                    <br />
                    <em>at a glance.</em>
                  </h2>

                  <p>
                    Monitor registered assets and mission activity from one
                    central workspace.
                  </p>

                  <button
                    className="hero-button"
                    onClick={() => navigate("Missions")}
                  >
                    Open mission registry <span>→</span>
                  </button>
                </div>

                <div className="orbit-art" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="orbit orbit-three" />
                  <div className="planet">
                    <span />
                  </div>
                  <div className="orbit-satellite satellite-one">✦</div>
                  <div className="orbit-satellite satellite-two">◆</div>
                </div>
                <div className="hero-bottom">
                  <span>
                    <i /> LIVE API DATA
                  </span>
                  <span>SPACE OPS / OVERVIEW</span>
                </div>
              </section>

              {/* INTERACTIVE SPACE MAP */}
              <SpaceMap
                compact
                missions={allData.Missions || []}
                groundStations={allData["Ground Stations"] || []}
                satellites={allData.Satellites || []}
                onOpenFullMap={() => navigate("Space Map")}
              />

              <section className="stats-grid overview-stats">
                <StatCard
                  label="TOTAL MISSIONS"
                  value={loading ? "…" : totals.missions}
                  foot={`${totals.plannedMissions} planned or scheduled`}
                  icon="◉"
                />

                <StatCard
                  label="ACTIVE SATELLITES"
                  value={loading ? "…" : totals.activeSatellites}
                  foot={`${totals.satellites} satellites registered`}
                  icon="◎"
                  tone="green"
                />

                <StatCard
                  label="GROUND STATIONS"
                  value={loading ? "…" : totals.stations}
                  foot={`${totals.activeStations} currently active`}
                  icon="⌘"
                  tone="violet"
                />

                <StatCard
                  label="ACTIVE MISSIONS"
                  value={loading ? "…" : totals.activeMissions}
                  foot="Missions marked active"
                  icon="↗"
                  tone="amber"
                />
              </section>

              <section className="overview-grid">
                <article className="panel">
                  <div className="panel-heading">
                    <div>
                      <div className="eyebrow">MISSION ANALYTICS</div>
                      <h2>Mission status distribution</h2>
                      <p>Current status across registered missions.</p>
                    </div>

                    <span className="panel-icon">▥</span>
                  </div>

                  {loading ? (
                    <div className="chart-empty">
                      Loading mission analytics…
                    </div>
                  ) : totals.missions === 0 ? (
                    <div className="chart-empty">
                      No mission records yet. Create a mission to see analytics.
                    </div>
                  ) : (
                    <div className="status-chart">
                      {missionStatuses.map((item) => {
                        const percent = Math.round(
                          (item.count / Math.max(totals.missions, 1)) * 100
                        );

                        return (
                          <div className="bar-row" key={item.status}>
                            <div className="bar-label">
                              <span
                                className={`legend-dot ${statusClass(
                                  item.status
                                )}`}
                              />

                              <span>{item.status}</span>
                              <strong>{item.count}</strong>
                            </div>

                            <div className="bar-track">
                              <div
                                className={`bar-fill ${statusClass(
                                  item.status
                                )}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="panel-foot">
                    <span>MISSION RECORDS</span>
                    <strong>{totals.missions} total</strong>
                  </div>
                </article>

                <article className="panel">
                  <div className="panel-heading">
                    <div>
                      <div className="eyebrow">ASSET REGISTRY</div>
                      <h2>Platform resources</h2>
                      <p>Records available in each module.</p>
                    </div>

                    <span className="panel-icon">▤</span>
                  </div>

                  <div className="asset-list">
                    {[
                      {
                        name: "Missions",
                        count: totals.missions,
                        icon: "◉",
                        tone: "blue",
                      },
                      {
                        name: "Satellites",
                        count: totals.satellites,
                        icon: "◎",
                        tone: "green",
                      },
                      {
                        name: "Ground Stations",
                        count: totals.stations,
                        icon: "⌘",
                        tone: "violet",
                      },
                    ].map((item) => (
                      <button
                        className="asset-row"
                        key={item.name}
                        onClick={() => navigate(item.name)}
                      >
                        <span className={`asset-icon ${item.tone}`}>
                          {item.icon}
                        </span>

                        <span className="asset-name">
                          {item.name}
                          <small>Open registry</small>
                        </span>

                        <strong>{loading ? "…" : item.count}</strong>
                        <span className="asset-arrow">→</span>
                      </button>
                    ))}
                  </div>

                  <div className="panel-foot">
                    <span>DATA SOURCE</span>
                    <strong>Spring Boot API</strong>
                  </div>
                </article>
              </section>

              <section className="panel recent-panel">
                <div className="panel-heading recent-heading">
                  <div>
                    <div className="eyebrow">MISSION REGISTRY</div>
                    <h2>Recent missions</h2>
                    <p>Click a mission to open its full details.</p>
                  </div>

                  <button
                    className="text-link"
                    onClick={() => navigate("Missions")}
                  >
                    View all missions <span>→</span>
                  </button>
                </div>

                {recentMissions.length === 0 ? (
                  <div className="recent-empty">
                    {loading
                      ? "Loading missions…"
                      : "No missions registered yet."}
                  </div>
                ) : (
                  <div className="recent-table-wrap">
                    <table className="recent-table">
                      <thead>
                        <tr>
                          <th>MISSION</th>
                          <th>CODE</th>
                          <th>DESTINATION</th>
                          <th>LAUNCH DATE</th>
                          <th>PLANNED END</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>

                      <tbody>
                        {recentMissions.map((mission) => (
                          <tr
                            key={mission.id}
                            className="clickable-mission-row"
                            onClick={() => openMissionDetails(mission)}
                            title="Click to view mission details"
                          >
                            <td className="mission-name-cell">
                              <button
                                type="button"
                                className="mission-name-button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openMissionDetails(mission);
                                }}
                              >
                                <span className="table-planet">✦</span>
                                {mission.missionName || "Unnamed mission"}
                              </button>
                            </td>

                            <td>{mission.missionCode || "—"}</td>
                            <td>{mission.destination || "—"}</td>
                            <td>{formatDate(mission.launchDate)}</td>
                            <td>{formatDate(mission.plannedEndDate)}</td>

                            <td>
                              <StatusBadge value={mission.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          ) : isSpaceMap ? (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow">
                    SPACE OPERATIONS / GEOSPATIAL VIEW
                  </div>

                  <h1>Space Map</h1>

                  <p className="subtitle">
                    Explore registered missions, satellites, and ground-station
                    locations on an interactive world map.
                  </p>
                </div>

                <button
                  className="secondary-button"
                  onClick={loadAllData}
                  disabled={loading}
                >
                  <span className={loading ? "spin" : ""}>↻</span>
                  Refresh data
                </button>
              </section>

              <SpaceMap
                missions={allData.Missions || []}
                groundStations={allData["Ground Stations"] || []}
                satellites={allData.Satellites || []}
              />
            </>
          ) : (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow">
                    SPACE OPERATIONS / REGISTRY
                  </div>

                  <h1>{section.title}</h1>
                  <p className="subtitle">{section.subtitle}</p>
                </div>

                <button className="primary-button" onClick={openAdd}>
                  <span>＋</span>{" "}
                  Add{" "}
                  {active === "Missions"
                    ? "Mission"
                    : active === "Satellites"
                      ? "Satellite"
                      : "Station"}
                </button>
              </section>

              <section className="stats-grid module-stats">
                <StatCard
                  label="TOTAL RECORDS"
                  value={loading ? "…" : data.length}
                  foot={`Registered ${active.toLowerCase()}`}
                  icon="▤"
                />

                <StatCard
                  label="ACTIVE OPERATIONS"
                  value={loading ? "…" : activeCount}
                  foot="Records marked active"
                  icon="◉"
                  tone="green"
                />

                <StatCard
                  label="SYSTEM STATUS"
                  value={error ? "Offline" : loading ? "Syncing" : "Connected"}
                  foot="Backend API connection"
                  icon="⌁"
                  tone={error ? "amber" : "green"}
                />
              </section>

              <section className="panel registry-panel">
                <div className="panel-heading registry-heading">
                  <div>
                    <div className="eyebrow">DATA MANAGEMENT</div>
                    <h2>{active} registry</h2>
                    <p>
                      Create, update, search, and maintain records in the
                      platform database.
                    </p>
                  </div>

                  <button
                    className="secondary-button"
                    onClick={() => loadSectionData(active)}
                    disabled={loading}
                  >
                    <span className={loading ? "spin" : ""}>↻</span>
                    Refresh
                  </button>
                </div>

                <div className="table-toolbar">
                  <div className="search-box">
                    <span>⌕</span>

                    <input
                      placeholder={`Search ${active.toLowerCase()} by any field…`}
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />

                    {search && (
                      <button
                        className="clear-search"
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <div className="toolbar-filters">
                    <label className="filter-select">
                      <span>Status</span>

                      <select
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(event.target.value)
                        }
                      >
                        <option value="ALL">All statuses</option>

                        {[
                          ...new Set(
                            data
                              .map((item) => normalizeStatus(item.status))
                              .filter(Boolean)
                          ),
                        ]
                          .sort()
                          .map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                      </select>
                    </label>

                    <label className="filter-select">
                      <span>Sort by</span>

                      <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                      >
                        <option value="default">Default order</option>
                        <option value={section.nameField}>Name</option>
                        <option value={section.codeField}>Code</option>
                        <option value="status">Status</option>
                        <option value="launchDate">Launch date</option>
                      </select>
                    </label>
                  </div>

                  <span className="record-count">
                    {filtered.length} RECORD
                    {filtered.length === 1 ? "" : "S"}
                  </span>
                </div>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        {section.columns.map(([, label]) => (
                          <th key={label}>{label}</th>
                        ))}
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan={section.columns.length + 1}
                            className="empty-state"
                          >
                            <span className="loading-spinner" />
                            Loading records…
                          </td>
                        </tr>
                      ) : filtered.length === 0 ? (
                        <tr>
                          <td
                            colSpan={section.columns.length + 1}
                            className="empty-state"
                          >
                            <div className="empty-icon">⌁</div>

                            <strong>
                              {error ? "Data unavailable" : "No records found"}
                            </strong>

                            <span>
                              {error
                                ? "Check that the Java backend is running."
                                : search || statusFilter !== "ALL"
                                  ? "Try changing your search or filters."
                                  : "Add your first record to get started."}
                            </span>

                            {!error &&
                              !search &&
                              statusFilter === "ALL" && (
                                <button
                                  className="text-button"
                                  onClick={openAdd}
                                >
                                  ＋ Create record
                                </button>
                              )}
                          </td>
                        </tr>
                      ) : (
                        filtered.map((item) => (
                          <tr key={item.id}>
                            {section.columns.map(([key]) => (
                              <td key={key}>
                                {key === "status" ? (
                                  <StatusBadge value={item[key]} />
                                ) : key === "launchDate" ||
                                  key === "plannedEndDate" ? (
                                  formatDate(item[key])
                                ) : (
                                  item[key] || "—"
                                )}
                              </td>
                            ))}

                            <td>
                              <div className="action-buttons">
                                {active === "Missions" && (
                                  <button
                                    type="button"
                                    className="icon-button details-button"
                                    title="View mission details"
                                    onClick={() => openMissionDetails(item)}
                                  >
                                    ↗
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="icon-button edit"
                                  title="Edit record"
                                  onClick={() => openEdit(item)}
                                >
                                  ✎
                                </button>

                                <button
                                  type="button"
                                  className="icon-button delete"
                                  title="Delete record"
                                  onClick={() => deleteItem(item)}
                                >
                                  ×
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="table-footer">
                  <span>
                    Records are retrieved from the connected backend API.
                  </span>

                  <span>
                    SPACE OPS <b>●</b>
                  </span>
                </div>
              </section>
            </>
          )}

          <footer className="page-footer">
            <span>SPACE MISSION MANAGEMENT PLATFORM</span>
            <span>BUILT FOR SPACE OPERATIONS · V2.0</span>
          </footer>
        </div>
      </main>

      {/* MISSION DETAILS SIDE PANEL */}
      {detailsMission && (
        <div
          className="details-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDetailsMission(null);
            }
          }}
        >
          <aside
            className="mission-details-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mission-details-title"
          >
            <div className="details-header">
              <div>
                <div className="eyebrow">MISSION INTELLIGENCE</div>
                <h2 id="mission-details-title">Mission Details</h2>
                <p>Mission profile and operational information.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setDetailsMission(null)}
                aria-label="Close mission details"
              >
                ×
              </button>
            </div>

            <div className="details-hero">
              <div className="details-hero-icon">✦</div>

              <div>
                <span className="details-label">MISSION NAME</span>

                <h3>
                  {detailsMission.missionName || "Unnamed mission"}
                </h3>

                <span className="details-code">
                  {detailsMission.missionCode || "No mission code"}
                </span>
              </div>
            </div>

            <div className="details-status-row">
              <span>Current status</span>
              <StatusBadge value={detailsMission.status} />
            </div>

            <div className="details-section">
              <div className="eyebrow">MISSION PROFILE</div>

              <div className="details-field">
                <span>Destination</span>
                <strong>
                  {detailsMission.destination || "Not specified"}
                </strong>
              </div>

              <div className="details-field">
                <span>Launch date</span>
                <strong>{formatDate(detailsMission.launchDate)}</strong>
              </div>

              <div className="details-field">
                <span>Planned end date</span>
                <strong>{formatDate(detailsMission.plannedEndDate)}</strong>
              </div>

              <div className="details-field">
                <span>Planned duration</span>
                <strong>{getPlannedDuration(detailsMission)}</strong>
              </div>

              <div className="details-field">
                <span>Record ID</span>
                <strong>{detailsMission.id ?? "—"}</strong>
              </div>
            </div>

            <div className="details-section description-section">
              <div className="eyebrow">MISSION DESCRIPTION</div>

              <p>
                {detailsMission.description?.trim() ||
                  "No mission description has been provided."}
              </p>
            </div>
            {/* MISSION–SATELLITE ASSIGNMENT */}
            <div className="details-section assignment-section">
              <div className="eyebrow">ASSET MANAGEMENT</div>

              <h3 className="assignment-heading">
                Assigned Satellites
              </h3>

              <p className="assignment-description">
                Manage the satellite assets associated with this mission.
              </p>

              {assignmentError && (
                <div className="form-error" role="alert">
                  {assignmentError}
                </div>
              )}

              {assignmentNotice && (
                <div className="assignment-success" role="status">
                  {assignmentNotice}
                </div>
              )}

              <div className="assignment-controls">
                <select
                  aria-label="Select a satellite"
                  value={selectedSatelliteId}
                  onChange={(event) =>
                    setSelectedSatelliteId(event.target.value)
                  }
                  disabled={assignmentLoading}
                >
                  <option value="">Select a satellite</option>

                  {allData.Satellites
                    .filter(
                      (satellite) =>
                        !assignedSatellites.some(
                          (assigned) => assigned.id === satellite.id
                        )
                    )
                    .map((satellite) => (
                      <option key={satellite.id} value={satellite.id}>
                        {satellite.satelliteName} ({satellite.satelliteCode})
                      </option>
                    ))}
                </select>

                <button
                  type="button"
                  className="primary-button"
                  onClick={assignSatellite}
                  disabled={!selectedSatelliteId || assignmentLoading}
                >
                  {assignmentLoading ? "Please wait..." : "+ Assign"}
                </button>
              </div>

              <div className="assigned-satellite-list">
                {assignmentLoading && assignedSatellites.length === 0 ? (
                  <p className="assignment-empty">
                    Loading assigned satellites...
                  </p>
                ) : assignedSatellites.length === 0 ? (
                  <p className="assignment-empty">
                    No satellites assigned to this mission yet.
                  </p>
                ) : (
                  assignedSatellites.map((satellite) => (
                    <div
                      className="assigned-satellite-card"
                      key={satellite.id}
                    >
                      <div className="assigned-satellite-icon">◎</div>

                      <div className="assigned-satellite-info">
                        <strong>{satellite.satelliteName}</strong>

                        <span>
                          {satellite.satelliteCode} ·{" "}
                          {satellite.orbitType || "Orbit unspecified"}
                        </span>

                        <StatusBadge value={satellite.status} />
                      </div>

                      <button
                        type="button"
                        className="icon-button delete"
                        title={`Remove ${satellite.satelliteName} from this mission`}
                        aria-label={`Remove ${satellite.satelliteName} from this mission`}
                        onClick={() =>
                          removeSatelliteAssignment(satellite.id)
                        }
                        disabled={assignmentLoading}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="details-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setDetailsMission(null)}
              >
                Close details
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  openEditInSection("Missions", detailsMission)
                }
              >
                ✎ Edit mission
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* CREATE / EDIT FORM */}
      {modal && section && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModal(false);
            }
          }}
        >
          <div className="modal">
            <div className="modal-heading">
              <div>
                <div className="eyebrow">
                  {editing !== null
                    ? "UPDATE EXISTING RECORD"
                    : "CREATE NEW RECORD"}
                </div>

                <h2>
                  {editing !== null ? "Edit " : "Add "}
                  {active === "Ground Stations"
                    ? "Ground Station"
                    : active.slice(0, -1)}
                </h2>

                <p>Enter the details below and save the record.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => !saving && setModal(false)}
                disabled={saving}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveItem}>
              <div className="form-grid">
                {section.fields.map((field) => (
                  <label
                    className={field.fullWidth ? "full-width" : ""}
                    key={field.name}
                  >
                    <span>
                      {field.label}
                      {field.required && " *"}
                    </span>

                    {field.options ? (
                      <select
                        required={field.required}
                        value={form[field.name]}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            [field.name]: event.target.value,
                          })
                        }
                      >
                        <option value="">Select status</option>

                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.name === "description" ? (
                      <textarea
                        rows="3"
                        maxLength={field.maxLength}
                        value={form[field.name]}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            [field.name]: event.target.value,
                          })
                        }
                      />
                    ) : (
                      <input
                        type={field.type || "text"}
                        required={field.required}
                        maxLength={field.maxLength}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={form[field.name] ?? ""}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            [field.name]: event.target.value,
                          })
                        }
                      />
                    )}
                  </label>
                ))}
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : editing !== null
                      ? "Save changes"
                      : "Create record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
