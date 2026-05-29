const FIFA_TO_ISO2: Record<string, string> = {
  USA: "us", ESP: "es", MAR: "ma", ZIM: "zw",
  ARG: "ar", CAN: "ca", COL: "co", NGA: "ng",
  MEX: "mx", BRA: "br", JPN: "jp", CRC: "cr",
  FRA: "fr", UKR: "ua", SEN: "sn", AUS: "au",
  ENG: "gb-eng", SRB: "rs", IRQ: "iq", ECU: "ec",
  GER: "de", SUI: "ch", PAR: "py", HON: "hn",
  POR: "pt", ITA: "it", KOR: "kr", PAN: "pa",
  NED: "nl", DEN: "dk", URU: "uy", MLI: "ml",
  BEL: "be", AUT: "at", IRN: "ir", JAM: "jm",
  POL: "pl", SCO: "gb-sct", KSA: "sa", ISL: "is",
  CRO: "hr", SWE: "se", UZB: "uz", EGY: "eg",
  GEO: "ge", ROU: "ro", BIH: "ba", CHA: "td",
};

export function getFlagUrl(code: string): string {
  const iso2 = FIFA_TO_ISO2[code] || code.toLowerCase();
  return `https://flagcdn.com/24x18/${iso2}.png`;
}
