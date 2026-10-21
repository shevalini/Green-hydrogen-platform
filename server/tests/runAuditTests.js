/**
 * @file runAuditTests.js
 * @description Comprehensive Automated Mathematical & Functional Audit Test Suite
 * for Green Hydrogen Platform Optimization Engine.
 */

const assert = require("assert");
const {
  runOptimization,
  validateInputs,
  solveSimplexLP,
  recalculateSummaryMetrics,
  DEFAULT_24H_FORECAST,
} = require("../services/optimizationService");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

console.log("\n=======================================================");
console.log(" GREEN HYDROGEN PLATFORM: MATHEMATICAL AUDIT TEST SUITE ");
console.log("=======================================================\n");

// -------------------------------------------------------------
// Test Group 1: 10 Mathematical & Functional Audit Criteria
// -------------------------------------------------------------
console.log("--- Group 1: Mathematical Conservation Laws & Invariants ---");

const standardRun = runOptimization(DEFAULT_24H_FORECAST);

runTest("Criterion 1: H2 production = energy consumed / specific energy consumption", () => {
  assert.strictEqual(standardRun.success, true);
  const eta = standardRun.inputParameters.specificEnergyConsumptionKwhPerKg;
  
  for (const row of standardRun.hourlyDispatchSchedule) {
    const expectedH2 = Math.round((row.electrolyzerPowerKw / eta) * 100) / 100;
    assert.strictEqual(
      row.h2ProducedKg,
      expectedH2,
      `Hour ${row.hour}: Expected ${expectedH2} kg, got ${row.h2ProducedKg} kg`
    );
  }
});

runTest("Criterion 2: Electrolyzer power <= min(available renewable, rating)", () => {
  const maxP = standardRun.inputParameters.maxElectrolyzerPowerKw;
  for (const row of standardRun.hourlyDispatchSchedule) {
    assert.ok(
      row.electrolyzerPowerKw <= row.availableRenewableKw + 1e-4,
      `Hour ${row.hour}: Power ${row.electrolyzerPowerKw} exceeds available ${row.availableRenewableKw}`
    );
    assert.ok(
      row.electrolyzerPowerKw <= maxP + 1e-4,
      `Hour ${row.hour}: Power ${row.electrolyzerPowerKw} exceeds rating ${maxP}`
    );
    assert.ok(row.electrolyzerPowerKw >= 0, `Hour ${row.hour}: Power is negative`);
  }
});

runTest("Criterion 3: Storage inventory follows S_{t+1} = S_t + H_prod - H_sup", () => {
  let prevStorage = standardRun.inputParameters.initialStorageKg;
  for (const row of standardRun.hourlyDispatchSchedule) {
    const expectedStorage = Math.round((prevStorage + row.h2ProducedKg - row.h2SuppliedKg) * 100) / 100;
    assert.strictEqual(
      row.storageInventoryKg,
      expectedStorage,
      `Hour ${row.hour}: Storage ${row.storageInventoryKg} does not match expected ${expectedStorage}`
    );
    prevStorage = row.storageInventoryKg;
  }
});

runTest("Criterion 4: Inventory strictly between 0 and maximum storage capacity", () => {
  const maxCap = standardRun.inputParameters.maxStorageCapacityKg;
  for (const row of standardRun.hourlyDispatchSchedule) {
    assert.ok(
      row.storageInventoryKg >= 0,
      `Hour ${row.hour}: Inventory ${row.storageInventoryKg} is negative`
    );
    assert.ok(
      row.storageInventoryKg <= maxCap + 1e-4,
      `Hour ${row.hour}: Inventory ${row.storageInventoryKg} exceeds capacity ${maxCap}`
    );
  }
});

runTest("Criterion 5: H2 supplied <= demand AND <= available inventory", () => {
  let openingStorage = standardRun.inputParameters.initialStorageKg;
  for (const row of standardRun.hourlyDispatchSchedule) {
    assert.ok(
      row.h2SuppliedKg <= row.demandKg + 1e-4,
      `Hour ${row.hour}: Supplied ${row.h2SuppliedKg} exceeds demand ${row.demandKg}`
    );
    const maxAvailable = Math.round((openingStorage + row.h2ProducedKg) * 100) / 100;
    assert.ok(
      row.h2SuppliedKg <= maxAvailable + 1e-4,
      `Hour ${row.hour}: Supplied ${row.h2SuppliedKg} exceeds available ${maxAvailable}`
    );
    openingStorage = row.storageInventoryKg;
  }
});

runTest("Criterion 6: Unmet demand = demand - H2 supplied", () => {
  for (const row of standardRun.hourlyDispatchSchedule) {
    const expectedUnmet = Math.round((row.demandKg - row.h2SuppliedKg) * 100) / 100;
    assert.strictEqual(
      row.unmetDemandKg,
      expectedUnmet,
      `Hour ${row.hour}: Unmet ${row.unmetDemandKg} !== ${expectedUnmet}`
    );
  }
});

