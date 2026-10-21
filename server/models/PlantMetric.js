const mongoose = require("mongoose");

const plantMetricSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  solarKw: {
    type: Number,
    required: true,
  },
  windKw: {
    type: Number,
    required: true,
  },
  electrolyzerPower: {
    type: Number,
    required: true,
  },
  efficiency: {
    type: Number,
    required: true,
  },
  hydrogenProductionRate: {
    type: Number,
    required: true,
  },
  storageLevel: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["RUNNING", "STANDBY", "MAINTENANCE", "OFFLINE"],
    default: "RUNNING",
  },
  dataSource: {
    type: String,
    enum: ["simulated", "telemetry"],
    default: "simulated",
  },
});

module.exports = mongoose.model("PlantMetric", plantMetricSchema);
