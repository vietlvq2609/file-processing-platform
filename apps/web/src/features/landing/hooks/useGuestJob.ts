// Backend guest mode is not yet implemented; stub returns false for all call sites.
export function useGuestJob() {
  return { isSupported: false as const };
}
