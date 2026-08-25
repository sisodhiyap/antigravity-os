import fs from "fs";
import path from "path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

console.log("Raw Process Env OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY);

const { env } = require("./src/config/env");

console.log("Configured Env Server OPENROUTER_API_KEY:", env.server.OPENROUTER_API_KEY);

async function testModel(model: string) {
  const start = performance.now();
  console.log(`Testing model: ${model}...`);
  try {
    const res = await fetch(`${env.server.OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, // Use raw process.env key to verify
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Hello" }],
      }),
    });
    const duration = Math.round(performance.now() - start);
    console.log(`Model: ${model} | Status: ${res.status} | Time: ${duration}ms`);
    if (res.status === 200) {
      const data = await res.json();
      console.log("Output:", data.choices?.[0]?.message?.content);
      return true;
    } else {
      console.log("Error response:", await res.text());
      return false;
    }
  } catch (err: any) {
    console.error(`Error for ${model}:`, err.message);
    return false;
  }
}

async function run() {
  const models = [
    "nvidia/nemotron-3.5-lightning:free",
    "cohere/north-mini-code:free",
    "liquid/lfm-2.5-2.6b:free",
    "google/gemma-2-9b-it:free",
  ];
  for (const m of models) {
    const success = await testModel(m);
    if (success) {
      console.log(`==== Success model found: ${m} ====`);
      break;
    }
  }
}
run();
