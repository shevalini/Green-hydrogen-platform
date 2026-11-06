const SOLAR_FORECAST = [
  0, 0, 0, 0, 0, 25, 90, 210, 360, 480, 560, 600,
  580, 510, 420, 290, 140, 40, 0, 0, 0, 0, 0, 0,
];

const WIND_FORECAST = [
  180, 190, 175, 160, 150, 140, 150, 165, 170, 180, 190, 185,
  180, 175, 165, 170, 180, 195, 210, 220, 215, 200, 190, 185,
];

export function createDemoTelemetry() {
  const maxKw = Math.max(...SOLAR_FORECAST.map((solarKw, hour) => solarKw + WIND_FORECAST[hour]));
  const hourlyForecast = SOLAR_FORECAST.map((solarKw, hour) => {
    const windKw = WIND_FORECAST[hour];
    const totalKw = solarKw + windKw;
    return {
      hour,
      timeLabel: `${String(hour).padStart(2, "0")}:00`,
      solarKw,
      windKw,
      totalKw,
      heightPct: Math.round((totalKw / maxKw) * 100),
    };
  });

  return {
    metrics: {
      solarEnergy: { value: 420, unit: "kW", changePct: 12.4, trend: "up" },
      windEnergy: { value: 180, unit: "kW", changePct: 6.8, trend: "up" },
      renewableTotal: { value: 600, unit: "kW", utilizationPct: 82, trend: "nominal" },
      hydrogenProduction: { rate: 11, unit: "kg/h", status: "Electrolyzer running" },
      electrolyzer: {
        status: "RUNNING",
        utilizationPct: 78,
        powerKw: 550,
        efficiencyPct: 65,
      },
      todayProduction: {
        currentKg: 142,
        unit: "kg",
        changeVsYesterdayPct: 14.2,
        hourlyTrend: [30, 40, 35, 50, 45, 60, 55, 70, 65, 80, 75, 90],
      },
      recommendation: {
        title: "Smart Recommendation",
        category: "OPTIMIZATION",
        message: "High renewable energy availability detected. Increase electrolyzer utilization to 550 kW for the next operating period.",
        targetPowerKw: 550,
        confidence: "94%",
      },
    },
    energyData: {
      generationIntervals: hourlyForecast
        .filter((_, hour) => hour % 2 === 0)
        .map(({ timeLabel, heightPct, solarKw, windKw, totalKw }) => ({
          time: timeLabel,
          heightPct,
          solarKw,
          windKw,
          totalKw,
        })),
      hourlyForecast,
      peakGenerationKw: maxKw,
      currentRenewableKw: 600,
      solarKw: 420,
      windKw: 180,
      totalSolarKwh: SOLAR_FORECAST.reduce((sum, value) => sum + value, 0),
      totalWindKwh: WIND_FORECAST.reduce((sum, value) => sum + value, 0),
    },
    storageData: {
      currentKg: 740,
      capacityKg: 1000,
      availableKg: 260,
      filledPercentage: 74,
      pressureBar: 350,
      status: "Nominal",
      tankId: "H2-TK-01",
    },
  };
}
