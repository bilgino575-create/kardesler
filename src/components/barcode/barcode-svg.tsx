import { encodeEan13, isValidEan13 } from "@/lib/barcode/ean13";

export function BarcodeSvg({
  value,
  barWidth = 2,
  height = 60,
}: {
  value: string;
  barWidth?: number;
  height?: number;
}) {
  if (!isValidEan13(value)) {
    return (
      <div className="flex h-16 items-center justify-center rounded border border-dashed border-slate-300 text-xs text-slate-400">
        Geçersiz barkod
      </div>
    );
  }

  const modules = encodeEan13(value);
  const width = modules.length * barWidth;

  let x = 0;
  const bars: { x: number; width: number }[] = [];
  for (const bit of modules) {
    if (bit === "1") {
      bars.push({ x, width: barWidth });
    }
    x += barWidth;
  }

  return (
    <div className="inline-flex flex-col items-center">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Barkod ${value}`}
      >
        <rect x={0} y={0} width={width} height={height} fill="white" />
        {bars.map((bar) => (
          <rect key={bar.x} x={bar.x} y={0} width={bar.width} height={height} fill="black" />
        ))}
      </svg>
      <span className="mt-1 font-mono text-xs tracking-widest text-slate-700">
        {value}
      </span>
    </div>
  );
}
