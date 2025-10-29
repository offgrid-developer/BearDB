import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/*
 Full categoryData (complete as requested).
 Each subtype is a string array in this dataset.
 For automatic population of bearingNumbers/seals/suffixes/make,
 we embed a small "db" called `popData` below that maps a few subtypes
 to arrays of options. You can expand popData to match your real DB.
*/
const categoryData = {
  "Bearing": {
    "Deep Groove Ball Bearing": [
      "6000 Series", "6200 Series", "6300 Series", "6400 Series",
      "6700 Series", "6800 Series", "Double Row", "Inch Dimension",
      "One Way Bearing", "Flange Bearings", "8800 Series", "Miniature Bearings",
      "R Series", "B Series"
    ],
    "Angular Contact Ball Bearings": [
      "7001AC", "7002AC", "7003AC", "7004AC", "7005AC", "7006AC",
      "7007AC", "7008AC", "7009AC", "7010AC", "7011AC", "7012AC"
    ],
    "Self Aligning Ball Bearing": [
      "1200 Series", "1300 Series", "2200 Series", "2300 Series", "2400 Series"
    ],
    "Tapered Roller Bearings": ["3200 Series", "3300 Series", "5300E Series", "QJ Series"],
    "Thrust Ball Bearings": ["5100 Series", "52000 Series", "53000 Series", "54000 Series"],
    "Thrust Cylindrical Roller Bearings": ["8000 Series", "MBYL AXK", "A5000 Series"],
    "Thrust Spherical Roller Bearings": ["23000 B / BM Series", "240XXCA Series", "222XXCA Series"],
    "Needle Roller Bearings": ["RNA, NK Type", "NA, NKI Type", "Drawn Cup HK, BK Type", "F Series"],
    "Spherical Roller Bearings": ["222X Series", "213XX Series", "222 Series"],
    "Insert Ball Bearings": ["UC Series", "UCX Series", "UCFL Series", "UCFX Series"],
    "Flanged Bearings": ["UCF Series", "UCFL Series", "UCX Series", "UCFX Series"],
    "One Way Bearings": ["Friction Clutch", "Sprag Type", "Roller One-Way", "Needle Clutch"],
    "Crossed Roller Bearings": ["RA Series", "RB Series", "RE Series", "RU Series", "SX Series"],
    "Four Point Contact Ball Bearings": ["QJ Series", "AC/BA Series"]
  },
  "Bearing Unit Housing": {
    "Pillow Block": ["PB205","PB206","PB207","PB208"],
    "Plummer Block": ["PL205","PL206","PL207","PL208"],
    "Take-Up Unit": ["TU205","TU206","TU207","TU208"],
    "Flanged Bearing Unit": ["FB205","FB206","FB207","FB208"],
    "Tapered Roller": ["TR205","TR206","TR207","TR208"],
    "Sealed Bearing Unit": ["SB205","SB206","SB207","SB208"],
    "Cast Iron": ["CI205","CI206","CI207","CI208"],
    "Split Plummer": ["SP205","SP206","SP207","SP208"],
    "Stainless Steel": ["SS205","SS206","SS207","SS208"]
  },
  "Bearing Accessory": {
    "Seal": ["ZZ Shield", "2RS Rubber Seal", "DDU Contact Seal", "VV Non-Contact Seal"],
    "Lubricant": ["Grease A", "Grease B"],
    "Mounting Tool": ["Puller Type A", "Puller Type B"]
  }
};

/*
popData maps a specific subtype string to arrays for:
 - bearingNumbers: common bearing numbers / codes
 - seals: common seals
 - suffixes: common suffix options
 - makes: common makes/applications
 Expand this object to match your DB. For any subtype not in popData,
 fallback will be empty arrays (fields optional).
*/
const popData = {
  // Deep Groove examples
  "6000 Series": {
    bearingNumbers: ["6000","6001","6002","6003","6004","6005"],
    seals: ["OPEN","Z","ZZ","RS","2RS"],
    suffixes: ["C2","C3","C4","P5","TN9"],
    makes: ["SKF","NSK","NTN","FAG"]
  },
  "6200 Series": {
    bearingNumbers: ["6200","6201","6202","6203","6204","6205"],
    seals: ["OPEN","Z","ZZ","RS","2RS"],
    suffixes: ["C2","C3","TN9","MA"],
    makes: ["SKF","KOYO","NACHI"]
  },
  // Pillow Block / housings
  "PB205": { bearingNumbers: ["PB205"], seals: ["OPEN"], suffixes: [], makes: ["SKF"] },
  "PB206": { bearingNumbers: ["PB206"], seals: ["OPEN"], suffixes: [], makes: ["SKF"] },
  // Make more entries as needed...
};

