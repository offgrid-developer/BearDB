// src/components/BearingForm.tsx
import React, { useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// ----------------- Loader Components -----------------
function Gear({ radius = 1, thickness = 0.4, color = "#00bfff", speed = 0.01, position = [0, 0, 0] }) {
  const meshRef = React.useRef<THREE.Mesh>(null!);
  useFrame(() => {
    meshRef.current.rotation.z += speed;
  });
  const geometry = new THREE.CylinderGeometry(radius, radius, thickness, 64);
  geometry.rotateX(Math.PI / 2);

  return (
    <mesh ref={meshRef} geometry={geometry} position={position}>
      <meshPhysicalMaterial
        color={color}
        metalness={0.7}
        roughness={0.2}
        transparent
        opacity={0.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

function EnergyLine({ points }: { points: [number, number, number][] }) {
  const materialRef = React.useRef<THREE.LineBasicMaterial>(null!);
  let pulse = 0;
  useFrame(() => {
    pulse += 0.03;
    if (materialRef.current) {
      materialRef.current.color = new THREE.Color(`hsl(${(pulse * 40) % 360}, 80%, 60%)`);
    }
  });

  const vectorPoints = points.map((p) => new THREE.Vector3(...p));
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(vectorPoints);

  return (
    <line geometry={lineGeometry} ref={materialRef}>
      <lineBasicMaterial color="#00ffff" linewidth={2} />
    </line>
  );
}

function ServerGearLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-200">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 3, 6]} fov={35} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <pointLight position={[-5, 3, -5]} intensity={0.5} />

        <mesh>
          <boxGeometry args={[4, 4, 4]} />
          <meshPhysicalMaterial
            color="#a0d8ff"
            transparent
            opacity={0.15}
            roughness={0}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        <Gear radius={1.2} thickness={0.5} color="#00bfff" speed={0.01} position={[0, 0, 0]} />
        <Gear radius={0.8} thickness={0.4} color="#00ffff" speed={-0.015} position={[1.5, 0, 0]} />
        <Gear radius={0.8} thickness={0.4} color="#00ffff" speed={-0.015} position={[-1.5, 0, 0]} />

        <EnergyLine points={[[0, 0, 0], [1.5, 0, 0]]} />
        <EnergyLine points={[[0, 0, 0], [-1.5, 0, 0]]} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.03} />
        </mesh>
      </Canvas>
    </div>
  );
}

// ----------------- Bearing Form Component -----------------
export default function BearingForm() {
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [subtype, setSubtype] = useState("");
  const [tracker, setTracker] = useState(0);

  const categoryData: Record<string, Record<string, string[]>> = {
    Bearing: {
      "Deep Groove Ball Bearing": ["6000 Series", "6200 Series", "6300 Series"],
      "Angular Contact Ball Bearing": ["7000 Series", "7200 Series"],
      "Self-Aligning Ball Bearing": ["1200 Series", "1300 Series"],
      "Cylindrical Roller Bearing": ["NU Series", "NJ Series", "NUP Series"],
      "Spherical Roller Bearing": ["22200 Series", "22300 Series"],
      "Tapered Roller Bearing": ["30200 Series", "30300 Series"],
      "Thrust Ball Bearing": ["51100 Series", "51200 Series"],
    },
    "Bearing Unit Housing": {
      "Pillow Block Unit": ["UCP Series", "UCFL Series"],
      "Flanged Housing Unit": ["UCFC Series", "UCF Series"],
      "Take-up Housing Unit": ["UCT Series"],
    },
    "Bearing Accessory": {
      "Adapter Sleeves": ["H200 Series", "H300 Series", "H2300 Series", "H3100 Series"],
      "Withdrawal Sleeves": ["AH200 Series", "AH300 Series", "AH2300 Series", "AH3100 Series"],
      "Lock Nuts": ["KM Series", "HM Series", "AN Series", "N Series"],
      "Lock Washers": ["MB Series", "MS Series", "W Series", "AW Series"],
      "Seals": ["TC Seal", "VC Seal", "CS Seal", "LB Seal"],
      "End Covers": ["EC200 Series", "EC300 Series", "ECS Series", "ECL Series"],
    },
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setType("");
    setSubtype("");
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value);
    setSubtype("");
  };

  const handleInputChange = () => {
    const totalLetters = [
      category,
      type,
      subtype,
      (document.getElementById("bearingNumber") as HTMLInputElement).value,
      (document.getElementById("seal") as HTMLInputElement).value,
      (document.getElementById("suffix") as HTMLInputElement).value,
      (document.getElementById("make") as HTMLInputElement).value,
    ]
      .join("")
      .replace(/\s+/g, "").length;
    setTracker(totalLetters > 40 ? 40 : totalLetters);
  };

  const downloadFile = (format: "csv" | "xls") => {
    const fields = [
      category,
      type,
      subtype,
      (document.getElementById("bearingNumber") as HTMLInputElement).value,
      (document.getElementById("seal") as HTMLInputElement).value,
      (document.getElementById("suffix") as HTMLInputElement).value,
      (document.getElementById("make") as HTMLInputElement).value,
    ];
    const content = [
      ["Category", "Type", "Subtype", "BearingNumber/Code", "Seal", "Suffix", "Make"],
      fields,
    ];
    const blob =
      format === "csv"
        ? new Blob([content.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" })
        : new Blob([content.map((r) => r.join("\t")).join("\n")], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = format === "csv" ? "BearingData.csv" : "BearingData.xls";
    link.click();
  };

  const resetForm = () => {
    setCategory("");
    setType("");
    setSubtype("");
    (document.getElementById("bearingNumber") as HTMLInputElement).value = "";
    (document.getElementById("seal") as HTMLInputElement).value = "";
    (document.getElementById("suffix") as HTMLInputElement).value = "";
    (document.getElementById("make") as HTMLInputElement).value = "";
    setTracker(0);
  };

  return (
    <>
      {loading && <ServerGearLoader />}

      <div className="relative z-10 w-full max-w-2xl mx-auto p-6">
        <div className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-3xl p-10 shadow-lg text-slate-700">
          <h1 className="text-2xl font-semibold text-center mb-8 text-[#4a6078]">
            Bearing Specification Form
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-[#5a6e80]">Category</label>
              <select
                id="category"
                className="w-full rounded-xl border border-slate-300 bg-[#f5f7fa] px-4 py-2 outline-none"
                value={category}
                onChange={handleCategoryChange}
              >
                <option value="">Select Category</option>
                {Object.keys(categoryData).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-[#5a6e80]">Type</label>
              <select
                id="type"
                className="w-full rounded-xl border border-slate-300 bg-[#f5f7fa] px-4 py-2 outline-none"
                value={type}
                disabled={!category}
                onChange={handleTypeChange}
              >
                <option value="">Select Type</option>
                {category && Object.keys(categoryData[category]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-[#5a6e80]">Subtype</label>
              <select
                id="subtype"
                className="w-full rounded-xl border border-slate-300 bg-[#f5f7fa] px-4 py-2 outline-none"
                value={subtype}
                disabled={!type}
                onChange={(e) => setSubtype(e.target.value)}
              >
                <option value="">Select Subtype</option>
                {type && categoryData[category][type].map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-[#5a6e80]">Bearing Number / Code</label>
              <input
                id="bearingNumber"
                type="text"
                className="w-full rounded-xl border border-slate-300 bg-[#f5f7fa] px-4 py-2 outline-none"
                placeholder="Enter Bearing Number"
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block mb-2 text-[#5a6e80]">Seal (Optional)</label>
              <input
                id="seal"
                type="text"
                className="w-full rounded-xl border border-slate-300 bg-[#f5f7fa] px-4 py-2 outline-none"
                placeholder="e.g. ZZ, RS"
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block mb-2 text-[#5a6e80]">Suffix (Optional)</label>
              <input
                id="suffix"
                type="text"
                className="w-full rounded-xl border border-slate-300 bg-[#f5f7fa] px-4 py-2 outline-none"
                placeholder="e.g. C3, NR"
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block mb-2 text-[#5a6e80]">Make / Application</label>
              <input
                id="make"
                type="text"
                className="w-full rounded-xl border border-slate-300 bg-[#f5f7fa] px-4 py-2 outline-none"
                placeholder="e.g. SKF, Pump Assembly"
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-10">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => downloadFile("csv")}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#a2c2e2] to-[#8eb4da] text-[#2e3e50] font-medium"
              >
                Download CSV
              </button>
              <button
                onClick={() => downloadFile("xls")}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#a2e2c1] to-[#8edab6] text-[#2e3e50] font-medium"
              >
                Download Excel
              </button>
            </div>

            <button
              onClick={resetForm}
              className="px-5 py-2 bg-[#e6eef3] text-[#4a6078] rounded-xl border border-slate-200"
            >
              Reset
            </button>
          </div>

          <div className="tracker-ring mt-6 text-center text-[#5e728e] font-semibold">
            {tracker >= 40 ? "⚪ Max Reached" : `🔵 ${tracker} / 40 Letters`}
          </div>
        </div>
      </div>
    </>
  );
}
