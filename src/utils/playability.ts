export function isPlayableInIframe(video: any, countryCode = "KZ"): boolean {
  const status = video.status;
  const restriction = video.contentDetails?.regionRestriction;

  if (!status?.embeddable) return false;

  if (!restriction) return true;

  if (restriction.blocked?.includes(countryCode)) return false;
  if (restriction.allowed && !restriction.allowed.includes(countryCode)) {
    return false;
  }

  return true;
}
