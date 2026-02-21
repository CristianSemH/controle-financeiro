
export default function Spinner({ size = 40 }: { size?: number }) {
  return (
    <div
      className="animate-spin rounded-full border-4 border-gray-200 border-t-[#6366F1]"
      style={{
        width: size,
        height: size,
      }}
    />
  );
}