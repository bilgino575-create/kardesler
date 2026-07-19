// Turkey GS1 prefix (869) + 9-digit sequence + EAN-13 check digit.
export function generateBarcode(sequence: number): string {
  const body = `869${String(sequence).padStart(9, "0")}`;
  const digits = body.split("").map(Number);
  const sum = digits.reduce(
    (acc, digit, index) => acc + digit * (index % 2 === 0 ? 1 : 3),
    0,
  );
  const checkDigit = (10 - (sum % 10)) % 10;
  return `${body}${checkDigit}`;
}

export function generateProductCode(sequence: number): string {
  return `KT-${String(sequence).padStart(6, "0")}`;
}

export function generateSku(sequence: number): string {
  return `SKU-${String(sequence).padStart(6, "0")}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
