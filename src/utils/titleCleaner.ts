export function cleanTitle(league: string, title: string) {
  if (league === "SuperLig") {
    // (1-1) => vs
    return title.replace(/\(\d+-\d+\)/g, "VS");
  }

  return title;
}
