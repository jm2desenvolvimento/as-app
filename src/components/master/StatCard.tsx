import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  colorClass?: string; // Ex: "text-blue-500 bg-blue-100"
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, colorClass }) => (
  <div className="flex items-center bg-white rounded-xl shadow p-5 min-w-[220px] transition hover:scale-105 hover:shadow-lg">
    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${colorClass} mr-4 text-2xl`}>
      {icon}
    </div>
    <div>
      <div className="text-gray-500 text-sm font-medium">{label}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  </div>
);

export default StatCard; 