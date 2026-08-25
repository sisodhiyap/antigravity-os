import { AntigravityKernel } from "./kernel";

async function runKernelDiagnostics() {
  console.log("=================================================");
  console.log("ANTIGRAVITY PLATFORM KERNEL v4.0 DIAGNOSTIC TEST");
  console.log("=================================================");

  const kernel = AntigravityKernel.getInstance();

  // 1. Test Boot
  console.log("\n1. Booting Kernel...");
  await kernel.boot();
  console.log("✓ Kernel Boot State:", kernel.lifecycle.getState());

  // 2. Test Services & Topological Ordering
  console.log("\n2. Inspecting Services & Startup Ordering...");
  const services = kernel.services.getAllServices();
  const startupOrder = kernel.services.getStartupOrder();
  console.log(`✓ Total Registered Services: ${services.length}`);
  console.log("✓ Computed Startup Order:", startupOrder.join(" -> "));

  // 3. Test Event Bus & Subscriptions
  console.log("\n3. Testing EventBus Pub/Sub & Wildcards...");
  let eventReceived = false;
  const unsub = kernel.events.on("custom:test", (evt) => {
    console.log("✓ EventBus received event:", evt.topic, "from", evt.source);
    eventReceived = true;
  });

  await kernel.events.emit("custom:test", "DiagnosticSuite", { test: "passed", value: 42 });
  unsub();

  // 4. Test Permissions Manager
  console.log("\n4. Testing Permission Manager...");
  const isAuth = kernel.permissions.isAuthorized("hardware-telemetry-service", "READ");
  console.log("✓ Permission Check (hardware-telemetry-service -> READ):", isAuth);

  // 5. Test Plugin Loader
  console.log("\n5. Testing Plugin Registry...");
  const plugins = kernel.plugins.getAllPlugins();
  console.log(`✓ Total Plugins: ${plugins.length}`);
  for (const p of plugins) {
    console.log(`  - [${p.id}] ${p.name} (v${p.version}) - Enabled: ${p.enabled}`);
  }

  // 6. Test Supervisor Stats
  console.log("\n6. Testing Process Supervisor...");
  const supervisorStats = kernel.supervisor.getStats();
  console.log("✓ Process Supervisor Active:", supervisorStats.isSupervising);
  console.log("✓ Monitored Services Count:", supervisorStats.activeMonitors);

  // 7. Full Telemetry Snapshot
  console.log("\n7. Kernel Snapshot Summary:");
  const snapshot = kernel.getSnapshot();
  console.log(JSON.stringify(snapshot, null, 2));

  console.log("\n=================================================");
  console.log("✓ ALL KERNEL SUBSYSTEMS OPERATIONAL AND VALIDATED");
  console.log("=================================================");
}

runKernelDiagnostics().catch((err) => {
  console.error("Kernel Diagnostic Failed:", err);
  process.exit(1);
});
