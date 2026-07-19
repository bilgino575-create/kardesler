// Standard EAN-13 encoding tables (GS1 spec).
const L_CODE = [
  "0001101", "0011001", "0010011", "0111101", "0100011",
  "0110001", "0101111", "0111011", "0110111", "0001011",
];
const G_CODE = [
  "0100111", "0110011", "0011011", "0100001", "0011101",
  "0111001", "0000101", "0010001", "0001001", "0010111",
];
const R_CODE = [
  "1110010", "1100110", "1101100", "1000010", "1011100",
  "1001110", "1010000", "1000100", "1001000", "1110100",
];

// Which of L/G to use for each of the 6 left digits, indexed by the first digit.
const PARITY = [
  "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
  "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL",
];

const START_GUARD = "101";
const MIDDLE_GUARD = "01010";
const END_GUARD = "101";

export function isValidEan13(code: string): boolean {
  return /^\d{13}$/.test(code);
}

/** Returns a 95-character string of '1' (bar) / '0' (space) modules. */
export function encodeEan13(code: string): string {
  if (!isValidEan13(code)) {
    throw new Error(`Geçersiz EAN-13 kodu: ${code}`);
  }

  const digits = code.split("").map(Number);
  const parity = PARITY[digits[0]];
  const left = digits
    .slice(1, 7)
    .map((digit, index) => (parity[index] === "L" ? L_CODE[digit] : G_CODE[digit]))
    .join("");
  const right = digits.slice(7, 13).map((digit) => R_CODE[digit]).join("");

  return START_GUARD + left + MIDDLE_GUARD + right + END_GUARD;
}
