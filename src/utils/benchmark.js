const autocannon = require('autocannon');

async function runTest(name, connections = 10, duration = 30) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Testing: ${name}`);
  console.log(`${"=".repeat(50)}\n`);

  try {
    const result = await autocannon({
      url: "http://localhost:3000/",
      connections,
      duration,
      bailout: 5, 
      debug: false,
      timeout: 60,
    });

    console.log(`\nResults for ${name}:`);
    console.log(`- Total requests: ${result.requests.total}`);
    console.log(`- Requests/sec: ${result.requests.average.toFixed(2)}`);
    console.log(`- Throughput: ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/s`);
    console.log(`- Latency p50: ${result.latency.p50}ms`);
    console.log(`- Latency p99: ${result.latency.p99}ms`);
    console.log(`- Errors: ${result.errors}`);
    console.log(`- Timeouts: ${result.timeouts}`);
    console.log(`- Non 2xx responses: ${result.non2xx}`);
    
    return result;
  } catch (error) {
    console.error('Benchmark error:', error);
    throw error;
  }
}

async function main() {
  console.log("🔍 Checking if server is reachable...");
  
  // Test connection first
  try {
    const testResult = await autocannon({
      url: "http://localhost:3000/fast",
      connections: 1,
      duration: 1,
    });
    
    if (testResult.errors > 0) {
      console.error("❌ Cannot connect to server at http://localhost:3000");
      console.error("Make sure the server is running in another terminal!");
      process.exit(1);
    }
    
    console.log("✅ Server is reachable!");
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    process.exit(1);
  }
  
  console.log("\n⏳ Starting benchmark in 3 seconds...\n");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  await runTest("Current Configuration", 10, 30);
}

main().catch(console.error);