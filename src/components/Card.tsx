type CardProps = {
  title: string;
  value: number;
  color: "green" | "red" | "blue";
};

export default function Card({ title, value, color }: CardProps) {
  const colorMap = {
    green: "text-emerald-600",
    red: "text-rose-600",
    blue: "text-indigo-600",
  };

  return (
    <div className="
      bg-white 
      rounded-2xl 
      shadow-sm 
      border border-slate-100 
      p-4 
      flex-1
    ">
      <p className="text-xs text-slate-400 mb-1">
        {title}
      </p>
      <p className={`text-lg font-semibold ${colorMap[color]}`}>
        R$ {value.toFixed(2)}
      </p>
    </div>
  );
}
