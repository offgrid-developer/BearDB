import React from "react";
import BearingForm from "./components/BearingForm";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl">
        <BearingForm />
      </div>
      <footer className="mt-10 text-gray-500 text-sm text-center">
        © 2025 BearDB | Bearing Specification System
      </footer>
    </div>
  );
}
