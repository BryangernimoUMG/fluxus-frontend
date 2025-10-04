import writeXlsxFile from "write-excel-file";

/** Nombre de archivo legible: prefix_YYYY-MM[_YYYY-MM].ext */
export function makeFilename(prefix, ext, { from, to } = {}) {
  const rng =
    [from, to].filter(Boolean).join("_") ||
    new Date().toISOString().slice(0, 10);
  return `${prefix}_${rng}.${ext}`;
}

/** Descargar un Blob (CSV) */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Exportar a CSV (tabla plana) */
export function exportToCSV(rows, filename) {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, filename);
}

/** Exportar a XLSX (una hoja) con schema inferido simple */
export async function exportToXLSX(rows, filename, sheetName = "Datos") {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);

  const detectType = (key) => {
    for (const r of rows) {
      const v = r[key];
      if (v === null || v === undefined) continue;
      if (typeof v === "number" && Number.isFinite(v)) return Number;
      if (typeof v === "boolean") return Boolean;
      return String;
    }
    return String;
  };

  const schema = headers.map((key) => ({
    column: key,
    type: detectType(key),
    value: (row) => row[key] ?? "",
    width: Math.max(12, String(key).length + 4),
  }));

  await writeXlsxFile(rows, { schema, sheet: sheetName, fileName: filename });
}

/** Exportar a XLSX con múltiples hojas (cada hoja: { name, headers, rows }) */
export async function exportMultipleSheetsXLSX(sheets, filename) {
  if (!sheets?.length) return;

  // write-excel-file soporta un array con { sheet, data } en el navegador
  const payload = sheets.map(({ name, headers, rows }) => {
    const headerRow = headers.map((h) => ({ value: h, fontWeight: "bold" }));
    const dataRows = rows.map((r) =>
      headers.map((h) => ({ value: r[h] ?? "" }))
    );
    return {
      sheet: name,
      data: [headerRow, ...dataRows],
    };
  });

  await writeXlsxFile(payload, { fileName: filename });
}
