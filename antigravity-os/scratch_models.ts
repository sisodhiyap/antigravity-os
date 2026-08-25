async function getModels() {
  const res = await fetch("https://openrouter.ai/api/v1/models");
  const json = await res.json();
  const freeModels = json.data
    .filter((m: any) => m.id.endsWith(":free"))
    .map((m: any) => m.id);
  console.log("Free OpenRouter Models:", freeModels);
}
getModels().catch(console.error);
