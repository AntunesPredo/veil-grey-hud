export function openFullscreen() {
  document.documentElement.requestFullscreen().catch(console.error);
}

export function closeFullscreen() {
  document.exitFullscreen().catch(console.error);
}
