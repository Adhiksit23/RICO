// "use client";

// import {
//   useEffect,
//   useMemo,
//   useState,
//   useCallback,
// } from "react";


// const base_api = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
// //const base_api = "https://outspoken-pandemic-surfer.ngrok-free.dev";

// type SummaryData = {
//   samples_analyzed: number;
// };

// type RangeData = {
//   baseline: number;
//   tolerance: number;
//   min_range: number;
//   max_range: number;
//   unit?: string; 
// };

// type RangesResponse = {
//   ranges: Record<string, RangeData>;
//   samples_analyzed: number;
// };

// const getUnit = (key: string): string => {
//   const lower = key.toLowerCase();
//   if (lower.includes("mm")) return "mm";
//   if (lower.includes("bar") || lower.includes("pressure")) return "bar";
//   if (lower.includes("%")) return "%";
//   if (lower.includes("sec") || lower.includes("time")) return "s";
//   if (lower.includes("°c") || lower.includes("temperature")) return "°C";
//   if (lower.includes("l/min")) return "L/min";
//   if (lower.includes("m/s") || lower.includes("speed")) return "m/s";
//   if (lower.includes("(t)")) return "T";
//   return "";
// };

// export default function CalibrationPage() {
//   const [summary, setSummary] = useState<SummaryData>({ samples_analyzed: 0 });
//   const [ranges, setRanges] = useState<Record<string, RangeData>>({});
  
//   // Holds the FORM INPUTS and UI state (initialized exclusively with computed math)
//   const [latestParams, setLatestParams] = useState<Record<string, string>>({});
  
//   // Holds the DATABASE state (strictly used for the 'Before' snapshot)
//   const [baselineSnapshot, setBaselineSnapshot] = useState<Record<string, string>>({});
//   const [keyMap, setKeyMap] = useState<Record<string, string>>({});
  
//   const [selectedMachine, setSelectedMachine] = useState("DC-01");
//   const [selectedDie, setSelectedDie] = useState("S14"); 

//   const [isInitialLoading, setIsInitialLoading] = useState(true);
//   const [isApplying, setIsApplying] = useState(false);
//   const [statusMessage, setStatusMessage] = useState("");
//   const [statusType, setStatusType] = useState<"success" | "error" | "">("");

//   const normalizeKey = useCallback((key: string): string => {
//     return key
//       .trim()
//       .toLowerCase()
//       .replaceAll("/", "_")
//       .replaceAll("-", "_")
//       .replaceAll(" ", "_");
//   }, []);

//   // Fetch from the DB -> This ONLY sets the Before snapshot now
//   const fetchDatabaseLatest = useCallback(async () => {
//     try {
//       const res = await fetch(
//         `${base_api}/api/calibration/latest?machine=${encodeURIComponent(selectedMachine)}&die=${encodeURIComponent(selectedDie)}`,
//         { headers: { "ngrok-skip-browser-warning": "true" } }
//       );

//       const data = await res.json();
//       const formattedDb: Record<string, string> = {};

//       Object.entries(data).forEach(([k, v]) => {
//         const normalized = normalizeKey(k);
//         formattedDb[normalized] = v !== null ? Number(v).toFixed(2) : "0.00";
//       });

//       setBaselineSnapshot(formattedDb);
//     } catch (err) {
//       console.error("Failed to fetch latest DB calibration", err);
//     }
//   }, [selectedMachine, selectedDie, normalizeKey]);

//   useEffect(() => {
//     const loadData = async () => {
//       setIsInitialLoading(true);
//       try {
//         const headers = { "ngrok-skip-browser-warning": "true" };
        
//         // 1. Fetch the computed math
//         const res = await fetch(`${base_api}/api/calibration/ranges?machine=${encodeURIComponent(selectedMachine)}&die=${encodeURIComponent(selectedDie)}`, { headers });
//         const data: RangesResponse = await res.json();
        
//         setRanges(data.ranges || {});
//         setSummary({ samples_analyzed: data.samples_analyzed || 0 });

//         const mapping: Record<string, string> = {};
//         const mathInputs: Record<string, string> = {};

//         // 2. Pre-fill the input fields completely with the computed math
//         Object.entries(data.ranges || {}).forEach(([k, v]) => {
//           const normK = normalizeKey(k);
//           mapping[normK] = k;
//           mathInputs[normK] = Number(v.baseline).toFixed(2);
//         });

//         setKeyMap(mapping);
//         setLatestParams(mathInputs);

//         // 3. Fetch the DB to populate the Before column
//         await fetchDatabaseLatest();
//       } catch (err) {
//         console.error("Failed to load calibration data:", err);
//       } finally {
//         setIsInitialLoading(false);
//       }
//     };

//     loadData();
//   }, [selectedMachine, selectedDie, fetchDatabaseLatest, normalizeKey]);

//   useEffect(() => {
//     const handleVisibility = async () => {
//       if (document.visibilityState === "visible") {
//         await fetchDatabaseLatest();
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibility);
//     return () => {
//       document.removeEventListener("visibilitychange", handleVisibility);
//     };
//   }, [fetchDatabaseLatest]);

//   const machines = ["UBE 850T-1", "UBE 850T-2", "UBE 850T-3"];
//   const dies = ["S14", "S15", "S16"]; 
//   const rows = useMemo(() => Object.entries(ranges), [ranges]);

//   const handleChange = (key: string, value: string) => {
//     setLatestParams((prev) => ({
//       ...prev,
//       [key]: value,
//     }));
//   };

//   const buildPayload = () => {
//     //const payload: Record<string, number> = {};
//     const payload: Record<string, RangeData> = {};
//     rows.forEach(([key, value]) => {
//       const normalizedKey = normalizeKey(key);
//       const backendKey = keyMap[normalizedKey] || key;

//       const finalValue =
//         latestParams[normalizedKey] !== undefined
//           ? Number(latestParams[normalizedKey])
//           : (value?.baseline ?? 0); 