const MAX_WORDS = 40; // 40/40 quota

export default function BearingForm() {
  // form state (current single-row inputs)
  const [category, setCategory] = useState("Bearing");
  const [type, setType] = useState("Deep Groove Ball Bearing");
  const [subtype, setSubtype] = useState("6200 Series");
  const [bearingNumber, setBearingNumber] = useState(""); // user can type or select from options
  const [seal, setSeal] = useState("OPEN");
  const [suffix, setSuffix] = useState("");
  const [make, setMake] = useState("");
  const [application, setApplication] = useState("");

  // generated rows (the table content that will be exported)
  const [rows, setRows] = useState([]);

  // tracker: how many words used (words counted across rows exported)
  const [usedWords, setUsedWords] = useState(0);

  // UI / toast / gear animation
  const [toast, setToast] = useState("");
  const [gearSpin, setGearSpin] = useState(false);

  // derived options for selects based on category/type/subtype
  const categoryOptions = useMemo(() => Object.keys(categoryData), []);
  const typeOptions = useMemo(() => (category ? Object.keys(categoryData[category] || {}) : []), [category]);
  const subtypeOptions = useMemo(() => (category && type ? (categoryData[category][type] || []) : []), [category, type]);

  // derived populators from popData
  const bearingOptions = useMemo(() => popData[subtype]?.bearingNumbers || [], [subtype]);
  const sealOptions = useMemo(() => popData[subtype]?.seals || ["OPEN","Z","ZZ","RS","2RS","DDU","VV"], [subtype]);
  const suffixOptions = useMemo(() => popData[subtype]?.suffixes || ["C2","C3","C4","P5","P6","TN9","MA","NR","ST"], [subtype]);
  const makeOptions = useMemo(() => popData[subtype]?.makes || ["SKF","NSK","NTN","FAG","KOYO","NACHI","Timken","IKO"], [subtype]);

  // autopopulate fields when subtype changes (optional; user can still edit)
  useEffect(() => {
    // If the current value is empty, set to the first available option from popData
    if (!bearingNumber && bearingOptions.length > 0) setBearingNumber(bearingOptions[0]);
    if (!seal && sealOptions.length > 0) setSeal(sealOptions[0]);
    if (!suffix && suffixOptions.length > 0) setSuffix(suffixOptions[0] || "");
    if (!make && makeOptions.length > 0) setMake(makeOptions[0] || "");
    // (Do not override user-entered values if present)
  }, [subtype]); // eslint-disable-line

  // helper: count words in a single row (we count visible fields only: Category, Type, Subtype, BearingNumber, Application)
  const countWordsForRow = (row) => {
    const visible = [row.Category, row.Type, row.Subtype, row.BearingNumber, row.Application].filter(Boolean).join(" ");
    if (!visible.trim()) return 0;
    return visible.trim().split(/\s+/).length;
  };

  // Add the current form as a row (this does not immediately download)
  const handleAddRow = () => {
    if (!category || !type || !subtype || !bearingNumber) {
      setToast("Please fill Category, Type, Subtype and Bearing Number / Code.");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    const row = {
      Category: category,
      Type: type,
      Subtype: subtype,
      BearingNumber: bearingNumber,
      Seal: seal || "",
      Suffix: suffix || "",
      Make: make || "",
      Application: application || "",
      Date: new Date().toLocaleString(),
      GeneratedBy: "User"
    };

    setRows(prev => [...prev, row]);
    const words = countWordsForRow(row);
    // NOTE: adding rows does not immediately consume the quota. Quota decremented only on download
    setToast("Row added (not yet downloaded).");
    setTimeout(() => setToast(""), 2200);
    // clear some fields optionally but keep category/type/subtype
    setBearingNumber("");
    setApplication("");
  };

  // Internal: build sheet from rowsToExport
  const buildSheetAndExport = (rowsToExport, format) => {
    const ws = XLSX.utils.json_to_sheet(rowsToExport.map(r => ({
      Category: r.Category,
      Type: r.Type,
      Subtype: r.Subtype,
      BearingNumber: r.BearingNumber,
      Seal: r.Seal,
      Suffix: r.Suffix,
      Make: r.Make,
      Application: r.Application,
      Date: r.Date,
      GeneratedBy: r.GeneratedBy
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bearings");
    const ts = new Date().toISOString().replaceAll(":", "-").slice(0, 16);
    const filename = `BearingSpec_${ts}.${format}`;
    if (format === "xlsx") XLSX.writeFile(wb, filename);
    else {
      // csv
      const csv = XLSX.utils.sheet_to_csv(ws);
      saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
    }
  };

  // Download: automatically include current form row if user hasn't added it
  const handleDownload = (format) => {
    // assemble rows to export: include existing rows plus current form as last row (if not already)
    let rowsToExport = [...rows];

    const currentRow = {
      Category: category,
      Type: type,
      Subtype: subtype,
      BearingNumber: bearingNumber,
      Seal: seal || "",
      Suffix: suffix || "",
      Make: make || "",
      Application: application || "",
      Date: new Date().toLocaleString(),
      GeneratedBy: "User"
    };

    // If the currentRow has required fields filled and is not identical to last row, include it
    const shouldIncludeCurrent = category && type && subtype && bearingNumber;
    if (shouldIncludeCurrent) {
      // quick compare with last row
      const last = rowsToExport[rowsToExport.length - 1];
      const isSameAsLast = last &&
        last.Category === currentRow.Category &&
        last.Type === currentRow.Type &&
        last.Subtype === currentRow.Subtype &&
        last.BearingNumber === currentRow.BearingNumber &&
        last.Application === currentRow.Application;
      if (!isSameAsLast) rowsToExport.push(currentRow);
    }

    if (rowsToExport.length === 0) {
      setToast("No rows to download. Add a row or fill the form.");
      setTimeout(() => setToast(""), 2500);
      return;
    }

    // Count words that will be consumed by this download (sum visible words per row)
    const wordsThisDownload = rowsToExport.reduce((acc, r) => acc + countWordsForRow({
      Category: r.Category, Type: r.Type, Subtype: r.Subtype, BearingNumber: r.BearingNumber, Application: r.Application
    }), 0);

    if (usedWords + wordsThisDownload > MAX_WORDS) {
      setToast("⚠️ Download would exceed 40/40 word quota. Remove rows or reset quota.");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    // export
    buildSheetAndExport(rowsToExport, format);

    // update quota
    setUsedWords(prev => prev + wordsThisDownload);

    // gear animation + toast
    setGearSpin(true);
    setToast(`Downloaded ${rowsToExport.length} row(s). ${wordsThisDownload} words used.`);
    setTimeout(() => { setGearSpin(false); setToast(""); }, 1400);

    // Optionally clear rows after successful download — I'll keep them by default, but you can uncomment to clear:
    // setRows([]);
  };

  const handleResetQuota = () => {
    setUsedWords(0);
    setToast("✅ Quota reset to 40/40.");
    setGearSpin(true);
    setTimeout(() => { setToast(""); setGearSpin(false); }, 1200);
  };

  const handleClearRows = () => {
    setRows([]);
    setToast("Rows cleared.");
    setTimeout(() => setToast(""), 1200);
  };

  // color/glow logic for tracker
  const remaining = MAX_WORDS - usedWords;
  const trackerClass = usedWords <= 20 ? "text-white bg-teal-500" :
                       usedWords <= 30 ? "text-white bg-yellow-500" :
                       usedWords < MAX_WORDS ? "text-white bg-red-500" :
                       "text-white bg-red-700 animate-pulse";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="h-8 w-8 bg-gray-100 border mr-3 flex items-center justify-center rounded">
          <span className="text-xs text-gray-400">Logo</span>
        </div>
        <h1 className="text-lg font-semibold text-gray-800">Welcome to BearingSpec Hub Dashboard</h1>

        <div className="ml-auto flex items-center gap-3">
          <div className={`px-3 py-1 rounded flex items-center gap-2 ${trackerClass}`}>
            <span className="font-semibold">{usedWords}/{MAX_WORDS}</span>
            <span className="text-sm opacity-90">⛭</span>
          </div>
          <button
            onClick={handleResetQuota}
            className="px-3 py-1 bg-gray-200 rounded text-sm"
            title="Reset quota"
          >
            Reset Quota
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
          {toast}
        </div>
      )}

      {/* Form */}
      <div className="bg-white border rounded p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Bearing Category*</label>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setType(""); setSubtype(""); }}
                  className="w-full border rounded px-3 py-2">
            <option value="">Select Bearing Category</option>
            {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="mb-4 text-blue-600 font-medium">Bearing Details</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Bearing Type*</label>
            <select value={type} onChange={(e)=>{ setType(e.target.value); setSubtype(""); }}
                    className="w-full border rounded px-3 py-2">
              <option value="">Select Bearing Type</option>
              {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Subtype / Series*</label>
            <select value={subtype} onChange={(e)=> setSubtype(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Select Subtype</option>
              {subtypeOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Bearing Number / Code*</label>
            <div className="flex gap-2">
              <select value={bearingNumber} onChange={(e)=> setBearingNumber(e.target.value)} className="flex-1 border rounded px-3 py-2">
                <option value="">-- Select or type --</option>
                {bearingOptions.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <input type="text" value={bearingNumber} onChange={(e)=> setBearingNumber(e.target.value)} placeholder="e.g., 6205"
                     className="w-32 border rounded px-3 py-2"/>
            </div>
            <div className="text-xs text-gray-400 mt-1">Optional: choose from list or type a custom code.</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Seals / Shields (optional)</label>
            <select value={seal} onChange={(e)=> setSeal(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">OPEN (default)</option>
              {sealOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Other Suffixes (optional)</label>
            <select value={suffix} onChange={(e)=> setSuffix(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">None</option>
              {suffixOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Make (optional)</label>
            <select value={make} onChange={(e)=> setMake(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">None / Custom</option>
              {makeOptions.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Application (optional)</label>
            <input value={application} onChange={(e)=> setApplication(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="e.g., front hub"/>
          </div>
        </div>

        {/* Controls: Add Row | Download XLSX | Download CSV | Clear Rows */}
        <div className="flex items-center gap-3 mt-3">
          <button onClick={handleAddRow} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Row</button>

          <button onClick={()=>handleDownload("xlsx")} className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700">Download XLSX</button>

          <button onClick={()=>handleDownload("csv")} className="bg-amber-500 text-white px-3 py-2 rounded hover:bg-amber-600">Download CSV</button>

          <button onClick={handleClearRows} className="bg-gray-200 text-gray-800 px-3 py-2 rounded">Clear Rows</button>

          <div className="ml-auto text-sm text-gray-500">
            Remaining words: <span className="font-semibold">{MAX_WORDS - usedWords}/{MAX_WORDS}</span>
          </div>
        </div>
      </div>

      {/* Table of rows - preview prior to download */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-2">Preview (rows to export)</div>
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 border">Category</th>
                <th className="px-2 py-2 border">Type</th>
                <th className="px-2 py-2 border">Subtype</th>
                <th className="px-2 py-2 border">BearingNumber/Code</th>
                <th className="px-2 py-2 border">Seal</th>
                <th className="px-2 py-2 border">Suffix</th>
                <th className="px-2 py-2 border">Make</th>
                <th className="px-2 py-2 border">Application</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={8} className="p-4 text-center text-gray-500">No rows added yet</td></tr>
              ) : (
                rows.map((r, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-2 py-1 border">{r.Category}</td>
                    <td className="px-2 py-1 border">{r.Type}</td>
                    <td className="px-2 py-1 border">{r.Subtype}</td>
                    <td className="px-2 py-1 border">{r.BearingNumber}</td>
                    <td className="px-2 py-1 border">{r.Seal}</td>
                    <td className="px-2 py-1 border">{r.Suffix}</td>
                    <td className="px-2 py-1 border">{r.Make}</td>
                    <td className="px-2 py-1 border">{r.Application}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer: small help text and gear indicator */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>Fields marked * are required for a row to be valid for export.</div>
        <div className="flex items-center gap-2">
          <div className={`h-6 w-6 rounded-full flex items-center justify-center ${gearSpin ? "bg-gradient-to-r from-teal-400 to-blue-500 animate-spin" : "bg-gray-200"}`}>
            <span className="text-xs">⛭</span>
          </div>
        </div>
      </div>
    </div>
  );
}
