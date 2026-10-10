/** Rejects obviously fake Indian mobile numbers (sequences, repeats, wrong start digit). */
export function isValidMobile(raw: string): boolean {
  let d = raw.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  if (d.length !== 10) return false;
  if (!/^[6-9]/.test(d)) return false;
  if (/^(\d)\1{9}$/.test(d)) return false;
  const fakes = ["1234567890", "0123456789", "9876543210", "6789012345", "9999999999"];
  if (fakes.includes(d)) return false;
  let asc = 0, desc = 0;
  for (let i = 1; i < d.length; i++) {
    const diff = Number(d[i]) - Number(d[i - 1]);
    if (diff === 1 || diff === -9) asc++;
    if (diff === -1 || diff === 9) desc++;
  }
  if (asc >= 8 || desc >= 8) return false;
  return true;
}

export const normalizeMobile = (raw: string) => raw.replace(/\D/g, "").slice(-10);
