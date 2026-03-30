/* shared.js
   Utilidades comunes para indice.html y reporte.html
*/
const Shared = (() => {
  const STORAGE_KEY = "pizarronData";

  // Días y Deptos
  const DAYS = ["Lun","Mar","Mié","Jue","Vie","Sáb"];
  const DEPTOS = { 4:"Pespunte", 5:"Montado", 6:"Acabado", 7:"Adorno" };
  const DEPTOS_IDS = [4,5,6,7];

  // ---------- helpers básicos ----------
  const toInt = (v) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
  };

  const toFloat = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  const toTime = (v) => {
    // expected HH:mm
    if(!v) return "";
    const s = String(v).trim();
    if(/^\d{2}:\d{2}$/.test(s)) return s;
    return "";
  };

  const escapeHtml = (s) => String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

  // ---------- estado ----------
  function createEmptyState(){
    const base = {
      plantaId: 1,
      produccion: { 4:[0,0,0,0,0,0], 5:[0,0,0,0,0,0], 6:[0,0,0,0,0,0], 7:[0,0,0,0,0,0] },
      faltas: [0,0,0,0,0,0],
      calidad: [0,0,0,0,0,0],
      defectos: { 4:["","","","","",""], 5:["","","","","",""], 6:["","","","","",""], 7:["","","","","",""] },
      arranques: { 4:["08:00","08:00","08:00","08:00","08:00","08:00"],
                  5:["08:00","08:00","08:00","08:00","08:00","08:00"],
                  6:["08:00","08:00","08:00","08:00","08:00","08:00"],
                  7:["08:00","08:00","08:00","08:00","08:00","08:00"] },
      paros: [],
      incidentes: [],
      mantto: { incidencias: [], autonomoPorc: {4:0,5:0,6:0,7:0} },
      avisos: [],
      acuerdos: []
    };
    return base;
  }

  function normalizeState(s){
    const st = createEmptyState();
    if(!s || typeof s !== "object") return st;

    st.plantaId = toInt(s.plantaId) || 1;

    // Producción
    DEPTOS_IDS.forEach(id=>{
      const arr = (s.produccion && s.produccion[id]) ? s.produccion[id] : null;
      st.produccion[id] = Array.isArray(arr) ? arr.map(toInt).slice(0,6).concat([0,0,0,0,0,0]).slice(0,6) : [0,0,0,0,0,0];
    });

    // Faltas / Calidad
    if(Array.isArray(s.faltas)) st.faltas = s.faltas.map(toInt).slice(0,6).concat([0,0,0,0,0,0]).slice(0,6);
    if(Array.isArray(s.calidad)) st.calidad = s.calidad.map(toFloat).slice(0,6).concat([0,0,0,0,0,0]).slice(0,6);

    // Defectos
    DEPTOS_IDS.forEach(id=>{
      const arr = (s.defectos && s.defectos[id]) ? s.defectos[id] : null;
      st.defectos[id] = Array.isArray(arr) ? arr.map(x=>String(x||"")).slice(0,6).concat(["","","","","",""]).slice(0,6) : ["","","","","",""];
    });

    // Arranques
    DEPTOS_IDS.forEach(id=>{
      const arr = (s.arranques && s.arranques[id]) ? s.arranques[id] : null;
      st.arranques[id] = Array.isArray(arr) ? arr.map(x=>toTime(x)||"08:00").slice(0,6).concat(["08:00","08:00","08:00","08:00","08:00","08:00"]).slice(0,6)
                                            : ["08:00","08:00","08:00","08:00","08:00","08:00"];
    });

    // Paros / Incidentes / Mantto / Avisos / Acuerdos
    st.paros = Array.isArray(s.paros) ? s.paros.map(p=>({
      fecha: String(p.fecha||"").substring(0,10),
      pares: toInt(p.pares),
      motivo: String(p.motivo||""),
      origen: String(p.origen||""),
      deptoId: toInt(p.deptoId)
    })) : [];

    st.incidentes = Array.isArray(s.incidentes) ? s.incidentes.map(i=>({
      fecha: String(i.fecha||"").substring(0,10),
      tipo: String(i.tipo||""),
      causa: String(i.causa||""),
      clasificacion: String(i.clasificacion||""),
      descripcion: String(i.descripcion||"")
    })) : [];

    st.mantto.incidencias = (s.mantto && Array.isArray(s.mantto.incidencias)) ? s.mantto.incidencias.map(x=>({
      fecha: String(x.fecha||"").substring(0,10),
      maquina: String(x.maquina||""),
      deptoId: toInt(x.deptoId),
      solicitud: String(x.solicitud||""),
      status: String(x.status||"")
    })) : [];

    if(s.mantto && s.mantto.autonomoPorc){
      DEPTOS_IDS.forEach(id => st.mantto.autonomoPorc[id] = toInt(s.mantto.autonomoPorc[id]));
    }

    st.avisos = Array.isArray(s.avisos) ? s.avisos.map(x=>String(x||"")).filter(Boolean) : [];

    st.acuerdos = Array.isArray(s.acuerdos) ? s.acuerdos.map(a=>({
      acuerdo: String(a.acuerdo||""),
      responsable: String(a.responsable||""),
      fecha: String(a.fecha||"").substring(0,10),
      realizada: !!a.realizada
    })).filter(x=>x.acuerdo) : [];

    return st;
  }

  // ---------- sessionStorage ----------
  function saveStateToSession(state){
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  function loadStateFromSession(){
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    try{
      return normalizeState(JSON.parse(raw));
    }catch{
      return null;
    }
  }

  // ---------- Excel import ----------
  function excelDateToISO(v){
    // si viene como número (serial Excel), usa XLSX
    if(typeof v === "number" && window.XLSX && XLSX.SSF){
      const d = XLSX.SSF.parse_date_code(v);
      if(d && d.y && d.m && d.d){
        return `${d.y}-${String(d.m).padStart(2,"0")}-${String(d.d).padStart(2,"0")}`;
      }
    }
    // si viene como string
    return String(v||"").substring(0,10);
  }

  function sheetToJson(wb, name){
    const sh = wb.Sheets[name];
    if(!sh) return [];
    return XLSX.utils.sheet_to_json(sh, { defval: "" });
  }

  async function importExcelFileToState(file, baseState){
    if(!window.XLSX) throw new Error("XLSX no está cargado");
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(new Uint8Array(buf), { type:"array" });

    const st = normalizeState(baseState || createEmptyState());

    // Producción
    sheetToJson(wb, "Producción").forEach(r=>{
      const d = toInt(r.DepartamentoId);
      if(DEPTOS_IDS.includes(d)){
        st.produccion[d] = [
          toInt(r.Lun), toInt(r.Mar), toInt(r["Mié"]),
          toInt(r.Jue), toInt(r.Vie), toInt(r["Sáb"])
        ];
      }
    });

    // Faltas
    const faltRows = sheetToJson(wb, "Faltas");
    if(faltRows.length){
      st.faltas = faltRows.slice(0,6).map(r=>toInt(r.Faltas));
      while(st.faltas.length<6) st.faltas.push(0);
    }

    // Calidad
    const calRows = sheetToJson(wb, "Calidad");
    if(calRows.length){
      st.calidad = calRows.slice(0,6).map(r=>toFloat(r["Índice"]));
      while(st.calidad.length<6) st.calidad.push(0);
    }

    // Defectos
    sheetToJson(wb, "Defectos").forEach(r=>{
      const d = toInt(r.DepartamentoId);
      if(DEPTOS_IDS.includes(d)){
        st.defectos[d] = [
          String(r.Lun||""), String(r.Mar||""), String(r["Mié"]||""),
          String(r.Jue||""), String(r.Vie||""), String(r["Sáb"]||"")
        ];
      }
    });

    // Arranques
    sheetToJson(wb, "Arranques").forEach(r=>{
      const d = toInt(r.DepartamentoId);
      if(DEPTOS_IDS.includes(d)){
        st.arranques[d] = [
          toTime(r.Lun)||"08:00", toTime(r.Mar)||"08:00", toTime(r["Mié"])||"08:00",
          toTime(r.Jue)||"08:00", toTime(r.Vie)||"08:00", toTime(r["Sáb"])||"08:00"
        ];
      }
    });

    // Paros
    st.paros = sheetToJson(wb, "Paros")
      .filter(r=>r.Fecha && r.Pares)
      .map(r=>({
        fecha: excelDateToISO(r.Fecha),
        pares: toInt(r.Pares),
        motivo: String(r.Motivo||""),
        origen: String(r.Origen||""),
        deptoId: toInt(r.DepartamentoId)
      }));

    // Incidentes
    st.incidentes = sheetToJson(wb, "Incidentes")
      .filter(r=>r.Fecha)
      .map(r=>({
        fecha: excelDateToISO(r.Fecha),
        tipo: String(r.Tipo||""),
        causa: String(r.Causa||""),
        clasificacion: String(r["Clasificación"]||""),
        descripcion: String(r["Descripción"]||"")
      }));

    // Mantenimiento
    st.mantto.incidencias = sheetToJson(wb, "Mantenimiento")
      .filter(r=>r.Fecha)
      .map(r=>({
        fecha: excelDateToISO(r.Fecha),
        maquina: String(r["Máquina"]||""),
        deptoId: toInt(r.DepartamentoId),
        solicitud: String(r.Solicitud||""),
        status: String(r.Status||"")
      }));

    // Mantto Autónomo
    sheetToJson(wb, "ManttoAutonomo").forEach(r=>{
      const d = toInt(r.DepartamentoId);
      if(DEPTOS_IDS.includes(d)){
        st.mantto.autonomoPorc[d] = toInt(r.Porcentaje);
      }
    });

    // Avisos
    st.avisos = sheetToJson(wb, "Avisos")
      .map(r=>String(r.Aviso||"").trim())
      .filter(Boolean);

    // Acuerdos
    st.acuerdos = sheetToJson(wb, "Acuerdos")
      .filter(r=>r.Acuerdo)
      .map(r=>({
        acuerdo: String(r.Acuerdo||""),
        responsable: String(r.Responsable||""),
        fecha: excelDateToISO(r.Fecha),
        realizada: String(r["Realizada (true/false)"]||"").toLowerCase() === "true"
      }));

    return st;
  }

  return {
    STORAGE_KEY,
    DAYS,
    DEPTOS,
    DEPTOS_IDS,
    toInt,
    toFloat,
    toTime,
    escapeHtml,
    createEmptyState,
    normalizeState,
    saveStateToSession,
    loadStateFromSession,
    importExcelFileToState
  };
})();
