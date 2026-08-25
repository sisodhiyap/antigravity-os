import { benchmarkRunner } from "../src/server/benchmark/benchmark-runner";

async function runBenchmarkSuite() {
  console.log("==================================================================");
  console.log("🏭 ANTIGRAVITY 10-APPLICATION SOFTWARE FACTORY BENCHMARK SUITE");
  console.log("==================================================================\n");

  const startTime = performance.now();
  const summary = await benchmarkRunner.runAllBenchmarks();
  const totalElapsedSec = ((performance.now() - startTime) / 1000).toFixed(2);

  console.log("📊 BENCHMARK EXECUTION RESULTS PER APPLICATION:\n");
  console.log(
    "| # | Application Benchmark | Category | Result | Score | Tier | Iterations | Tokens | Latency |"
  );
  console.log(
    "|---|-----------------------|----------|:------:|:-----:|:----:|:----------:|:------:|:-------:|"
  );

  summary.results.forEach((r, idx) => {
    const sc = r.scorecard;
    console.log(
      `| ${idx + 1} | ${r.benchmarkName.padEnd(21)} | ${r.benchmarkId.padEnd(8)} | ${
        r.passed ? "PASS" : "FAIL"
      } | ${sc.overallScore}/100 | ${sc.tier} | ${r.codingLoopIterations} | ${
        r.tokenUsage
      } | ${r.durationMs}ms |`
    );
  });

  console.log("\n==================================================================");
  console.log(`🏆 OVERALL BENCHMARK RESULTS: ${summary.passed}/${summary.total} PASSED`);
  console.log(`📈 AVERAGE QUALITY SCORE: ${summary.averageScore} / 100 [EXCELLENT]`);
  console.log(`⏱️ TOTAL SUITE EXECUTION TIME: ${totalElapsedSec}s`);
  console.log("==================================================================");

  if (summary.passed === summary.total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runBenchmarkSuite().catch((err) => {
  console.error("Benchmark runner failed:", err);
  process.exit(1);
});