//       //payload[backendKey] = finalValue;
//       payload[backendKey] = {
//         ...value,
//         baseline: finalValue,
//       };
//     });
//     return payload;
//   };

//   const applyCalibration = async () => {
//     setIsApplying(true);
//     setStatusMessage("");
//     setStatusType("");

//     try {
//       const payload = buildPayload();
//       console.log(payload)
//       const res = await fetch(
//         `${base_api}/api/calibration/apply?machine=${encodeURIComponent(selectedMachine)}&die=${encodeURIComponent(selectedDie)}`, 
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );

//       //if (!res.ok) throw new Error("Failed to apply");
//       if (!res.ok) {
//       const errBody = await res.json();
//       console.error("422 detail:", errBody);  // ← FastAPI returns { detail: [...] }
//       throw new Error(JSON.stringify(errBody));
//       }

//       const data = await res.json();
//       setStatusMessage(data.message || "Calibration Applied Successfully");
//       setStatusType("success");

//       // Refetch the database to push the newly saved values into the "Before" snapshot
//       await fetchDatabaseLatest();
//     } catch(err) {
//       console.error(err);
//       setStatusMessage("Failed to apply calibration");
//       setStatusType("error");
//     } finally {
//       setIsApplying(false);
//       setTimeout(() => {
//         setStatusMessage("");
//       }, 4000);
//     }
//   };

//   if (isInitialLoading) {
//     return (
//       <div className="bg-[#07111F] min-h-screen w-full flex items-center justify-center flex-col gap-4">
//         <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
//         <p className="text-cyan-400 font-semibold tracking-wide animate-pulse">Computing Calibrations...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#07111F] min-h-screen text-white w-full max-w-none px-6 md:px-12 py-8">
      
//       <div className="mb-8">
//         <h1 className="text-2xl md:text-[38px] font-bold leading-tight md:leading-none">Machine Calibration</h1>
//         <p className="text-gray-500 mt-2 text-sm md:text-base">
//           Zero-defect operating windows derived from historical production data
//         </p>
//       </div>

//       <div className="mb-6">
//         <div className="bg-[#121B2B] border border-[#1F2937] rounded-xl p-5 md:p-6 shadow-sm inline-block min-w-[250px]">
//           <div className="text-[11px] uppercase tracking-[2px] text-gray-500 mb-1.5">Samples Analyzed</div>
//           <div className="text-white text-3xl font-bold">
//             {summary.samples_analyzed.toLocaleString()}
//           </div>
//         </div>
//       </div>

//       <div className="flex flex-wrap gap-4 mb-10">
//         <div className="w-full sm:w-56">
//           <div className="text-xs text-gray-500 mb-1.5 uppercase tracking-[2px]">Machine</div>
//           <select
//             value={selectedMachine}
//             onChange={(e) => setSelectedMachine(e.target.value)}
//             className="w-full bg-[#121B2B] border border-[#1F2937] rounded-lg px-4 py-3 text-sm text-white outline-none cursor-pointer"
//           >
//             {machines.map((machine) => (
//               <option key={machine} value={machine}>
//                 {machine}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="w-full sm:w-56">
//           <div className="text-xs text-gray-500 mb-1.5 uppercase tracking-[2px]">Die</div>
//           <select
//             value={selectedDie}
//             onChange={(e) => setSelectedDie(e.target.value)}
//             className="w-full bg-[#121B2B] border border-[#1F2937] rounded-lg px-4 py-3 text-sm text-white outline-none cursor-pointer"
//           >
//             {dies.map((die) => (
//               <option key={die} value={die}>
//                 {die}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div className="mb-4 text-xl md:text-2xl font-semibold">Current Applied Calibration</div>

//       <div className="bg-[#121B2B] border border-[#1F2937] rounded-xl overflow-x-auto mb-10">
//         <div className="w-full min-w-[850px]">
//           <div className="hidden md:grid grid-cols-[3.5fr_2fr_2fr_1.5fr_4fr] gap-6 px-6 py-4 border-b border-[#1F2937] text-[11px] uppercase tracking-[2px] text-gray-500 items-center text-center w-full">
//             <div className="text-left">Parameter</div>
//             <div>Current Calculated</div>
//             <div>Optimal Range</div>
//             <div>Std Dev</div>
//             <div>Comparison</div>
//           </div>

//           {rows.map(([key, value], index) => {
//             const normalizedKey = normalizeKey(key);
//             const unit = value?.unit || getUnit(key);

//             const currentValue = latestParams[normalizedKey] || "0.00";
//             const snapshotValue = baselineSnapshot[normalizedKey];

//             return (
//               <div
//                 key={index}
//                 className="flex flex-col md:grid md:grid-cols-[3.5fr_2fr_2fr_1.5fr_4fr] gap-6 px-6 py-5 border-b border-[#182232] items-center text-center hover:bg-[#0D1625] transition-all w-full"
//               >
//                 <div className="text-left w-full">
//                   <div className="text-white text-base font-semibold break-words">{key}</div>
//                   <div className="text-gray-500 text-xs mt-1">
//                     Tol: {Number(value?.min_range ?? 0).toFixed(2)} - {Number(value?.max_range ?? 0).toFixed(2)} {unit}
//                   </div>
//                 </div>

//                 <div className="flex justify-between md:justify-center items-center w-full border-b border-gray-800/40 pb-2 md:pb-0 md:border-none">
//                   <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider">Current Calculated</span>
//                   <span className="text-cyan-400 font-semibold text-base">
//                     {currentValue} {unit}
//                   </span>
//                 </div>

//                 <div className="flex justify-between md:justify-center items-center w-full border-b border-gray-800/40 pb-2 md:pb-0 md:border-none">
//                   <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider">Optimal Range</span>
//                   <span className="text-green-400 text-base">
//                     {Number(value?.min_range ?? 0).toFixed(2)} - {Number(value?.max_range ?? 0).toFixed(2)} {unit}
//                   </span>
//                 </div>