runTest("Criterion 7: Available energy = allocated energy + curtailed energy", () => {
  for (const row of standardRun.hourlyDispatchSchedule) {
    const sum = Math.round((row.electrolyzerPowerKw + row.curtailedRenewableKw) * 10) / 10;
    assert.strictEqual(
      row.availableRenewableKw,
      sum,
      `Hour ${row.hour}: Available ${row.availableRenewableKw} !== ${sum}`
    );
  }
});

runTest("Criterion 8: Baseline and optimized schedules use identical inputs", () => {
  assert.strictEqual(standardRun.hourlyDispatchSchedule.length, standardRun.baselineSchedule.length);
  for (let t = 0; t < 24; t++) {
    const opt = standardRun.hourlyDispatchSchedule[t];
    const base = standardRun.baselineSchedule[t];
    assert.strictEqual(opt.solarKw, base.solarKw, `Hour ${t}: solarKw mismatch`);
    assert.strictEqual(opt.windKw, base.windKw, `Hour ${t}: windKw mismatch`);
    assert.strictEqual(opt.demandKg, base.demandKg, `Hour ${t}: demandKg mismatch`);
    assert.strictEqual(opt.availableRenewableKw, base.availableRenewableKw, `Hour ${t}: availableRenewableKw mismatch`);
  }
});

runTest("Criterion 9: Summary metrics recalculated independently match schedule data", () => {
  const recalculated = recalculateSummaryMetrics(
    standardRun.hourlyDispatchSchedule,
    standardRun.inputParameters.initialStorageKg,
    DEFAULT_24H_FORECAST.gridPriceForecast
  );

  const optSummary = standardRun.summaryMetrics.optimized;
  assert.strictEqual(optSummary.totalRenewableGeneratedKwh, recalculated.totalRenewableGeneratedKwh);
  assert.strictEqual(optSummary.totalRenewableUtilizedKwh, recalculated.totalRenewableUtilizedKwh);
  assert.strictEqual(optSummary.renewableUtilizationPct, recalculated.renewableUtilizationPct);
  assert.strictEqual(optSummary.totalHydrogenProducedKg, recalculated.totalHydrogenProducedKg);
  assert.strictEqual(optSummary.totalDemandKg, recalculated.totalDemandKg);
  assert.strictEqual(optSummary.totalDemandSuppliedKg, recalculated.totalDemandSuppliedKg);
  assert.strictEqual(optSummary.totalUnmetDemandKg, recalculated.totalUnmetDemandKg);
  assert.strictEqual(optSummary.totalCurtailedKwh, recalculated.totalCurtailedKwh);
  assert.strictEqual(optSummary.finalStorageInventoryKg, recalculated.finalStorageInventoryKg);
  assert.strictEqual(optSummary.totalCost, recalculated.totalCost);
});

runTest("Criterion 10: Linear programming simplex solver validity & status", () => {
  assert.strictEqual(standardRun.status, "optimal");
  assert.strictEqual(standardRun.success, true);
  assert.ok(standardRun.hourlyDispatchSchedule.length === 24);
  assert.ok(standardRun.summaryMetrics.optimized.renewableUtilizationPct > 80);
});

// -------------------------------------------------------------
// Test Group 2: Operational & Stress Scenarios
// -------------------------------------------------------------
console.log("\n--- Group 2: Operational Stress & Edge Case Scenarios ---");

runTest("Scenario A: Zero Generation (0 kW Solar, 0 kW Wind)", () => {
  const zeroRun = runOptimization({
    solarForecast: Array(24).fill(0),
    windForecast: Array(24).fill(0),
    hydrogenDemand: Array(24).fill(4), // 96 kg total demand
    initialStorageKg: 100,
    maxStorageCapacityKg: 1000,
  });

  assert.strictEqual(zeroRun.status, "optimal");
  assert.strictEqual(zeroRun.summaryMetrics.optimized.totalHydrogenProducedKg, 0);
  assert.strictEqual(zeroRun.summaryMetrics.optimized.totalDemandSuppliedKg, 96);
  assert.strictEqual(zeroRun.summaryMetrics.optimized.totalUnmetDemandKg, 0);
  assert.strictEqual(zeroRun.summaryMetrics.optimized.finalStorageInventoryKg, 4);
});

