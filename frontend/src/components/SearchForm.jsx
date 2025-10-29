import React from "react";
import logo from "../vite.svg"; // replace with your logo

export default function Header() {
  return (
    <div className="flex items-center mb-6">
      <img src={logo} alt="Logo" className="h-6 mr-3" />
      <h1 className="text-gray-800 font-semibold text-xl">Bearing & Accessories Specification</h1>
    </div>
  );
}