//                 <div className="flex justify-between md:justify-center items-center w-full border-b border-gray-800/40 pb-2 md:pb-0 md:border-none">
//                   <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider">Std Dev</span>
//                   <span className="text-gray-400 text-sm">
//                     ±{Number(value?.tolerance ?? 0).toFixed(2)} {unit}
//                   </span>
//                 </div>

//                 <div className="w-full flex justify-center">
//                   <div className="bg-[#0F172A] border border-[#1F2937] rounded-lg px-4 py-2.5 flex items-center justify-between w-full shadow-inner gap-3 overflow-hidden">
//                     <div className="flex flex-col items-start min-w-0 flex-1">
//                       <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Before</span>
//                       <span className="text-gray-300 text-xs mt-0.5 truncate w-full text-left">
//                         {snapshotValue ? `${snapshotValue} ${unit}` : "—"}
//                       </span>
//                     </div>
//                     <span className="text-cyan-500/50 text-sm flex-shrink-0 px-2">→</span>
//                     <div className="flex flex-col items-end min-w-0 flex-1">
//                       <span className="text-[9px] text-cyan-500 uppercase tracking-wider font-semibold">Calculated</span>
//                       <span className="text-cyan-400 text-sm font-bold mt-0.5 truncate w-full text-right">
//                         {currentValue} {unit}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <div className="bg-[#121B2B] border border-[#1F2937] rounded-xl p-5 md:p-8">
//         <h2 className="text-xl md:text-2xl font-semibold mb-6">Newly Corrected Recipe</h2>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {rows.map(([key, value], index) => {
//             const normalizedKey = normalizeKey(key);
//             const unit = value?.unit || getUnit(key);

//             const inputValue = latestParams[normalizedKey] || "0.00";
//             const snapshotValue = baselineSnapshot[normalizedKey] || "—";

//             return (
//               <div
//                 key={index}
//                 className="bg-[#0B1320] border border-[#1F2937] rounded-xl p-5 flex flex-col justify-between"
//               >
//                 <div>
//                   <div className="text-white text-base font-semibold mb-3 truncate" title={key}>
//                     {key}
//                   </div>

//                   <div className="flex justify-between text-xs mb-4">
//                     <div>
//                       <div className="text-gray-500">Lower Limit</div>
//                       <div className="text-green-400 font-semibold mt-0.5">
//                         {Number(value?.min_range ?? 0).toFixed(2)} {unit}
//                       </div>
//                     </div>

//                     <div className="text-right">
//                       <div className="text-gray-500">Upper Limit</div>
//                       <div className="text-red-400 font-semibold mt-0.5">
//                         {Number(value?.max_range ?? 0).toFixed(2)} {unit}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-[#121B2B] border border-[#1F2937]/60 rounded-lg p-2.5 mb-4 text-xs flex justify-between items-center">
//                     <div className="min-w-0 flex-1">
//                       <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Before</span>
//                       <span className="text-gray-400 font-medium truncate block w-full">{snapshotValue} {snapshotValue !== "—" ? unit : ""}</span>
//                     </div>
//                     <div className="text-gray-600 font-bold px-3 flex-shrink-0">→</div>
//                     <div className="text-right min-w-0 flex-1">
//                       <span className="text-gray-500 block text-[10px] uppercase tracking-wider">After</span>
//                       <span className="text-cyan-400 font-semibold truncate block w-full">
//                         {!isNaN(Number(inputValue)) ? Number(inputValue).toFixed(2) : inputValue} {unit}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="relative mt-1">
//                   <input
//                     type="number"
//                     step="0.01"
//                     value={inputValue}
//                     onChange={(e) =>
//                       handleChange(normalizedKey, e.target.value)
//                     }
//                     className="w-full bg-[#07111F] border border-[#1F2937] rounded-lg px-4 py-3 pr-16 text-sm text-white outline-none focus:border-cyan-400"
//                   />

//                   {unit && (
//                     <span className="absolute right-4 top-3 text-gray-500 text-sm select-none">
//                       {unit}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-8 md:mt-10">
//           {statusMessage && (
//             <div
//               className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
//                 statusType === "success"
//                   ? "bg-green-500/10 text-green-400 border border-green-500/20"
//                   : "bg-red-500/10 text-red-400 border border-red-500/20"
//               }`}
//             >
//               {statusMessage}
//             </div>
//           )}

//           <button
//             onClick={applyCalibration}
//             disabled={isApplying}
//             className={`
//               font-bold
//               px-8
//               py-3.5
//               rounded-xl
//               text-base
//               tracking-wide
//               uppercase
//               transition-colors
//               ${
//                 isApplying
//                   ? "bg-cyan-600/50 text-black/50 cursor-not-allowed"
//                   : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.2)]"
//               }
//             `}
//           >
//             {isApplying ? "Applying..." : "Apply Calibration"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// // }
// "use client";

// import {
//   useEffect,
//   useMemo,
//   useState,
//   useCallback,
// } from "react";

// const base_api = "https://outspoken-pandemic-surfer.ngrok-free.dev"
// // process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// type SummaryData = {
//   samples_analyzed: number;
// };

// type RangeData = {
//   baseline: number;
//   tolerance: number;
//   min_range: number;
//   max_range: number;
//   unit?: string; 
// };

// type RangesResponse = {
//   ranges: Record<string, RangeData>;
//   samples_analyzed: number;
// };

// const getUnit = (key: string): string => {
//   const lower = key.toLowerCase();
//   if (lower.includes("mm")) return "mm";
//   if (lower.includes("bar") || lower.includes("pressure")) return "bar";
//   if (lower.includes("%")) return "%";
//   if (lower.includes("sec") || lower.includes("time")) return "s";
//   if (lower.includes("°c") || lower.includes("temperature")) return "°C";
//   if (lower.includes("l/min")) return "L/min";
//   if (lower.includes("m/s") || lower.includes("speed")) return "m/s";
//   if (lower.includes("(t)")) return "T";
//   return "";
// };

