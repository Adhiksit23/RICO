// "use client";

// import { useEffect, useState } from "react";

// export default function CalibrationPage() {

//   const [latestParams, setLatestParams] = useState<any>({});
//   const [ranges, setRanges] = useState<any>({});
//   const [applyStatus, setApplyStatus] = useState("");

//   // Fetch latest parameters
//   useEffect(() => {

//     fetch("http://127.0.0.1:8000/api/calibration/latest")
//       .then((res) => res.json())
//       .then((data) => {
//         setLatestParams(data);
//       })
//       .catch((err) => console.error(err));

//     fetch("http://127.0.0.1:8000/api/calibration/ranges")
//       .then((res) => res.json())
//       .then((data) => {
//         setRanges(data);
//       })
//       .catch((err) => console.error(err));

//   }, []);

//   // Update parameter locally
//   const handleChange = (key: string, value: string) => {

//     setLatestParams({
//       ...latestParams,
//       [key]: value,
//     });

//   };

//   // Update API
//   const updateParameters = async () => {

//     try {

//       const res = await fetch(
//         "http://127.0.0.1:8000/api/calibration/update",
//         {
//           method: "POST",

//           headers: {
//             "Content-Type": "application/json",
//           },

//           body: JSON.stringify(latestParams),
//         }
//       );

//       const data = await res.json();

//       setApplyStatus(data.message);

//     } catch (err) {

//       console.error(err);

//     }
//   };

//   // Apply Calibration API
//   const applyCalibration = async () => {

//     try {

//       const res = await fetch(
//         "http://127.0.0.1:8000/api/calibration/apply",
//         {
//           method: "POST",

//           headers: {
//             "Content-Type": "application/json",
//           },

//           body: JSON.stringify(latestParams),
//         }
//       );

//       const data = await res.json();

//       setApplyStatus(data.message);

//     } catch (err) {

//       console.error(err);

//     }
//   };

//   return (

//     <div className="bg-[#0B1120] min-h-screen text-white px-8 py-6">

//       {/* Header */}
//       <div className="mb-8">

//         <h1 className="text-4xl font-bold">
//           Machine Calibration
//         </h1>

//         <p className="text-gray-500 mt-2">
//           Live calibration workflow connected to backend APIs
//         </p>

//       </div>

//       {/* Latest Parameters */}
//       <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-6 mb-8">

//         <h2 className="text-2xl font-semibold mb-6">
//           Latest Die Parameters
//         </h2>

//         <div className="grid grid-cols-2 gap-6">

//           {Object.entries(latestParams).map(([key, value]: any) => (

//             <div key={key}>

//               <label className="block text-gray-400 mb-2 capitalize">
//                 {key.replaceAll("_", " ")}
//               </label>

//               <input
//                 type="number"
//                 value={value}
//                 onChange={(e) => handleChange(key, e.target.value)}
//                 className="w-full bg-[#0F172A] border border-[#252D3D] rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-400"
//               />

//             </div>

//           ))}

//         </div>

//       </div>

//       {/* Calibration Ranges */}
//       <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl p-6 mb-8">

//         <h2 className="text-2xl font-semibold mb-6">
//           Recommended Calibration Ranges
//         </h2>

//         <div className="space-y-5">

//           {Object.entries(ranges).map(([key, value]: any) => (

//             <div
//               key={key}
//               className="bg-[#0F172A] border border-[#252D3D] rounded-xl p-5"
//             >

//               <div className="flex justify-between items-center mb-4">

//                 <h3 className="text-xl font-semibold text-cyan-400">
//                   {key}
//                 </h3>

//                 <div className="text-green-400">
//                   Baseline: {value.baseline}
//                 </div>

//               </div>

//               <div className="grid grid-cols-3 gap-4 text-sm">

//                 <div>
//                   <span className="text-gray-500">
//                     Min Range
//                   </span>

//                   <div className="mt-1 text-white">
//                     {value.min_range}
//                   </div>
//                 </div>

//                 <div>
//                   <span className="text-gray-500">
//                     Max Range
//                   </span>

//                   <div className="mt-1 text-white">
//                     {value.max_range}
//                   </div>
//                 </div>

//                 <div>
//                   <span className="text-gray-500">
//                     Tolerance
//                   </span>

//                   <div className="mt-1 text-white">
//                     {value.tolerance}
//                   </div>
//                 </div>

