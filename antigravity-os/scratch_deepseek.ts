import { env } from "./src/config/env";

async function run() {
  console.log("=== Testing DeepSeek API ===");
  try {
    const res = await fetch(`${env.server.DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.server.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: "Hello" }],
      }),
    });
    console.log("Status:", res.status);
    console.log("Response:", await res.json());
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}
run();