// export default function CalibrationPage() {
//   const [summary, setSummary] = useState<SummaryData>({ samples_analyzed: 0 });
//   const [ranges, setRanges] = useState<Record<string, RangeData>>({});
  
//   // Holds the FORM INPUTS and UI state for the calculated recipe
//   const [latestParams, setLatestParams] = useState<Record<string, string>>({});
  
//   // Holds the DATABASE state (strictly used for the 'Latest' snapshots)
//   const [baselineSnapshot, setBaselineSnapshot] = useState<Record<string, string>>({});
//   const [keyMap, setKeyMap] = useState<Record<string, string>>({});
  
//   // FIXED: Adjusted default machine to match options array
//   const [selectedMachine, setSelectedMachine] = useState("UBE 850T-1");
//   const [selectedDie, setSelectedDie] = useState("S14"); 

//   const [isInitialLoading, setIsInitialLoading] = useState(true);
//   const [isCalculating, setIsCalculating] = useState(false);
//   const [isApplying, setIsApplying] = useState(false);
//   const [statusMessage, setStatusMessage] = useState("");
//   const [statusType, setStatusType] = useState<"success" | "error" | "">("");

//   const normalizeKey = useCallback((key: string): string => {
//     return key
//       .trim()
//       .toLowerCase()
//       .replaceAll("/", "_")
//       .replaceAll("-", "_")
//       .replaceAll(" ", "_");
//   }, []);

//   // Fetch from the DB -> Pulls what is currently stored/active on the machinery
//   const fetchDatabaseLatest = useCallback(async () => {
//     try {
//       const res = await fetch(
//         `${base_api}/api/calibration/latest?machine=${encodeURIComponent(selectedMachine)}&die=${encodeURIComponent(selectedDie)}`,
//         { headers: { "ngrok-skip-browser-warning": "true" } }
//       );

//       const data = await res.json();
//       console.log("Printing Data")
//       console.log(data)
//       const formattedDb: Record<string, string> = {};
//       const mapping: Record<string, string> = {};

//       Object.entries(data).forEach(([k, v]) => {
//         const normalized = normalizeKey(k);
//         formattedDb[normalized] = v !== null ? Number(v).toFixed(2) : "0.00";
//         mapping[normalized] = k; // Preserve original backend string format immediately
//       });

//       setBaselineSnapshot(formattedDb);
//       setKeyMap(mapping);
//     } catch (err) {
//       console.error("Failed to fetch latest DB calibration", err);
//     }
//   }, [selectedMachine, selectedDie, normalizeKey]);

//   // On page load: Only load the latest calibration snapshot
//   useEffect(() => {
//     const loadData = async () => {
//       setIsInitialLoading(true);
//       try {
//         await fetchDatabaseLatest();
//       } catch (err) {
//         console.error("Failed to load calibration data:", err);
//       } finally {
//         setIsInitialLoading(false);
//       }
//     };

//     loadData();
//   }, [selectedMachine, selectedDie, fetchDatabaseLatest]);

//   useEffect(() => {
//     const handleVisibility = async () => {
//       if (document.visibilityState === "visible") {
//         await fetchDatabaseLatest();
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibility);
//     return () => {
//       document.removeEventListener("visibilitychange", handleVisibility);
//     };
//   }, [fetchDatabaseLatest]);

//   // Isolated action triggered exclusively when the operator clicks "Calculate Calibration"
//   const calculateCalibration = async () => {
//     setIsCalculating(true);
//     setStatusMessage("");
//     setStatusType("");
//     try {
//       const headers = { "ngrok-skip-browser-warning": "true" };
//       const res = await fetch(
//         `${base_api}/api/calibration/ranges?machine=${encodeURIComponent(selectedMachine)}&die=${encodeURIComponent(selectedDie)}`, 
//         { headers }
//       );
//       const data: RangesResponse = await res.json();
      
//       setRanges(data.ranges || {});
//       setSummary({ samples_analyzed: data.samples_analyzed || 0 });

//       const mapping: Record<string, string> = { ...keyMap };
//       const mathInputs: Record<string, string> = {};

//       Object.entries(data.ranges || {}).forEach(([k, v]) => {
//         const normK = normalizeKey(k);
//         mapping[normK] = k;
//         mathInputs[normK] = Number(v.baseline).toFixed(2);
//       });

//       setKeyMap(mapping);
//       setLatestParams(mathInputs);
//       setStatusMessage("Calculated optimized windows successfully.");
//       setStatusType("success");
//     } catch (err) {
//       console.error("Failed to calculate ranges:", err);
//       setStatusMessage("Failed to calculate targeted calibration ranges.");
//       setStatusType("error");
//     } finally {
//       setIsCalculating(false);
//       setTimeout(() => setStatusMessage(""), 4000);
//     }
//   };

//   const machines = ["UBE 850T-1", "UBE 850T-2", "UBE 850T-3"];
//   const dies = ["S14", "S15", "S16"]; 
//   const bottomRows = useMemo(() => Object.entries(ranges), [ranges]);
  
//   // Dynamic top rows extracted from current active baseline database configuration state
//   const topRows = useMemo(() => Object.keys(baselineSnapshot), [baselineSnapshot]);

//   const handleChange = (key: string, value: string) => {
//     setLatestParams((prev) => ({
//       ...prev,
//       [key]: value,
//     }));
//   };

//   const buildPayload = () => {
//     const payload: Record<string, RangeData> = {};
//     bottomRows.forEach(([key, value]) => {
//       const normalizedKey = normalizeKey(key);
//       const backendKey = keyMap[normalizedKey] || key;

//       const finalValue =
//         latestParams[normalizedKey] !== undefined
//           ? Number(latestParams[normalizedKey])
//           : (value?.baseline ?? 0); 

