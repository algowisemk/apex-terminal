"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData } from "lightweight-charts";
import { Candle } from "@/lib/types";

interface ChartPanelProps {
  symbol: string;
  bars: Candle[];
  timeframe: string;
  setTimeframe: (tf: string) => void;
}

export function ChartPanel({ symbol, bars, timeframe, setTimeframe }: ChartPanelProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [legend, setLegend] = useState({ open: 0, high: 0, low: 0, close: 0, change: 0 });

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize lightweight-charts with Bloomberg/Apex dark palette
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#09090b" },
        textColor: "#71717a",
      },
      grid: {
        vertLines: { color: "#18181b" },
        horzLines: { color: "#18181b" },
      },
      crosshair: {
        mode: 1, // Magnet
      },
      rightPriceScale: {
        borderColor: "#27272a",
      },
      timeScale: {
        borderColor: "#27272a",
        timeVisible: true,
        secondsVisible: false,
      },
      autoSize: true,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    const volumeSeries = chart.addHistogramSeries({
      color: "#27272a",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "", // overlay
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Crosshair move listener for live legend
    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.seriesData.get(candleSeries)) {
        const data = param.seriesData.get(candleSeries) as CandlestickData;
        if (data) {
          const chg = data.close - data.open;
          setLegend({
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            change: parseFloat(chg.toFixed(2)),
          });
        }
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Update chart data whenever bars change
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || bars.length === 0) return;

    const formattedCandles: CandlestickData[] = bars.map((b) => ({
      time: b.time as any,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    }));

    const formattedVolume = bars.map((b) => ({
      time: b.time as any,
      value: b.volume || 1000,
      color: b.close >= b.open ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)",
    }));

    candleSeriesRef.current.setData(formattedCandles);
    volumeSeriesRef.current.setData(formattedVolume as any);

    const latest = bars[bars.length - 1];
    setLegend({
      open: latest.open,
      high: latest.high,
      low: latest.low,
      close: latest.close,
      change: parseFloat((latest.close - latest.open).toFixed(2)),
    });

    chartRef.current?.timeScale().fitContent();
  }, [bars]);

  return (
    <div className="flex h-full flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Chart Control Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-zinc-100">{symbol}</span>
          <div className="flex items-center gap-1">
            {["1m", "5m", "15m", "1H", "4H", "1D"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`rounded px-1.5 py-0.5 text-[11px] transition-colors ${
                  timeframe === tf
                    ? "bg-amber-500/20 text-amber-400 font-semibold"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* OHLC Legend */}
        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
          <span>O: <strong className="text-zinc-200">{legend.open}</strong></span>
          <span>H: <strong className="text-zinc-200">{legend.high}</strong></span>
          <span>L: <strong className="text-zinc-200">{legend.low}</strong></span>
          <span>C: <strong className="text-zinc-200">{legend.close}</strong></span>
          <span className={legend.change >= 0 ? "text-emerald-400" : "text-rose-400"}>
            {legend.change >= 0 ? `+${legend.change}` : legend.change}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="relative w-full flex-1 min-h-[360px]" />
    </div>
  );
}
