// Arabic formatting helpers. Latin numerals are used deliberately: Arabic-Indic
// digits mixed with separators (ranges, dashes) render reversed under the
// bidi algorithm inside RTL text — see the ranges bug fixed in the prototype.

const numberFormatter = new Intl.NumberFormat("en-US");
const dateFormatter = new Intl.DateTimeFormat("ar-SA-u-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatNumber(n: number) {
  return numberFormatter.format(n);
}

export function formatDate(d: Date | string) {
  return dateFormatter.format(new Date(d));
}

export function formatRange(min: number, max: number) {
  return `${formatNumber(min)}–${formatNumber(max)}`;
}

export function formatSar(amount: number | string) {
  return `${formatNumber(Number(amount))} ر.س`;
}
