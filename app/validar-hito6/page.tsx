"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  VALIDATION_SECTIONS,
  calculateValidationStats,
  generateValidationConceptText,
  type ChecklistItemState,
  type ProjectInfo,
} from "../../lib/validar-hito6-data";
import { generateOficioDocxBlob } from "../../lib/docx-generator";

export default function ValidarHito6Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    municipio: "",
    operador: "",
    contrato: "",
    fecha: new Date().toISOString().split("T")[0],
  });

  const [state, setState] = useState<Record<string, ChecklistItemState>>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Dialog States
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showConceptModal, setShowConceptModal] = useState(false);
  const [conceptoText, setConceptoText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Check auth session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setAuthenticated(true);
            loadValidationData();
          } else {
            router.push("/");
          }
        } else {
          router.push("/");
        }
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  async function loadValidationData() {
    try {
      const res = await fetch("/api/validar-hito6");
      if (res.ok) {
        const data = await res.json();
        if (data.projectInfo) {
          setProjectInfo((prev) => ({ ...prev, ...data.projectInfo }));
        }
        if (data.checklistState) {
          setState(data.checklistState);
        }
      }
    } catch (e) {
      console.error("Error cargando estado de validación:", e);
    }
  }

  async function handleSave() {
    setSaveStatus("Guardando...");
    try {
      const res = await fetch("/api/validar-hito6", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectInfo, checklistState: state }),
      });
      if (res.ok) {
        setSaveStatus("¡Guardado correctamente!");
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus("Error al guardar");
      }
    } catch {
      setSaveStatus("Error de red");
    }
  }

  const stats = calculateValidationStats(state);

  const toggleItem = (secTitle: string, itemTitle: string) => {
    const key = `${secTitle}::${itemTitle}`;
    setState((prev) => {
      const current = prev[key] || { checked: false };
      return {
        ...prev,
        [key]: { ...current, checked: !current.checked },
      };
    });
  };

  const toggleSubitem = (secTitle: string, itemTitle: string, subTitle: string) => {
    const parentKey = `${secTitle}::${itemTitle}`;
    const subKey = `${parentKey}::${subTitle}`;
    setState((prev) => {
      const parentState = prev[parentKey] || { checked: false, subitems: {} };
      const currentSubs = parentState.subitems || {};
      const newSubs = { ...currentSubs, [subKey]: !currentSubs[subKey] };
      return {
        ...prev,
        [parentKey]: {
          ...parentState,
          subitems: newSubs,
        },
      };
    });
  };

  const handleOpenConcept = () => {
    const text = generateValidationConceptText(projectInfo, state);
    setConceptoText(text);
    setShowConceptModal(true);
  };

  async function handleDownloadDocx() {
    setSaveStatus("Generando Word...");
    try {
      const blob = await generateOficioDocxBlob(projectInfo, state);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `OFCANT-CATS_${(projectInfo.municipio || "PROYECTO").toUpperCase()}_CONCEPTO_HITO_06.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setSaveStatus("¡Word descargado!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error("Error al generar Word:", err);
      setSaveStatus("Error al generar Word");
    }
  }

  const handleDownloadTxt = () => {
    const blob = new Blob([conceptoText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `concepto_validacion_hito6_${projectInfo.municipio || "proyecto"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify({ projectInfo, checklistState: state }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checklist_state_hito6_${projectInfo.municipio || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.projectInfo) setProjectInfo(imported.projectInfo);
        if (imported.checklistState) setState(imported.checklistState);
        alert("¡Estado importado con éxito!");
      } catch {
        alert("Error al leer el archivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm("¿Estás seguro de que deseas restablecer todos los ítems de validación?")) {
      setState({});
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="login-shell">
        <div className="login-card" style={{ textAlign: "center" }}>
          <h2>Cargando Módulo de Validación...</h2>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="app-shell">
      {/* Navigation Topbar */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div>
            <p className="eyebrow">MÓDULO DE AUDITORÍA Y ANEXOS</p>
            <h1>Validación de Estructura HITO 6</h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav style={{ display: "flex", gap: "8px" }}>
          <Link href="/" className="btn-icon">
            📋 Checklist General
          </Link>
          <Link href="/validar-hito6" className="btn-icon btn-primary">
            📑 Validación Anexos HITO 6
          </Link>
        </nav>

        {/* Actions */}
        <div className="topbar-actions">
          {saveStatus && <span className="save-message">{saveStatus}</span>}
          <button onClick={handleSave} className="btn-icon btn-primary">
            💾 Guardar Estado
          </button>
          <button onClick={handleOpenConcept} className="btn-icon">
            📝 Generar Concepto
          </button>
          <button onClick={handleExportJson} className="btn-icon">
            📥 Exportar JSON
          </button>
          <label className="btn-icon" style={{ cursor: "pointer" }}>
            📤 Importar JSON
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden-input" />
          </label>
          <button onClick={handleReset} className="btn-icon btn-danger-ghost">
            🔄 Restablecer
          </button>
          <button onClick={handleLogout} className="btn-icon">
            🚪 Salir
          </button>
        </div>
      </header>

      {/* Project Info Banner */}
      <section className="score-panel main-score" style={{ marginBottom: "16px", padding: "18px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              INFORMACIÓN DEL PROYECTO AUDITADO
            </span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", margin: "4px 0 0", color: "var(--ink)" }}>
              {projectInfo.municipio || "Municipio no especificado"}{" "}
              <span style={{ fontSize: "1rem", fontWeight: "600", color: "var(--muted)" }}>
                — Operador: {projectInfo.operador || "No asignado"} | Contrato: {projectInfo.contrato || "N/A"}
              </span>
            </h2>
            <small style={{ color: "var(--muted)", fontWeight: "500" }}>Fecha del Documento: {projectInfo.fecha || "Sin fecha"}</small>
          </div>
          <button onClick={() => setShowInfoModal(true)} className="btn-icon btn-primary">
            ✏️ Editar Datos del Proyecto
          </button>
        </div>
      </section>

      {/* KPI & Compliance Band */}
      <section className="dashboard-band" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr", marginBottom: "20px" }}>
        {/* Main Score & Concept */}
        <div className="score-panel main-score">
          <div className="score-header">
            <span>CONCEPTO DE VALIDACIÓN</span>
            <span
              className={`stage-chip ${
                stats.concept === "CUMPLE"
                  ? "stage-complete"
                  : stats.concept === "CUMPLE PARCIALMENTE"
                  ? "stage-partial"
                  : "stage-failed"
              }`}
              style={{ fontSize: "0.85rem", padding: "4px 12px" }}
            >
              {stats.concept}
            </span>
          </div>
          <div className="score-value">{stats.percentage}%</div>
          <div className="progress-track">
            <span style={{ "--progress": `${stats.percentage}%` } as React.CSSProperties}></span>
          </div>
        </div>

        <div className="score-panel">
          <div className="score-header">
            <span>ÍTEMS VERIFICADOS</span>
          </div>
          <div className="score-value">{stats.checkedItems}</div>
          <div className="score-sub">de {stats.totalItems} ítems totales</div>
        </div>

        <div className="score-panel">
          <div className="score-header">
            <span>CRITERIO DE CUMPLIMIENTO</span>
          </div>
          <div className="score-sub" style={{ fontSize: "0.8rem", marginTop: "12px", lineHeight: "1.5" }}>
            • <b>0% - 50%</b>: NO CUMPLE<br />
            • <b>50.1% - 87.5%</b>: CUMPLE PARCIALMENTE<br />
            • <b>87.6% - 100%</b>: CUMPLE
          </div>
        </div>

        <div className="score-panel">
          <div className="score-header">
            <span>BÚSQUEDA RÁPIDA</span>
          </div>
          <div className="search-input-wrapper" style={{ marginTop: "12px" }}>
            <input
              type="text"
              placeholder="Filtrar por sección o entregable..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Validation Sections Grid */}
      <div style={{ display: "grid", gap: "16px" }}>
        {VALIDATION_SECTIONS.filter((sec) =>
          searchQuery === ""
            ? true
            : sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              sec.items.some((i) => i.item.toLowerCase().includes(searchQuery.toLowerCase()))
        ).map((sec) => {
          let secChecked = 0;
          let secTotal = 0;
          sec.items.forEach((itemObj) => {
            secTotal += 1;
            const key = `${sec.title}::${itemObj.item}`;
            if (state[key]?.checked) secChecked += 1;
            if (itemObj.subitems) {
              itemObj.subitems.forEach((sub) => {
                secTotal += 1;
                const subKey = `${key}::${sub}`;
                if (state[key]?.subitems?.[subKey] || state[subKey]?.checked) secChecked += 1;
              });
            }
          });

          const secPct = secTotal > 0 ? Math.round((secChecked / secTotal) * 100) : 0;

          return (
            <div key={sec.title} className="detail-panel" style={{ background: "var(--surface)" }}>
              <div className="section-heading" style={{ marginBottom: "12px", borderBottom: "1px solid var(--line)", paddingBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    className={`count-badge ${
                      secPct === 100 ? "stage-complete" : secPct > 0 ? "stage-partial" : "stage-pending"
                    }`}
                    style={{ minWidth: "50px", height: "28px", fontSize: "0.85rem" }}
                  >
                    {secPct}%
                  </span>
                  <h2>{sec.title}</h2>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: "600" }}>
                  {secChecked} / {secTotal} ítems
                </span>
              </div>

              <div style={{ display: "grid", gap: "10px", paddingLeft: "8px" }}>
                {sec.items.map((itemObj) => {
                  const key = `${sec.title}::${itemObj.item}`;
                  const isChecked = !!state[key]?.checked;

                  if (itemObj.type === "section") {
                    return (
                      <div
                        key={itemObj.item}
                        style={{
                          fontWeight: "700",
                          color: "var(--primary)",
                          fontSize: "0.9rem",
                          padding: "4px 0",
                          borderBottom: "1px stroke var(--line)",
                        }}
                      >
                        📁 {itemObj.item}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={itemObj.item}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--radius-md)",
                        background: isChecked ? "#f0f9ff" : "var(--surface-solid)",
                        border: isChecked ? "1px solid var(--primary)" : "1px solid var(--line)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          cursor: "pointer",
                          fontWeight: isChecked ? "700" : "600",
                          color: isChecked ? "var(--ink)" : "var(--ink-secondary)",
                          fontSize: "0.9rem",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(sec.title, itemObj.item)}
                          style={{ width: "18px", height: "18px", marginTop: "2px", accentColor: "var(--primary)" }}
                        />
                        <div style={{ flex: 1 }}>
                          <span>{itemObj.item}</span>
                          {itemObj.exts && itemObj.exts.length > 0 && (
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "0.72rem",
                                background: "var(--slate-soft)",
                                color: "var(--slate)",
                                padding: "2px 8px",
                                borderRadius: "var(--radius-full)",
                                border: "1px solid var(--line)",
                              }}
                            >
                              Ext: {itemObj.exts.join(", ")}
                            </span>
                          )}
                        </div>
                      </label>

                      {/* Sub-items if available */}
                      {itemObj.subitems && itemObj.subitems.length > 0 && (
                        <div style={{ marginTop: "10px", paddingLeft: "32px", display: "grid", gap: "6px" }}>
                          {itemObj.subitems.map((sub) => {
                            const subKey = `${key}::${sub}`;
                            const isSubChecked = !!(state[key]?.subitems?.[subKey] || state[subKey]?.checked);
                            return (
                              <label
                                key={sub}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  cursor: "pointer",
                                  fontSize: "0.825rem",
                                  color: isSubChecked ? "var(--primary-hover)" : "var(--muted)",
                                  fontWeight: isSubChecked ? "700" : "500",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSubChecked}
                                  onChange={() => toggleSubitem(sec.title, itemObj.item, sub)}
                                  style={{ accentColor: "var(--primary)" }}
                                />
                                <span>{sub}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Project Info Modal */}
      {showInfoModal && (
        <div className="login-shell" style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15, 23, 42, 0.6)" }}>
          <div className="login-card" style={{ width: "520px" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "1.3rem", fontWeight: "800" }}>Información del Proyecto</h2>
            <div className="login-form">
              <label>
                <span>Municipio</span>
                <input
                  type="text"
                  value={projectInfo.municipio}
                  onChange={(e) => setProjectInfo({ ...projectInfo, municipio: e.target.value })}
                  placeholder="Nombre del Municipio"
                />
              </label>
              <label>
                <span>Operador</span>
                <input
                  type="text"
                  value={projectInfo.operador}
                  onChange={(e) => setProjectInfo({ ...projectInfo, operador: e.target.value })}
                  placeholder="Nombre del Operador"
                />
              </label>
              <label>
                <span>Contrato</span>
                <input
                  type="text"
                  value={projectInfo.contrato}
                  onChange={(e) => setProjectInfo({ ...projectInfo, contrato: e.target.value })}
                  placeholder="Número de Contrato"
                />
              </label>
              <label>
                <span>Fecha del Documento</span>
                <input
                  type="date"
                  value={projectInfo.fecha}
                  onChange={(e) => setProjectInfo({ ...projectInfo, fecha: e.target.value })}
                />
              </label>
              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button type="button" onClick={() => setShowInfoModal(false)} className="btn-primary" style={{ flex: 1 }}>
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Concept Modal */}
      {showConceptModal && (
        <div className="login-shell" style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(15, 23, 42, 0.6)" }}>
          <div className="login-card" style={{ width: "800px", maxWidth: "90vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800" }}>📝 Concepto de Validación Técnica</h2>
              <button onClick={() => setShowConceptModal(false)} className="btn-icon">
                ✖ Cerrar
              </button>
            </div>
            <textarea
              readOnly
              value={conceptoText}
              style={{
                width: "100%",
                height: "400px",
                fontFamily: "monospace",
                fontSize: "0.85rem",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--line)",
                background: "#0f172a",
                color: "#38bdf8",
              }}
            />
            <div style={{ display: "flex", gap: "12px", marginTop: "16px", justifyContent: "flex-end" }}>
              <button onClick={handleDownloadTxt} className="btn-icon btn-primary">
                💾 Descargar Archivo TXT
              </button>
              <button onClick={() => setShowConceptModal(false)} className="btn-icon">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