//               </div>

//             </div>

//           ))}

//         </div>

//       </div>

//       {/* Action Buttons */}
//       <div className="flex gap-6 justify-center mt-10">

//         <button
//           onClick={updateParameters}
//           className="bg-yellow-500 hover:bg-yellow-400 transition-all text-black font-bold px-8 py-4 rounded-xl text-lg"
//         >
//           UPDATE PARAMETERS
//         </button>

//         <button
//           onClick={applyCalibration}
//           className="bg-cyan-500 hover:bg-cyan-400 transition-all text-black font-bold px-8 py-4 rounded-xl text-lg"
//         >
//           APPLY CALIBRATION
//         </button>

//       </div>

//       {/* Status */}
//       <div className="text-center text-cyan-400 mt-6 text-lg font-semibold">
//         {applyStatus}
//       </div>

//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

const parameterUnits: any = {
  "Cooling Time": "s",
  "Spray Time": "s",
  "Metal Pressure": "bar",
  "Metal Temperature": "°C",
  "Pouring Time": "s",
  "Shot Forward Time": "s",
  "Die Open/Core Out Time": "s",
  "Ejector Time": "s",
  "Extraction Time": "s",
  "Speed 1": "m/s",
  "Speed 2": "m/s",
  "Speed 3": "m/s",
};

