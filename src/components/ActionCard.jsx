function ActionCard({
  title,
  description,
  icon: Icon,
  color,
  onClick,
  disabled,
}) {
  const colors = {
    indigo: "bg-indigo-50 hover:bg-indigo-100 text-indigo-600",
    purple: "bg-purple-50 hover:bg-purple-100 text-purple-600",
    green: "bg-green-50 hover:bg-green-100 text-green-600",
    red: "bg-red-50 hover:bg-red-100 text-red-600",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${colors[color]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } p-6 rounded-xl text-left transition-all hover:shadow-lg`}
    >
      <Icon className="w-8 h-8 mb-3" />
      <h3 className="text-xl font-semibold mb-1">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </button>
  );
}

export default ActionCard;
