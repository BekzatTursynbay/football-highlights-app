export function cleanTitle(league: string, title: string) {
  if (league === "SuperLig") {
    // (1-1) => vs
    return title.replace(/\(\d+-\d+\)/g, "VS");
  }

  if (league === "LaLiga") {
    // 1 - 1 => vs
    return title.replace(/\d+\s*-\s*\d+/g, "VS");
  }

  return title;
}
