const mongoose = require("mongoose");

const optimizationRunSchema = new mongoose.Schema({
  creationTime: {
    type: Date,
    default: Date.now,
    index: true,
  },
  scenarioName: {
    type: String,
    default: "Standard 24h Operational Dispatch",
  },
  inputParameters: {
    maxElectrolyzerPowerKw: Number,
    specificEnergyConsumptionKwhPerKg: Number,
    initialStorageKg: Number,
    maxStorageCapacityKg: Number,
    totalSolarKwh: Number,
    totalWindKwh: Number,
    totalDemandKg: Number,
  },
  hourlyDispatchSchedule: [
    {
      hour: Number,
      timeLabel: String,
      solarKw: Number,
      windKw: Number,
      availableRenewableKw: Number,
      electrolyzerPowerKw: Number,
      h2ProducedKg: Number,
      demandKg: Number,
      h2SuppliedKg: Number,
      unmetDemandKg: Number,
      curtailedRenewableKw: Number,
      storageInventoryKg: Number,
    },
  ],
  baselineSchedule: [
    {
      hour: Number,
      timeLabel: String,
      electrolyzerPowerKw: Number,
      h2ProducedKg: Number,
      demandKg: Number,
      h2SuppliedKg: Number,
      unmetDemandKg: Number,
      curtailedRenewableKw: Number,
      storageInventoryKg: Number,
    },
  ],
  summaryMetrics: {
    optimized: {
      totalRenewableGeneratedKwh: Number,
      totalRenewableUtilizedKwh: Number,
      renewableUtilizationPct: Number,
      totalHydrogenProducedKg: Number,
      totalDemandKg: Number,
      totalDemandSuppliedKg: Number,
      totalUnmetDemandKg: Number,
      totalCurtailedKwh: Number,
      finalStorageInventoryKg: Number,
      totalCost: Number,
    },
    baseline: {
      totalRenewableGeneratedKwh: Number,
      totalRenewableUtilizedKwh: Number,
      renewableUtilizationPct: Number,
      totalHydrogenProducedKg: Number,
      totalDemandKg: Number,
      totalDemandSuppliedKg: Number,
      totalUnmetDemandKg: Number,
      totalCurtailedKwh: Number,
      finalStorageInventoryKg: Number,
      totalCost: Number,
    },
    comparison: {
      renewableUtilizationImprovementPct: Number,
      unmetDemandReductionKg: Number,
      curtailedEnergySavedKwh: Number,
      additionalHydrogenKg: Number,
    },
  },
  recommendation: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["optimal", "sub-optimal", "infeasible"],
    default: "optimal",
  },
  dataSource: {
    type: String,
    enum: ["simulated", "engine"],
    default: "engine",
  },
});

module.exports = mongoose.model("OptimizationRun", optimizationRunSchema);
