function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    indigo: "bg-indigo-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm font-medium">{title}</span>
        <div className={`${colors[color]} p-2 rounded-lg text-white`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

export default StatCard;
