import React from "react";
import BearingForm from "./BearingForm";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center py-10">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-8">
        <BearingForm />
      </div>
    </div>
  );
}