//       payload[backendKey] = {
//         ...value,
//         baseline: finalValue,
//       };
//     });
//     return payload;
//   };

//   const applyCalibration = async () => {
//     setIsApplying(true);
//     setStatusMessage("");
//     setStatusType("");

//     try {
//       const payload = buildPayload();
//       const res = await fetch(
//         `${base_api}/api/calibration/apply?machine=${encodeURIComponent(selectedMachine)}&die=${encodeURIComponent(selectedDie)}`, 
//         {
//           method: "POST",
//           headers: { 
//             "Content-Type": "application/json",
//             "ngrok-skip-browser-warning": "true" // Prevents HTML warning interception over active tunnels
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!res.ok) {
//         const errBody = await res.json();
//         console.error("422 detail:", errBody);
//         throw new Error(JSON.stringify(errBody));
//       }

//       const data = await res.json();
//       setStatusMessage(data.message || "Calibration Applied Successfully");
//       setStatusType("success");

//       // Refetch the database state to seamlessly update the top section metrics instantly
//       await fetchDatabaseLatest();
//     } catch(err) {
//       console.error(err);
//       setStatusMessage("Failed to apply calibration");
//       setStatusType("error");
//     } finally {
//       setIsApplying(false);
//       setTimeout(() => {
//         setStatusMessage("");
//       }, 4000);
//     }
//   };

//   if (isInitialLoading) {
//     return (
//       <div className="bg-[#07111F] min-h-screen w-full flex items-center justify-center flex-col gap-4">
//         <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
//         <p className="text-cyan-400 font-semibold tracking-wide animate-pulse">Loading Latest Configuration...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-[#07111F] min-h-screen text-white w-full max-w-none px-6 md:px-12 py-8">
      
//       <div className="mb-8">
//         <h1 className="text-2xl md:text-[38px] font-bold leading-tight md:leading-none">Machine Calibration</h1>
//         <p className="text-gray-500 mt-2 text-sm md:text-base">
//           Zero-defect operating windows derived from historical production data
//         </p>
//       </div>

//       <div className="mb-6 flex flex-wrap gap-4 items-end justify-between">
//         <div className="bg-[#121B2B] border border-[#1F2937] rounded-xl p-5 md:p-6 shadow-sm inline-block min-w-[250px]">
//           <div className="text-[11px] uppercase tracking-[2px] text-gray-500 mb-1.5">Samples Analyzed</div>
//           <div className="text-white text-3xl font-bold">
//             {bottomRows.length > 0
//               ? summary.samples_analyzed.toLocaleString()
//               : "--"}
//           </div>
//         </div>

//         {/* Action Button: Calculate Calibration */}
//         <button
//           onClick={calculateCalibration}
//           disabled={isCalculating || isApplying}
//           className={`
//             font-bold px-6 py-3 rounded-xl text-sm tracking-wide uppercase transition-colors
//             ${isCalculating 
//               ? "bg-purple-600/50 text-white/50 cursor-not-allowed"
//               : "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.2)]"
//             }
//           `}
//         >
//           {isCalculating ? "Calculating..." : "Calculate Calibration"}
//         </button>
//       </div>

//       <div className="flex flex-wrap gap-4 mb-10">
//         <div className="w-full sm:w-56">
//           <div className="text-xs text-gray-500 mb-1.5 uppercase tracking-[2px]">Machine</div>
//           <select
//             value={selectedMachine}
//             onChange={(e) => setSelectedMachine(e.target.value)}
//             className="w-full bg-[#121B2B] border border-[#1F2937] rounded-lg px-4 py-3 text-sm text-white outline-none cursor-pointer"
//           >
//             {machines.map((machine) => (
//               <option key={machine} value={machine}>
//                 {machine}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="w-full sm:w-56">
//           <div className="text-xs text-gray-500 mb-1.5 uppercase tracking-[2px]">Die</div>
//           <select
//             value={selectedDie}
//             onChange={(e) => setSelectedDie(e.target.value)}
//             className="w-full bg-[#121B2B] border border-[#1F2937] rounded-lg px-4 py-3 text-sm text-white outline-none cursor-pointer"
//           >
//             {dies.map((die) => (
//               <option key={die} value={die}>
//                 {die}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* TOP SECTION: Current Applied Calibration (Only uses live active database data from /latest) */}
//       <div className="mb-4 text-xl md:text-2xl font-semibold">Current Applied Calibration</div>

//       <div className="bg-[#121B2B] border border-[#1F2937] rounded-xl overflow-x-auto mb-10">
//         <div className="w-full min-w-[850px]">
//           <div className="hidden md:grid grid-cols-[4fr_3fr_5fr] gap-6 px-6 py-4 border-b border-[#1F2937] text-[11px] uppercase tracking-[2px] text-gray-500 items-center text-center w-full">
//             <div className="text-left">Parameter</div>
//             <div>Latest Snapshot Value</div>
//             <div>Status Summary</div>
//           </div>

//           {topRows.length === 0 ? (
//             <div className="text-center py-8 text-gray-500 text-sm">
//               No latest calibration found for this machine/die combination.
//             </div>
//           ) : (
//             topRows.map((normalizedKey, index) => {
//               const presentationKey = keyMap[normalizedKey] || normalizedKey.toUpperCase().replaceAll("_", " ");
//               const unit = getUnit(presentationKey);
//               const snapshotValue = baselineSnapshot[normalizedKey] || "0.00";

//               return (
//                 <div
//                   key={index}
//                   className="flex flex-col md:grid md:grid-cols-[4fr_3fr_5fr] gap-6 px-6 py-5 border-b border-[#182232] items-center text-center hover:bg-[#0D1625] transition-all w-full"
//                 >
//                   <div className="text-left w-full">
//                     <div className="text-white text-base font-semibold break-words">{presentationKey}</div>
//                   </div>

//                   <div className="flex justify-between md:justify-center items-center w-full border-b border-gray-800/40 pb-2 md:pb-0 md:border-none">
//                     <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider">Snapshot Value</span>
//                     <span className="text-cyan-400 font-bold text-base">
//                       {snapshotValue} {unit}
//                     </span>
//                   </div>

//                   <div className="w-full flex justify-center">
//                     <div className="bg-[#0F172A] border border-[#1F2937] rounded-lg px-4 py-2 text-xs text-gray-400 shadow-inner w-full text-center max-w-sm">
//                       Current calibration value applied to this machine.
//                     </div>
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>

//       {/* BOTTOM SECTION: Newly Corrected Recipe (Bound directly to user triggered calculation ranges) */}
//       <div className="bg-[#121B2B] border border-[#1F2937] rounded-xl p-5 md:p-8">
//         <h2 className="text-xl md:text-2xl font-semibold mb-6">Newly Corrected Recipe</h2>

//         {bottomRows.length === 0 ? (
//           <div className="text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-xl">
//             Click the <span className="text-purple-400 font-semibold">&quot;Calculate Calibration&quot;</span> button above to dynamically load operating profiles.
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {bottomRows.map(([key, value], index) => {
//               const normalizedKey = normalizeKey(key);
//               const unit = value?.unit || getUnit(key);

//               const inputValue = latestParams[normalizedKey] || "0.00";
//               const snapshotValue = baselineSnapshot[normalizedKey] || "—";

//               return (
//                 <div
//                   key={index}
//                   className="bg-[#0B1320] border border-[#1F2937] rounded-xl p-5 flex flex-col justify-between"
//                 >
//                   <div>
//                     <div className="text-white text-base font-semibold mb-3 truncate" title={key}>
//                       {key}
//                     </div>

//                     <div className="flex justify-between text-xs mb-4">
//                       <div>
//                         <div className="text-gray-500">Lower Limit</div>
//                         <div className="text-green-400 font-semibold mt-0.5">
//                           {Number(value?.min_range ?? 0).toFixed(2)} {unit}
//                         </div>
//                       </div>

//                       <div className="text-right">
//                         <div className="text-gray-500">Upper Limit</div>
//                         <div className="text-red-400 font-semibold mt-0.5">
//                           {Number(value?.max_range ?? 0).toFixed(2)} {unit}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="bg-[#121B2B] border border-[#1F2937]/60 rounded-lg p-2.5 mb-4 text-xs flex justify-between items-center">
//                       <div className="min-w-0 flex-1">
//                         <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Before</span>
//                         <span className="text-gray-400 font-medium truncate block w-full">
//                           {snapshotValue} {snapshotValue !== "—" ? unit : ""}
//                         </span>
//                       </div>
//                       <div className="text-gray-600 font-bold px-3 flex-shrink-0">→</div>
//                       <div className="text-right min-w-0 flex-1">
//                         <span className="text-gray-500 block text-[10px] uppercase tracking-wider">After</span>
//                         <span className="text-cyan-400 font-semibold truncate block w-full">
//                           {!isNaN(Number(inputValue)) ? Number(inputValue).toFixed(2) : inputValue} {unit}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="relative mt-1">
//                     <input
//                       type="number"
//                       step="0.01"
//                       value={inputValue}
//                       onChange={(e) =>
//                         handleChange(normalizedKey, e.target.value)
//                       }
//                       className="w-full bg-[#07111F] border border-[#1F2937] rounded-lg px-4 py-3 pr-16 text-sm text-white outline-none focus:border-cyan-400"
//                     />

//                     {unit && (
//                       <span className="absolute right-4 top-3 text-gray-500 text-sm select-none">
//                         {unit}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-8 md:mt-10">
//           {statusMessage && (
//             <div
//               className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
//                 statusType === "success"
//                   ? "bg-green-500/10 text-green-400 border border-green-500/20"
//                   : "bg-red-500/10 text-red-400 border border-red-500/20"
//               }`}
//             >
//               {statusMessage}
//             </div>
//           )}

//           <button
//             onClick={applyCalibration}
//             disabled={isApplying || bottomRows.length === 0}
//             className={`
//               font-bold px-8 py-3.5 rounded-xl text-base tracking-wide uppercase transition-colors
//               ${isApplying || bottomRows.length === 0
//                   ? "bg-cyan-600/30 text-white/20 cursor-not-allowed"
//                   : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.2)]"
//               }
//             `}
//           >
//             {isApplying ? "Applying..." : "Apply Calibration"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

// const base_api = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const base_api = "https://outspoken-pandemic-surfer.ngrok-free.dev"

type RangeData = {
  baseline: number;
  tolerance: number;
  min_range: number;
  max_range: number;
  unit?: string; 
};

type BackendCalibrationItem = {
  baseline: number;
  min_range: number;
  max_range: number;
};

type RangesResponse = {
  ranges: Record<string, RangeData>;
  samples_analyzed: number;
};

const getUnit = (key: string): string => {
  const lower = key.toLowerCase();
  if (lower.includes("mm")) return "mm";
  if (lower.includes("bar") || lower.includes("pressure")) return "bar";
  if (lower.includes("%")) return "%";
  if (lower.includes("sec") || lower.includes("time")) return "s";
  if (lower.includes("°c") || lower.includes("temperature")) return "°C";
  if (lower.includes("l/min")) return "L/min";
  if (lower.includes("m/s") || lower.includes("speed")) return "m/s";
  if (lower.includes("(t)")) return "T";
  return "";
};

const safeParseNumber = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined) return "0.00";
  const num = Number(val);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

export default function CalibrationPage() {
  const [ranges, setRanges] = useState<Record<string, RangeData>>({});
  const [latestParams, setLatestParams] = useState<Record<string, string>>({});
  
  const [baselineSnapshot, setBaselineSnapshot] = useState<Record<string, string>>({});
  const [baselineRanges, setBaselineRanges] = useState<
    Record<string, { lower_tolerance: number; upper_tolerance: number }>
  >({});
  const [keyMap, setKeyMap] = useState<Record<string, string>>({});
  
  const [selectedMachine, setSelectedMachine] = useState("UBE 850T-2");
  const [selectedDie, setSelectedDie] = useState("S16"); 

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const normalizeKey = useCallback((key: string): string => {
    return key
      .trim()
      .toLowerCase()
      .replaceAll("/", "_")
      .replaceAll("-", "_")
      .replaceAll(" ", "_");
  }, []);

  const fetchDatabaseLatest = useCallback(async () => {
    try {
      const res = await fetch(
        `${base_api}/api/calibration/latest?machine=${encodeURIComponent(selectedMachine)}&die=${encodeURIComponent(selectedDie)}`,
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );

      const data = await res.json();
      const formattedDb: Record<string, string> = {};
      const toleranceRanges: Record<string, { lower_tolerance: number; upper_tolerance: number }> = {};
      const mapping: Record<string, string> = {};

      if (data && typeof data === "object" && !Array.isArray(data)) {
        Object.entries(data).forEach(([k, v]) => {
          const normalized = normalizeKey(k);
          const value = v as BackendCalibrationItem;

          formattedDb[normalized] = safeParseNumber(value?.baseline);
          
          toleranceRanges[normalized] = {
            lower_tolerance: value?.min_range ?? 0,
            upper_tolerance: value?.max_range ?? 0,
          };
          
          mapping[normalized] = k;
        });
      }

      setBaselineSnapshot(formattedDb);
      setBaselineRanges(toleranceRanges);
      setKeyMap(mapping);
    } catch (err) {
      console.error("Failed to fetch latest DB calibration", err);
    }
  }, [selectedMachine, selectedDie, normalizeKey]);

  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true);
      try {
        await fetchDatabaseLatest();
      } catch (err) {
        console.error("Failed to load calibration data:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, [selectedMachine, selectedDie, fetchDatabaseLatest]);

  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState === "visible") {
        await fetchDatabaseLatest();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchDatabaseLatest]);

  const calculateCalibration = async () => {
    setIsCalculating(true);
    setStatusMessage("");
    setStatusType("");
    try {
      const headers = { "ngrok-skip-browser-warning": "true" };
      const res = await fetch(
        `${base_api}/api/calibration/ranges?machine=${encodeURIComponent(selectedMachine)}&die=${encodeURIComponent(selectedDie)}`, 
        { headers }
      );
      const data: RangesResponse = await res.json();
      
      setRanges(data.ranges || {});

      const mapping: Record<string, string> = { ...keyMap };
      const mathInputs: Record<string, string> = {};

      Object.entries(data.ranges || {}).forEach(([k, v]) => {
        const normK = normalizeKey(k);
        mapping[normK] = k;
        mathInputs[normK] = safeParseNumber(v.baseline);
      });

      setKeyMap(mapping);
      setLatestParams(mathInputs);
      setStatusMessage("Calculated optimized windows successfully.");
      setStatusType("success");
    } catch (err) {
      console.error("Failed to calculate ranges:", err);
      setStatusMessage("Failed to calculate targeted calibration ranges.");
      setStatusType("error");
    } finally {
      setIsCalculating(false);
      setTimeout(() => setStatusMessage(""), 4000);
    }
  };

  const machines = ["UBE 850T-1", "UBE 850T-2", "UBE 850T-3"];
  const dies = ["S14", "S15", "S16"]; 
  const bottomRows = useMemo(() => Object.entries(ranges), [ranges]);
  const topRows = useMemo(() => Object.keys(baselineSnapshot), [baselineSnapshot]);

  const handleChange = (key: string, value: string) => {
    setLatestParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const buildPayload = () => {
    const payload: Record<string, RangeData> = {};
    bottomRows.forEach(([key, value]) => {
      const normalizedKey = normalizeKey(key);
      const backendKey = keyMap[normalizedKey] || key;

      const finalValue =
        latestParams[normalizedKey] !== undefined
          ? Number(latestParams[normalizedKey])
          : (value?.baseline ?? 0); 

      payload[backendKey] = {
        ...value,
        baseline: finalValue,
      };
    });
    return payload;
  };

  const applyCalibration = async () => {
    setIsApplying(true);
    setStatusMessage("");
    setStatusType("");

    try {
      const payload = buildPayload();
      const res = await fetch(
        `${base_api}/api/calibration/apply?machine=${encodeURIComponent(selectedMachine)}&die=${encodeURIComponent(selectedDie)}`, 
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true" 
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(JSON.stringify(errBody));
      }

      const data = await res.json();
      setStatusMessage(data.message || "Calibration Applied Successfully");
      setStatusType("success");

      await fetchDatabaseLatest();
    } catch(err) {
      console.error(err);
      setStatusMessage("Failed to apply calibration");
      setStatusType("error");
    } finally {
      setIsApplying(false);
      setTimeout(() => setStatusMessage(""), 4000);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="bg-[#07111F] min-h-screen w-full flex items-center justify-center flex-col gap-4">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-cyan-400 font-semibold tracking-wide animate-pulse">Loading Latest Configuration...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#07111F] min-h-screen text-white w-full max-w-none px-6 md:px-12 py-8">
      
      <div className="mb-8">
        <h1 className="text-2xl md:text-[38px] font-bold leading-tight md:leading-none">Machine Calibration</h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">
          Zero-defect operating windows derived from historical production data
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 items-end justify-between">
        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-56">
            <div className="text-xs text-gray-500 mb-1.5 uppercase tracking-[2px]">Machine</div>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="w-full bg-[#121B2B] border border-[#1F2937] rounded-lg px-4 py-3 text-sm text-white outline-none cursor-pointer"
            >
              {machines.map((machine) => (
                <option key={machine} value={machine}>
                  {machine}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-56">
            <div className="text-xs text-gray-500 mb-1.5 uppercase tracking-[2px]">Die</div>
            <select
              value={selectedDie}
              onChange={(e) => setSelectedDie(e.target.value)}
              className="w-full bg-[#121B2B] border border-[#1F2937] rounded-lg px-4 py-3 text-sm text-white outline-none cursor-pointer"
            >
              {dies.map((die) => (
                <option key={die} value={die}>
                  {die}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={calculateCalibration}
          disabled={isCalculating || isApplying}
          className={`
            font-bold px-6 py-3 rounded-xl text-sm tracking-wide uppercase transition-colors
            ${isCalculating 
              ? "bg-purple-600/50 text-white/50 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.2)]"
            }
          `}
        >
          {isCalculating ? "Calculating..." : "Calculate Calibration"}
        </button>
      </div>

      <div className="mb-4 text-xl md:text-2xl font-semibold">Current Applied Calibration</div>

      <div className="bg-[#121B2B] border border-[#1F2937] rounded-xl overflow-x-auto mb-10">
        <div className="w-full min-w-[850px]">
          <div className="hidden md:grid grid-cols-[4fr_3fr_5fr] gap-6 px-6 py-4 border-b border-[#1F2937] text-[11px] uppercase tracking-[2px] text-gray-500 items-center text-center w-full">
            <div className="text-left">Parameter</div>
            <div>Latest Snapshot Value</div>
            <div>Tolerance Range</div>
          </div>

          {topRows.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No latest calibration found for this machine/die combination.
            </div>
          ) : (
            topRows.map((normalizedKey, index) => {
              const presentationKey = keyMap[normalizedKey] || normalizedKey.toUpperCase().replaceAll("_", " ");
              const unit = getUnit(presentationKey);
              const snapshotValue = baselineSnapshot[normalizedKey] || "0.00";
              const tolerance = baselineRanges[normalizedKey];

              return (
                <div
                  key={index}
                  className="flex flex-col md:grid md:grid-cols-[4fr_3fr_5fr] gap-6 px-6 py-5 border-b border-[#182232] items-center text-center hover:bg-[#0D1625] transition-all w-full"
                >
                  <div className="text-left w-full">
                    <div className="text-white text-base font-semibold break-words">{presentationKey}</div>
                  </div>

                  <div className="flex justify-between md:justify-center items-center w-full border-b border-gray-800/40 pb-2 md:pb-0 md:border-none">
                    <span className="md:hidden text-xs text-gray-500 uppercase tracking-wider">Snapshot Value</span>
                    <span className="text-cyan-400 font-bold text-base">
                      {snapshotValue} {unit}
                    </span>
                  </div>

                  <div className="w-full flex flex-col items-center justify-center gap-1">
                    {tolerance ? (
                      <span className="text-gray-300 font-semibold text-sm">
                        {tolerance.lower_tolerance.toFixed(2)} – {tolerance.upper_tolerance.toFixed(2)} {unit}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-[#121B2B] border border-[#1F2937] rounded-xl p-5 md:p-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-6">Newly Corrected Recipe</h2>

        {bottomRows.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-xl">
            Click the <span className="text-purple-400 font-semibold">&quot;Calculate Calibration&quot;</span> button above to dynamically load operating profiles.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bottomRows.map(([key, value], index) => {
              const normalizedKey = normalizeKey(key);
              const unit = value?.unit || getUnit(key);

              const inputValue = latestParams[normalizedKey] || "0.00";
              const snapshotValue = baselineSnapshot[normalizedKey] || "0.00";

              return (
                <div
                  key={index}
                  className="bg-[#0B1320] border border-[#1F2937] rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-white text-base font-semibold mb-3 truncate" title={key}>
                      {key}
                    </div>

                    <div className="flex justify-between text-xs mb-4">
                      <div>
                        <div className="text-gray-500">Lower Limit</div>
                        <div className="text-green-400 font-semibold mt-0.5">
                          {Number(value?.min_range ?? 0).toFixed(2)} {unit}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-gray-500">Upper Limit</div>
                        <div className="text-red-400 font-semibold mt-0.5">
                          {Number(value?.max_range ?? 0).toFixed(2)} {unit}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#121B2B] border border-[#1F2937]/60 rounded-lg p-2.5 mb-4 text-xs flex justify-between items-center">
                      <div className="min-w-0 flex-1">
                        <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Before</span>
                        <span className="text-gray-400 font-medium truncate block w-full">
                          {snapshotValue} {unit}
                        </span>
                      </div>
                      <div className="text-gray-600 font-bold px-3 flex-shrink-0">→</div>
                      <div className="text-right min-w-0 flex-1">
                        <span className="text-gray-500 block text-[10px] uppercase tracking-wider">After</span>
                        <span className="text-cyan-400 font-semibold truncate block w-full">
                          {!isNaN(Number(inputValue)) ? Number(inputValue).toFixed(2) : inputValue} {unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-1">
                    <input
                      type="number"
                      step="0.01"
                      value={inputValue}
                      onChange={(e) =>
                        handleChange(normalizedKey, e.target.value)
                      }
                      className="w-full bg-[#07111F] border border-[#1F2937] rounded-lg px-4 py-3 pr-16 text-sm text-white outline-none focus:border-cyan-400"
                    />

                    {unit && (
                      <span className="absolute right-4 top-3 text-gray-500 text-sm select-none">
                        {unit}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-8 md:mt-10">
          {statusMessage && (
            <div
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                statusType === "success"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {statusMessage}
            </div>
          )}

          <button
            onClick={applyCalibration}
            disabled={isApplying || bottomRows.length === 0}
            className={`
              font-bold px-8 py-3.5 rounded-xl text-base tracking-wide uppercase transition-colors
              ${isApplying || bottomRows.length === 0
                  ? "bg-cyan-600/30 text-white/20 cursor-not-allowed"
                  : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              }
            `}
          >
            {isApplying ? "Applying..." : "Apply Calibration"}
          </button>
        </div>
      </div>
    </div>
  );
}