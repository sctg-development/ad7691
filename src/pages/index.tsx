import { Slider } from "@heroui/slider";
import { Chip } from "@heroui/chip";
import { Card, CardBody } from "@heroui/card";
import { Trans, useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function IndexPage() {
  const { t } = useTranslation();
  const [vcom, setVcom] = useState(2.5);
  const [inputVoltage, setInputVoltage] = useState(2.5);

  const config = siteConfig();
  const { vRef } = config.ad7691;
  const { gain } = config.ad8475;

  // Calculate differential voltages
  const calculations = useMemo(() => {
    // AD8475 with -IN0.8x tied to ground (0V) and +IN0.8x = inputVoltage
    // The differential output is centered around VCOM
    // For Vin=2.5V → VDiff=0 (midscale), we need to offset the signal
    
    // Calculate AD8475 differential output voltage
    // VDiff_out = (Vin - 2.5V) × gain × 2.5
    // Factor adjusted to reach ±5V with gain 0.8
    const signalOffset = inputVoltage - 2.5;
    const diffOut = signalOffset * gain * 2.5; // Adjusted factor to reach ±5V
    
    const outPlus = vcom + diffOut / 2;
    const outMinus = vcom - diffOut / 2;

    // Differential voltage for AD7691
    const vDiff = outPlus - outMinus;

    // AD7691 conversion according to Table 8
    // FSR = Full Scale Range = VREF = 5V
    // Resolution: 18 bits (262144 codes)
    // Midscale = 0V → 0x00000
    // +FSR - 1 LSB = +4.999962V → 0x1FFFF (131071)
    // -FSR = -5V → 0x20000 (131072)
    // -FSR + 1 LSB → 0x20001 (131073)
    // Midscale - 1 LSB → 0x3FFFF (262143)

    let code: number;
    
    if (vDiff >= 0) {
      // Positive range: 0 to +FSR-1LSB
      const maxPositive = 0x1FFFF; // 131071
      code = Math.min(Math.round((vDiff / vRef) * maxPositive), maxPositive);
    } else {
      // Negative range: -1LSB to -FSR
      const absVDiff = Math.abs(vDiff);
      const maxCode = 0x3FFFF; // 262143
      const minCode = 0x20000; // 131072
      
      if (absVDiff >= vRef) {
        code = minCode; // -FSR
      } else {
        // Interpolate between midscale-1LSB (0x3FFFF) and -FSR (0x20000)
        const ratio = absVDiff / vRef;
        code = maxCode - Math.round(ratio * (maxCode - minCode));
      }
    }

    const hexValue = `0x${code.toString(16).toUpperCase().padStart(5, "0")}`;
    const binaryValue = code.toString(2).padStart(18, "0");

    return {
      inMinus: outMinus,
      inPlus: outPlus,
      vDiff,
      decimal: code,
      hex: hexValue,
      binary: binaryValue,
    };
  }, [vcom, inputVoltage, vRef, gain]);

  // Chart data
  const chartData = useMemo(() => {
    const labels: string[] = [];
    const dataPoints: number[] = [];

    // Generate points for input voltage from 0 to 5V
    for (let v = 0; v <= 5; v += 0.1) {
      labels.push(v.toFixed(1));
      
      const signalOffset = v - 2.5;
      const diffOut = signalOffset * gain * 2.5;
      const outPlus = vcom + diffOut / 2;
      const outMinus = vcom - diffOut / 2;
      const vDiff = outPlus - outMinus;

      let code: number;
      
      if (vDiff >= 0) {
        const maxPositive = 0x1FFFF;
        code = Math.min(Math.round((vDiff / vRef) * maxPositive), maxPositive);
      } else {
        const absVDiff = Math.abs(vDiff);
        const maxCode = 0x3FFFF;
        const minCode = 0x20000;
        
        if (absVDiff >= vRef) {
          code = minCode;
        } else {
          const ratio = absVDiff / vRef;
          code = maxCode - Math.round(ratio * (maxCode - minCode));
        }
      }

      dataPoints.push(code);
    }

    return {
      labels,
      datasets: [
        {
          label: t("decimal-output"),
          data: dataPoints,
          borderColor: "rgb(139, 92, 246)",
          backgroundColor: "rgba(139, 92, 246, 0.5)",
          tension: 0.1,
        },
      ],
    };
  }, [vcom, vRef, gain, t]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: t("output-chart"),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 262144,
      },
    },
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-4xl text-center justify-center">
          <h1 className={title({ color: "violet" })}>
            <Trans i18nKey="simulator-title" />
          </h1>
          <div className={subtitle({ class: "mt-4" })}>
            <Trans i18nKey="simulator-subtitle" />
          </div>
        </div>

        {/* Sliders */}
        <div className="w-full max-w-4xl space-y-6 mt-8">
          <Card>
            <CardBody className="gap-6">
              <Slider
                label={t("vcom-voltage")}
                step={0.01}
                maxValue={5}
                minValue={0}
                value={vcom}
                onChange={(value) => setVcom(value as number)}
                className="max-w-full"
                color="secondary"
                showTooltip={true}
                tooltipProps={{
                  content: `${vcom.toFixed(2)} V`,
                }}
              />

              <Slider
                label={t("input-voltage")}
                step={0.01}
                maxValue={5}
                minValue={0}
                value={inputVoltage}
                onChange={(value) => setInputVoltage(value as number)}
                className="max-w-full"
                color="primary"
                showTooltip={true}
                tooltipProps={{
                  content: `${inputVoltage.toFixed(2)} V`,
                }}
              />
            </CardBody>
          </Card>

          {/* Results */}
          <Card>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-default-500">
                    {t("ad7691-in-minus")}
                  </span>
                  <Chip color="danger" variant="flat" size="lg">
                    {calculations.inMinus.toFixed(4)} V
                  </Chip>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm text-default-500">
                    {t("ad7691-in-plus")}
                  </span>
                  <Chip color="success" variant="flat" size="lg">
                    {calculations.inPlus.toFixed(4)} V
                  </Chip>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm text-default-500">
                    {t("decimal-output")}
                  </span>
                  <Chip color="primary" variant="flat" size="lg">
                    {calculations.decimal}
                  </Chip>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm text-default-500">
                    {t("hexadecimal-output")}
                  </span>
                  <Chip color="secondary" variant="flat" size="lg">
                    {calculations.hex}
                  </Chip>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <span className="text-sm text-default-500">
                    {t("binary-output")}
                  </span>
                  <Chip color="warning" variant="flat" size="lg" className="font-mono">
                    {calculations.binary}
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Chart */}
          <Card>
            <CardBody>
              <Line options={chartOptions} data={chartData} />
            </CardBody>
          </Card>

          {/* Circuit Diagram */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold mb-4 text-center">Circuit Wiring Diagram</h3>
              <svg
                viewBox="0 0 800 400"
                className="w-full h-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* AD8475 Chip */}
                <rect
                  x="150"
                  y="100"
                  width="120"
                  height="200"
                  fill="#4a5568"
                  stroke="#2d3748"
                  strokeWidth="2"
                  rx="4"
                />
                <text x="210" y="130" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
                  AD8475
                </text>
                <text x="210" y="150" textAnchor="middle" fill="#a0aec0" fontSize="12">
                  Gain: 0.8
                </text>

                {/* AD8475 Pins */}
                {/* -IN0.8x */}
                <line x1="50" y1="140" x2="150" y2="140" stroke="#ef4444" strokeWidth="2" />
                <circle cx="150" cy="140" r="3" fill="#ef4444" />
                <text x="100" y="130" textAnchor="middle" fill="#ef4444" fontSize="12">-IN0.8x</text>
                
                {/* +IN0.8x */}
                <line x1="80" y1="180" x2="150" y2="180" stroke="#10b981" strokeWidth="2" />
                <circle cx="150" cy="180" r="3" fill="#10b981" />
                <text x="100" y="170" textAnchor="middle" fill="#10b981" fontSize="12">+IN0.8x</text>
                
                {/* VCOM */}
                <line x1="120" y1="220" x2="150" y2="220" stroke="#f59e0b" strokeWidth="2" />
                <circle cx="150" cy="220" r="3" fill="#f59e0b" />
                <text x="90" y="248" textAnchor="middle" fill="#f59e0b" fontSize="12">VCOM</text>
                
                {/* OUT+ */}
                <line x1="270" y1="160" x2="370" y2="160" stroke="#8b5cf6" strokeWidth="2" />
                <circle cx="270" cy="160" r="3" fill="#8b5cf6" />
                <text x="320" y="150" textAnchor="middle" fill="#8b5cf6" fontSize="12">OUT+</text>
                
                {/* OUT- */}
                <line x1="270" y1="240" x2="370" y2="240" stroke="#ec4899" strokeWidth="2" />
                <circle cx="270" cy="240" r="3" fill="#ec4899" />
                <text x="320" y="230" textAnchor="middle" fill="#ec4899" fontSize="12">OUT-</text>

                {/* AD7691 Chip */}
                <rect
                  x="530"
                  y="100"
                  width="120"
                  height="200"
                  fill="#2d3748"
                  stroke="#1a202c"
                  strokeWidth="2"
                  rx="4"
                />
                <text x="590" y="130" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
                  AD7691
                </text>
                <text x="590" y="150" textAnchor="middle" fill="#a0aec0" fontSize="12">
                  18-bit ADC
                </text>

                {/* AD7691 Pins */}
                {/* IN+ */}
                <line x1="370" y1="160" x2="530" y2="160" stroke="#8b5cf6" strokeWidth="2" />
                <circle cx="530" cy="160" r="3" fill="#8b5cf6" />
                <text x="450" y="150" textAnchor="middle" fill="#8b5cf6" fontSize="12">IN+</text>
                
                {/* IN- */}
                <line x1="370" y1="240" x2="530" y2="240" stroke="#ec4899" strokeWidth="2" />
                <circle cx="530" cy="240" r="3" fill="#ec4899" />
                <text x="450" y="230" textAnchor="middle" fill="#ec4899" fontSize="12">IN-</text>

                {/* Digital Output */}
                <line x1="650" y1="200" x2="750" y2="200" stroke="#3b82f6" strokeWidth="2" />
                <circle cx="650" cy="200" r="3" fill="#3b82f6" />
                <text x="700" y="190" textAnchor="middle" fill="#3b82f6" fontSize="12">Digital Out</text>

                {/* GND Connection */}
                <line x1="50" y1="140" x2="50" y2="340" stroke="#ef4444" strokeWidth="2" />
                <line x1="30" y1="340" x2="70" y2="340" stroke="#ef4444" strokeWidth="2" />
                <line x1="35" y1="350" x2="65" y2="350" stroke="#ef4444" strokeWidth="2" />
                <line x1="40" y1="360" x2="60" y2="360" stroke="#ef4444" strokeWidth="2" />
                <text x="50" y="380" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold">GND</text>

                {/* Input Signal */}
                <circle cx="80" cy="180" r="8" fill="none" stroke="#10b981" strokeWidth="2" />
                <text x="90" y="200" textAnchor="middle" fill="#10b981" fontSize="12">Vin={inputVoltage.toFixed(2)}V</text>

                {/* VCOM Value Display */}
                <rect x="60" y="205" width="60" height="30" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="1" rx="2" />
                <text x="90" y="225" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">
                  {vcom.toFixed(2)}V
                </text>

                {/* Voltage Labels */}
                <text x="590" y="175" textAnchor="middle" fill="#8b5cf6" fontSize="11">
                  {calculations.inPlus.toFixed(3)}V
                </text>
                <text x="590" y="255" textAnchor="middle" fill="#ec4899" fontSize="11">
                  {calculations.inMinus.toFixed(3)}V
                </text>

                {/* Power Supply Lines */}
                <line x1="150" y1="80" x2="270" y2="80" stroke="#60a5fa" strokeWidth="2" strokeDasharray="5,5" />
                <text x="210" y="75" textAnchor="middle" fill="#60a5fa" fontSize="10">+5V</text>
                
                <line x1="530" y1="80" x2="650" y2="80" stroke="#60a5fa" strokeWidth="2" strokeDasharray="5,5" />
                <text x="590" y="75" textAnchor="middle" fill="#60a5fa" fontSize="10">VDD: 4.9975V</text>

                {/* VREF */}
                <line x1="530" y1="320" x2="650" y2="320" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5,5" />
                <text x="590" y="335" textAnchor="middle" fill="#fbbf24" fontSize="10">VREF: 5V</text>
              </svg>
            </CardBody>
          </Card>
        </div>
      </section>
    </DefaultLayout>
  );
}