export default function CalibrationPage() {

  const [summary, setSummary] = useState({
    samples_analyzed: 52296,
    avg_cpk: 1.75,
    excellent_parameters: 14,
  });

  const [ranges, setRanges] = useState<any>({});
  const [latestParams, setLatestParams] = useState<any>({});
  const [status, setStatus] = useState("");

  // Fetch APIs
  useEffect(() => {

    // Summary
    fetch("http://127.0.0.1:8000/api/calibrator/run")
      .then((res) => res.json())
      .then((data) => {
        setSummary(data);
      })
      .catch((err) => console.error(err));

    // Latest Parameters
    fetch("http://127.0.0.1:8000/api/calibration/latest")
      .then((res) => res.json())
      .then((data) => {
        setLatestParams(data);
      })
      .catch((err) => console.error(err));

    // Calibration Ranges
    fetch("http://127.0.0.1:8000/api/calibration/ranges")
      .then((res) => res.json())
      .then((data) => {
        setRanges(data);
      })
      .catch((err) => console.error(err));

  }, []);

  // Handle Input Change
  const handleChange = (key: string, value: string) => {

    setLatestParams({
      ...latestParams,
      [key]: value,
    });

  };

  // Update Parameters
  const updateParameters = async () => {

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/api/calibration/update",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(latestParams),
        }
      );

      const data = await res.json();

      setStatus(data.message);

    } catch (err) {

      console.error(err);

    }
  };

  // Apply Calibration
  const applyCalibration = async () => {

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/api/calibration/apply",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(latestParams),
        }
      );

      const data = await res.json();

      setStatus(data.message);

    } catch (err) {

      console.error(err);

    }
  };

  return (

    <div className="bg-[#081122] min-h-screen text-white px-6 py-5">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">

        <div className="flex items-start gap-4">

          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-2xl">
            📊
          </div>

          <div>

            <h1 className="text-[38px] font-bold leading-none">
              Machine Calibration
            </h1>

            <p className="text-gray-500 mt-2 text-sm">
              Zero-defect operating windows derived from historical production data
            </p>

          </div>

        </div>

        {/* Summary Cards */}
        <div className="flex gap-3">

          <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl px-5 py-3 min-w-[130px]">

            <div className="text-gray-500 text-[10px] uppercase tracking-[2px]">
              Samples Analyzed
            </div>

            <div className="text-white text-2xl font-bold mt-2">
              {summary.samples_analyzed.toLocaleString()}
            </div>

          </div>

          <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl px-5 py-3 min-w-[110px]">

            <div className="text-gray-500 text-[10px] uppercase tracking-[2px]">
              Avg CPK
            </div>

            <div className="text-cyan-400 text-2xl font-bold mt-2">
              {Number(summary.avg_cpk).toFixed(2)}
            </div>

          </div>

          <div className="bg-[#151C2C] border border-green-500/20 rounded-xl px-5 py-3 min-w-[120px]">

            <div className="text-gray-500 text-[10px] uppercase tracking-[2px]">
              Excellent
            </div>

            <div className="text-green-400 text-2xl font-bold mt-2">
              {summary.excellent_parameters} / 21
            </div>

          </div>

        </div>

      </div>

      {/* Legend */}
      <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl px-5 py-4 mb-4 flex items-center gap-6 text-sm">

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="text-gray-400">
            Tolerance Band
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-gray-400">
            Zero-Defect Range
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded bg-cyan-400" />
          <span className="text-gray-400">
            Computed Baseline
          </span>
        </div>

      </div>

      {/* Table */}
      <div className="bg-[#151C2C] border border-[#252D3D] rounded-xl overflow-hidden">

        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_0.7fr_2fr_1fr_0.7fr] px-6 py-4 border-b border-[#252D3D] text-[11px] uppercase tracking-[2px] text-gray-500">

          <div>Parameter</div>
          <div>Baseline</div>
          <div>Optimal Range</div>
          <div>Std Dev</div>
          <div>Range Visualization</div>
          <div>Current Value</div>
          <div>Action</div>

        </div>

        {/* Dynamic Rows */}
        {Object.entries(ranges).map(([key, value]: any, index) => (

          <div
            key={index}
            className="grid grid-cols-[2fr_1fr_1fr_0.7fr_2fr_1fr_0.7fr] px-6 py-5 border-b border-[#1E293B] items-center hover:bg-[#101827] transition-all"
          >

            {/* Parameter */}
            <div>

              <div className="text-white text-lg font-semibold">
                {key}
              </div>

              <div className="text-gray-500 text-sm mt-1">
                Recommended operating window
              </div>

            </div>

            {/* Baseline */}
            <div className="text-cyan-400 text-lg font-semibold">
              {Number(value.baseline).toFixed(2)}{" "}
              {parameterUnits[key] || ""}
            </div>

            {/* Optimal Range */}
            <div className="text-green-400 text-lg">
              {Number(value.min_range).toFixed(2)} -{" "}
              {Number(value.max_range).toFixed(2)}{" "}
              {parameterUnits[key] || ""}
            </div>

            {/* Std Dev */}
            <div className="text-gray-400">
              ±{Number(value.tolerance).toFixed(2)}{" "}
              {parameterUnits[key] || ""}
            </div>

            {/* Range Visualization */}
            <div className="pr-6">

              <div className="relative h-8 rounded-full bg-[#0F172A] border border-[#1E293B] overflow-hidden">

                <div className="absolute left-[30%] top-0 h-full w-[40%] bg-green-500/20" />

                <div className="absolute left-1/2 top-0 h-full w-[3px] bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />

              </div>

            </div>

            {/* Editable Current Value */}
            <div>

              <input
                type="number"
                value={
                  latestParams[
                    key.toLowerCase().replaceAll(" ", "_")
                  ] || ""
                }
                onChange={(e) =>
                  handleChange(
                    key.toLowerCase().replaceAll(" ", "_"),
                    e.target.value
                  )
                }
                className="bg-[#0F172A] border border-[#252D3D] rounded-lg px-3 py-2 w-full text-white outline-none focus:border-cyan-400"
              />

              <div className="text-gray-500 text-xs mt-1">
                {parameterUnits[key] || ""}
              </div>

            </div>

            {/* Action */}
            <div>

              <button
                onClick={updateParameters}
                className="bg-yellow-500 hover:bg-yellow-400 transition-all text-black px-3 py-2 rounded-lg text-sm font-bold"
              >
                UPDATE
              </button>

            </div>

          </div>

        ))}

      </div>

      {/* Bottom Buttons */}
      <div className="flex justify-center gap-6 mt-10">

        <button
          onClick={updateParameters}
          className="bg-yellow-500 hover:bg-yellow-400 transition-all text-black font-bold px-8 py-4 rounded-xl text-lg"
        >
          UPDATE PARAMETERS
        </button>

        <button
          onClick={applyCalibration}
          className="bg-cyan-500 hover:bg-cyan-400 transition-all text-black font-bold px-8 py-4 rounded-xl text-lg"
        >
          APPLY CALIBRATION
        </button>

      </div>

      {/* Status */}
      <div className="text-center text-cyan-400 mt-6 text-lg font-semibold">
        {status}
      </div>

    </div>
  );
}