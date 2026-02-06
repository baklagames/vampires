export const formatSecondsMMSS = (seconds: number): string => {
  if (!Number.isFinite(seconds)) {
    return "00:00";
  }

  const clampedSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(clampedSeconds / 60);
  const remainingSeconds = clampedSeconds % 60;

  const pad = (value: number) => value.toString().padStart(2, "0");

  return `${pad(minutes)}:${pad(remainingSeconds)}`;
};
