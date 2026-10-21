const mongoose = require("mongoose");

const productionLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  hydrogenProduced: {
    type: Number,
    required: true, // kg
  },
  hydrogenSupplied: {
    type: Number,
    required: true, // kg
  },
  operatingEnergy: {
    type: Number,
    required: true, // kWh
  },
  dataSource: {
    type: String,
    enum: ["simulated", "telemetry"],
    default: "simulated",
  },
});

module.exports = mongoose.model("ProductionLog", productionLogSchema);
