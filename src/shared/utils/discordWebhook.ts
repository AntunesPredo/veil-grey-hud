const PLAYER_WEBHOOK = import.meta.env.PLAYER_WEBHOOK;
const INVENTORY_WEBHOOK = import.meta.env.INVENTORY_WEBHOOK;

export async function dispatchDiscordLog(
  type: "PLAYER" | "INVENTORY",
  username: string,
  content: string,
) {
  const url = type === "PLAYER" ? PLAYER_WEBHOOK : INVENTORY_WEBHOOK;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username || "UNKNOWN_UNIT", content }),
    });
  } catch (error) {
    console.error("Erro ao enviar webhook:", error);
  }
}
