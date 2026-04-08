/* When the openFullscreen() function is executed, open the video in fullscreen.
Must include prefixes for different browsers, as they don't support the requestFullscreen property yet */
export function openFullscreen() {
  document.documentElement.requestFullscreen().catch((err) => {
    console.error(
      `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
    );
  });
}
export function closeFullscreen() {
  document.exitFullscreen().catch((err) => {
    console.error(
      `Error attempting to disable full-screen mode: ${err.message} (${err.name})`,
    );
  });
}
