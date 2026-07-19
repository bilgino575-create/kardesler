import QRCode from "qrcode";

export async function QrCode({
  value,
  size = 120,
}: {
  value: string;
  size?: number;
}) {
  const svg = await QRCode.toString(value, {
    type: "svg",
    margin: 1,
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  return (
    <div
      style={{ width: size, height: size }}
      // Generated server-side from our own product data — not user-supplied HTML.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
