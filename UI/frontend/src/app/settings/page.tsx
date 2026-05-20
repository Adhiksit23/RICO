"use client";

import { useState } from "react";

const metrics = [
  {
    label: "Accuracy",
    value: "96.8%",
    color: "text-cyan-400",
  },
  {
    label: "Precision",
    value: "94.2%",
    color: "text-green-400",
  },
  {
    label: "Recall",
    value: "92.5%",
    color: "text-yellow-400",
  },
  {
    label: "F1 Score",
    value: "93.3%",
    color: "text-pink-400",
  },
  {
    label: "ROC-AUC",
    value: "0.97",
    color: "text-purple-400",
  },
];

export default function SettingsPage() {
  const [status, setStatus] = useState("");

  const handleTrain = async () => {
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/trainer/train"
      );

      const data = await res.json();

      setStatus(data.status);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalibration = async () => {
    try {
      await fetch(
        "http://127.0.0.1:8000/api/calibrator/run"
      );

      setStatus("Calibration Triggered");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#0B1120] min-h-screen text-white px-6 py-5">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[40px] font-bold text-cyan-400 leading-none">
          SETTINGS & MODEL CONTROL
        </h1>

        <p className="text-gray-500 mt-2">
          Configure AI workflows, calibration pipelines, and training controls
        </p>
      </div>

      {/* Top Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Train Model */}
        <div className="bg-[#151C2C] border border-[#252D3D] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold">
                Model Training
              </h2>

              <p className="text-gray-500 mt-2">
                Train defect prediction models using production datasets
              </p>
            </div>

            <div className="text-5xl">
              🤖
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">
                Defect Type
              </label>

              <select className="w-full mt-2 bg-[#0F172A] border border-[#252D3D] rounded-xl px-4 py-3 outline-none">
                <option>Non-filling</option>
                <option>Blowhole</option>
                <option>Porosity</option>
                <option>Shrinkage</option>
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-sm">
                Training Dataset
              </label>

              <input
                type="file"
                className="w-full mt-2 bg-[#0F172A] border border-[#252D3D] rounded-xl px-4 py-3"
              />
            </div>

            <button
              onClick={handleTrain}
              className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 transition-all text-black font-bold py-4 rounded-xl"
            >
              TRAIN MODEL
            </button>
          </div>
        </div>

        {/* Calibration */}
        <div className="bg-[#151C2C] border border-[#252D3D] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold">
                Machine Calibration
              </h2>

              <p className="text-gray-500 mt-2">
                Generate zero-defect operating windows from historical data
              </p>
            </div>

            <div className="text-5xl">
              ⚙️
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">
                Machine ID
              </label>

              <select className="w-full mt-2 bg-[#0F172A] border border-[#252D3D] rounded-xl px-4 py-3 outline-none">
                <option>850T-1</option>
                <option>850T-2</option>
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-sm">
                Historical Samples
              </label>

              <input
                type="number"
                value="52296"
                readOnly
                className="w-full mt-2 bg-[#0F172A] border border-[#252D3D] rounded-xl px-4 py-3 outline-none"
              />
            </div>

            <button
              onClick={handleCalibration}
              className="w-full mt-4 bg-green-500 hover:bg-green-400 transition-all text-black font-bold py-4 rounded-xl"
            >
              RUN CALIBRATION
            </button>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6 text-cyan-400 text-lg font-semibold">
        {status}
      </div>

      {/* Metrics Section */}
      <div className="bg-[#151C2C] border border-[#252D3D] rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">
              Model Evaluation Metrics
            </h2>

            <p className="text-gray-500 mt-1">
              Latest training performance statistics
            </p>
          </div>

          <div className="bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-xl text-sm border border-cyan-500/20">
            Last Updated: 5 mins ago
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-5 gap-5">
          {metrics.map((item) => (
            <div
              key={item.label}
              className="bg-[#0F172A] border border-[#252D3D] rounded-xl p-5 text-center"
            >
              <div className="text-gray-500 text-sm">
                {item.label}
              </div>

              <div className={`text-4xl font-bold mt-4 ${item.color}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* API Status */}
        <div className="bg-[#151C2C] border border-[#252D3D] rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-5">
            API Status
          </h3>

          <div className="space-y-4">
            {[
              "Trainer API",
              "Predictor API",
              "Calibration API",
            ].map((api) => (
              <div
                key={api}
                className="flex justify-between items-center"
              >
                <span className="text-gray-300">
                  {api}
                </span>

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />

                  <span className="text-green-400 text-sm">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dataset Info */}
        <div className="bg-[#151C2C] border border-[#252D3D] rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-5">
            Dataset Information
          </h3>

          <div className="space-y-5">
            <div>
              <div className="text-gray-500 text-sm">
                Total Samples
              </div>

              <div className="text-3xl font-bold text-cyan-400 mt-2">
                52,296
              </div>
            </div>

            <div>
              <div className="text-gray-500 text-sm">
                Defect Classes
              </div>

              <div className="text-3xl font-bold text-yellow-400 mt-2">
                6
              </div>
            </div>

            <div>
              <div className="text-gray-500 text-sm">
                Last Upload
              </div>

              <div className="text-lg mt-2">
                30 Apr 2026
              </div>
            </div>
          </div>
        </div>

        {/* Deployment */}
        <div className="bg-[#151C2C] border border-[#252D3D] rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-5">
            Deployment Status
          </h3>

          <div className="space-y-5">
            <div className="flex justify-between">
              <span className="text-gray-400">
                Model Version
              </span>

              <span className="text-cyan-400 font-semibold">
                v2.4.1
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">
                Last Training
              </span>

              <span>
                2 hrs ago
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">
                Status
              </span>

              <span className="text-green-400">
                Production Ready
              </span>
            </div>

            <button className="w-full mt-6 bg-purple-500 hover:bg-purple-400 transition-all text-white font-bold py-4 rounded-xl">
              DEPLOY MODEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}