runTest("Scenario B: Initially Full Hydrogen Tank (1000 kg)", () => {
  const fullRun = runOptimization({
    solarForecast: [0,0,0,0,0,50, 150,300,450,550,600,600, 580,500,400,250,100,20, 0,0,0,0,0,0],
    windForecast: Array(24).fill(150),
    hydrogenDemand: Array(24).fill(6),
    initialStorageKg: 1000,
    maxStorageCapacityKg: 1000,
  });

  assert.strictEqual(fullRun.status, "optimal");
  for (const row of fullRun.hourlyDispatchSchedule) {
    assert.ok(
      row.storageInventoryKg <= 1000,
      `Hour ${row.hour}: Storage ${row.storageInventoryKg} exceeded 1000 kg`
    );
  }
});

runTest("Scenario C: Initially Depleted Tank (0 kg Storage)", () => {
  const emptyRun = runOptimization({
    solarForecast: [0,0,0,0,0,50, 150,300,450,550,600,600, 580,500,400,250,100,20, 0,0,0,0,0,0],
    windForecast: Array(24).fill(100),
    hydrogenDemand: Array(24).fill(2),
    initialStorageKg: 0,
    maxStorageCapacityKg: 1000,
  });

  assert.strictEqual(emptyRun.status, "optimal");
  for (const row of emptyRun.hourlyDispatchSchedule) {
    assert.ok(row.storageInventoryKg >= 0, `Hour ${row.hour}: Storage went negative`);
  }
  assert.ok(emptyRun.summaryMetrics.optimized.finalStorageInventoryKg > 0);
});

runTest("Scenario D: Insufficient Renewable Power (Demand Deficit)", () => {
  const deficitRun = runOptimization({
    solarForecast: Array(24).fill(50),
    windForecast: Array(24).fill(50), // 100 kW = 2 kg/h max production
    hydrogenDemand: Array(24).fill(10), // 240 kg demand
    initialStorageKg: 20,
    maxStorageCapacityKg: 1000,
  });

  assert.strictEqual(deficitRun.status, "optimal");
  // Total available = 20 initial + 24 * 2 kg = 68 kg
  assert.strictEqual(deficitRun.summaryMetrics.optimized.totalDemandSuppliedKg, 68);
  assert.strictEqual(deficitRun.summaryMetrics.optimized.totalUnmetDemandKg, 172);
  assert.strictEqual(deficitRun.summaryMetrics.optimized.finalStorageInventoryKg, 0);
  for (const row of deficitRun.hourlyDispatchSchedule) {
    assert.ok(row.storageInventoryKg >= 0);
  }
});

runTest("Scenario E: Cost Arbitrage & Peak Price Shifting", () => {
  // Constrained tank where LP can avoid peak tariffs
  const costRun = runOptimization({
    initialStorageKg: 80,
    maxStorageCapacityKg: 100,
    hydrogenDemand: 2,
    gridPriceForecast: [
      0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.12, 0.12, 0.12, 0.12, 0.12, 0.12,
      0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04,
    ],
  });

  assert.strictEqual(costRun.status, "optimal");
  assert.ok(
    costRun.summaryMetrics.comparison.costSavings >= 0,
    `Cost savings should be >= 0, got ${costRun.summaryMetrics.comparison.costSavings}`
  );
});

// -------------------------------------------------------------
// Test Group 3: Input Validation & Infeasibility Handling
// -------------------------------------------------------------
console.log("\n--- Group 3: Input Validation & Error Handling ---");

runTest("Validation 1: Reject negative solar array", () => {
  const res = runOptimization({
    solarForecast: Array(24).fill(-5),
  });
  assert.strictEqual(res.success, false);
  assert.ok(res.validationErrors.some((e) => e.includes("solarForecast")));
});

runTest("Validation 2: Reject negative wind array", () => {
  const res = runOptimization({
    windForecast: Array(24).fill(-1),
  });
  assert.strictEqual(res.success, false);
  assert.ok(res.validationErrors.some((e) => e.includes("windForecast")));
});

runTest("Validation 3: Reject negative demand", () => {
  const res = runOptimization({
    hydrogenDemand: -10,
  });
  assert.strictEqual(res.success, false);
  assert.ok(res.validationErrors.some((e) => e.includes("hydrogenDemand")));
});

runTest("Validation 4: Reject initial storage > max capacity", () => {
  const res = runOptimization({
    initialStorageKg: 1200,
    maxStorageCapacityKg: 1000,
  });
  assert.strictEqual(res.success, false);
  assert.ok(res.validationErrors.some((e) => e.includes("cannot exceed maxStorageCapacityKg")));
});

runTest("Validation 5: Reject non-24 array length", () => {
  const res = runOptimization({
    solarForecast: [100, 200, 300],
  });
  assert.strictEqual(res.success, false);
  assert.ok(res.validationErrors.some((e) => e.includes("exactly 24")));
});

console.log("\n=======================================================");
console.log(` AUDIT SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log("=======================================================\n");

if (failedTests > 0) {
  process.exit(1);
}
