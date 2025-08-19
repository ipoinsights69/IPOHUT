"use client";
import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { IpoDetailData, IpoData, TimeframeKey, MarketDataResponse, Candle } from "@/config/api";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, TrendingUp, FileText, Users, BarChart3, Building2, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

function getStatusColor(status: string) {
  switch ((status || "").toLowerCase()) {
    case "upcoming":
      return "bg-blue-500 text-white";
    case "open":
      return "bg-emerald-500 text-white";
    case "closed":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

function getStatusIcon(status: string) {
  switch ((status || "").toLowerCase()) {
    case "upcoming":
      return <Calendar className="w-4 h-4" />;
    case "open":
      return <Clock className="w-4 h-4" />;
    case "closed":
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Calendar className="w-4 h-4" />;
  }
}

function extractKeyMetrics(data: IpoDetailData | null) {
  if (!data) return {} as Record<string, string>;

  const metrics: Record<string, string> = {};

  if (data.ipo_price && Array.isArray(data.ipo_price)) {
    data.ipo_price.forEach(([key, value]) => {
      const lower = key.toLowerCase();
      if (lower.includes("price") || lower.includes("range")) {
        metrics.priceRange = value;
      }
      if (lower.includes("face")) {
        metrics.faceValue = value;
      }
    });
  }
  type LotInfo = {
  Shares?: string;
  Amount?: string;
};

if (data.lots && Array.isArray(data.lots) && data.lots.length > 0) {
  const lotInfo = data.lots[0] as LotInfo;
  if (lotInfo.Shares) metrics.lotSize = lotInfo.Shares;
  if (lotInfo.Amount) metrics.amount = lotInfo.Amount;
}


  if (data.timeline && Array.isArray(data.timeline)) {
    const openDate = data.timeline.find(([key]) => key.toLowerCase().includes("open"))?.[1];
    const closeDate = data.timeline.find(([key]) => key.toLowerCase().includes("close"))?.[1];
    const listingDate = data.timeline.find(([key]) => key.toLowerCase().includes("listing"))?.[1];

    if (openDate) metrics.openDate = openDate;
    if (closeDate) metrics.closeDate = closeDate;
    if (listingDate) metrics.listingDate = listingDate;
  }

  return metrics;
}

// --- New: Market Data Minimal Line Chart Section ---
const TIMEFRAMES: TimeframeKey[] = ["1D","7D","15D","1M","3M","6M","1Y","2Y"];

function useIsin(detailData: IpoDetailData | null) {
  return useMemo(() => {
    const listing = detailData?.listing_details;
    if (!listing) return null;
    const tuple = listing.find(([k]) => k.toLowerCase() === "isin");
    return tuple?.[1] || null;
  }, [detailData]);
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit" });
}

function MarketMiniLine({ candles, title }: { candles: Candle[]; title: string }) {
  type ChartPoint = { x: number; y: number };
  type ChartSeries = { name: string; data: ChartPoint[] }[];

  const series: ChartSeries = useMemo(
    () => [
      { name: title, data: candles.map((c) => ({ x: new Date(c.time).getTime(), y: c.close })) },
    ],
    [candles, title]
  );
  const options: ApexOptions = useMemo(
    () => ({
      chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false }, animations: { enabled: true, easing: "easeinout", speed: 500 } },
      stroke: { curve: "smooth", width: 2 },
      dataLabels: { enabled: false },
      grid: { borderColor: "#eee", strokeDashArray: 3 },
      xaxis: { type: "datetime", labels: { show: true, style: { colors: ["#6B7280"] } } },
      yaxis: { labels: { show: true, style: { colors: ["#6B7280"] } } },
      fill: { type: "gradient", gradient: { shadeIntensity: 0.1, opacityFrom: 0.2, opacityTo: 0.05 } },
      tooltip: { theme: "light", x: { format: "dd MMM" } },
      colors: ["#10B981"],
    }),
    []
  );

  return (
    <div className="w-full h-56">
      <ApexChart options={options} series={series} type="area" height={224} />
    </div>
  );
}

function MarketDataSection({ basicData, detailData }: { basicData: IpoData; detailData: IpoDetailData | null }) {
  const isin = useIsin(detailData);
  const [tf, setTf] = useState<TimeframeKey>('7D');
  const [data, setData] = useState<MarketDataResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!isin) return;
      setLoading(true);
      try {
        const res = await fetch(`http://159.65.104.132:1234/api/ipo/get_market_data?isin=${encodeURIComponent(isin)}&timeframes=${tf}`);
        const json = await res.json();
        if (!ignore) setData(json);
      } catch (e) {
        if (!ignore) setData(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true };
  }, [isin, tf]);

  const candles: Candle[] = useMemo(() => {
    const key = tf as TimeframeKey;
    const series = data?.data?.[key]?.daily_candles || [];
    return Array.isArray(series) ? series.filter(c => typeof c.close === 'number' && c.time) : [];
  }, [data, tf]);

  const listingDate = useMemo(() => detailData?.listing_details?.find(([k]) => k.toLowerCase() === 'listing date')?.[1] || '', [detailData]);
  const isinShort = isin ? `${isin.slice(0, 6)}…${isin.slice(-4)}` : '';

  if (!isin) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 pt-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{basicData.name} • Market Trend</h3>
          <p className="text-xs text-gray-500">ISIN: {isinShort} {listingDate && `• Listed on ${listingDate}`}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {TIMEFRAMES.map(k => (
            <button key={k} onClick={() => setTf(k)} className={`px-2.5 py-1 rounded-full text-xs border transition ${tf===k? 'bg-emerald-600 text-white border-emerald-600':'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}>
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-4">
        {loading ? (
          <div className="h-56 flex items-center justify-center"><span className="text-sm text-gray-500">Loading market data…</span></div>
        ) : candles.length > 0 ? (
          <MarketMiniLine candles={candles} title={basicData.name} />
        ) : (
          <div className="h-56 flex items-center justify-center"><span className="text-sm text-gray-500">No chart data available</span></div>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-gray-500">Last updated: {data?.last_updated ? formatShortDate(data.last_updated) : '—'}</div>
          {detailData?.listing_gain_percent && (
            <div className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Listing Gain: {detailData.listing_gain_percent}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IpoDetailClient({
  basicData,
  detailData,
}: {
  basicData: IpoData;
  detailData: IpoDetailData | null;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "financials" | "timeline" | "documents">("overview");
  const keyMetrics = extractKeyMetrics(detailData);


type TabId = "overview" | "financials" | "timeline" | "documents";

const tabs: { id: TabId; label: string; icon:  React.ReactNode  }[] = [
  { id: "overview", label: "Overview", icon: <Building2 className="w-4 h-4" /> },
  { id: "financials", label: "Financials", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "timeline", label: "Timeline", icon: <Calendar className="w-4 h-4" /> },
  { id: "documents", label: "Documents", icon: <FileText className="w-4 h-4" /> },
];


  return (
    <main className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/ipos" className="hover:text-emerald-600 transition-colors">IPOs</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{basicData?.name}</span>
          </div>

          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left: IPO Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide">IPO Details</span>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
                      {basicData?.name}
                    </h1>
                    <p className="text-lg text-gray-600">
                      {basicData?.year && `${basicData.year} • `}
                      {keyMetrics.priceRange && `Price: ${keyMetrics.priceRange}`}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(basicData?.status || "")} px-3 py-1 text-sm font-medium flex items-center gap-2`}>
                    {getStatusIcon(basicData?.status || "")}
                    {basicData?.status}
                  </Badge>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {keyMetrics.priceRange && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Price Range</div>
                    <div className="font-semibold text-gray-900">{keyMetrics.priceRange}</div>
                  </div>
                )}
                {keyMetrics.lotSize && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Lot Size</div>
                    <div className="font-semibold text-gray-900">{keyMetrics.lotSize}</div>
                  </div>
                )}
                {keyMetrics.openDate && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Open Date</div>
                    <div className="font-semibold text-gray-900">{keyMetrics.openDate}</div>
                  </div>
                )}
                {keyMetrics.closeDate && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Close Date</div>
                    <div className="font-semibold text-gray-900">{keyMetrics.closeDate}</div>
                  </div>
                )}
              </div>

              {/* New: Market Data Section */}
              <MarketDataSection basicData={basicData} detailData={detailData} />
            </div>
            

            {/* Right: Quick Actions */}
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                <h3 className="font-semibold text-emerald-900 mb-3">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Check GMP
                  </button>
                  <button className="w-full bg-white border border-emerald-200 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Allotment Status
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Tab Headers */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
onClick={() => setActiveTab(tab.id)}      // ✅
                      className={`${
                        activeTab === tab.id
                          ? "border-emerald-500 text-emerald-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "overview" && <OverviewTab detailData={detailData} />}
                {activeTab === "financials" && <FinancialsTab detailData={detailData} />}
                {activeTab === "timeline" && <TimelineTab detailData={detailData} />}
                {activeTab === "documents" && <DocumentsTab detailData={detailData} />}
              </div>
            </div>
          </div>

          {/* Right: Sidebar Widgets */}
          <div className="space-y-4">
            <SidebarWidgets detailData={detailData} keyMetrics={keyMetrics} />
          </div>
        </div>
      </section>
    </main>
  );
}

function OverviewTab({ detailData }: { detailData: IpoDetailData | null }) {
  return (
    <div className="space-y-6">
      {/* About Company */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">About the Company</h3>
        <p className="text-gray-700 leading-relaxed text-sm">{detailData?.about_company?.description || "Detailed description not available."}</p>
      </div>

      {/* Key Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">IPO Price</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            {(detailData?.ipo_price || []).map(([k, v], idx) => (
              <li key={`${k}-${idx}`} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium">{v}</span></li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">IPO Details</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            {(detailData?.ipo_details || []).map(([k, v], idx) => (
              <li key={`${k}-${idx}`} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium">{v}</span></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Reservation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Reservation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(detailData?.reservation || []).map((row, idx) => (
            <div key={idx} className="text-sm">
              {Object.entries(row).map(([k, v]) => (
                <div key={k} className="flex justify-between py-0.5"><span className="text-gray-500">{k}</span><span className="font-medium">{v}</span></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinancialsTab({ detailData }: { detailData: IpoDetailData | null }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">KPI</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          {(detailData?.KPI || []).map((row, idx) => (
            <li key={idx} className="flex justify-between"><span className="text-gray-500">{row.KPI}</span><span className="font-medium">{row.Values}</span></li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">EPS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(detailData?.EPS || []).map((row, idx) => (
            <div key={idx} className="text-sm">
              {Object.entries(row).map(([k, v]) => (
                <div key={k} className="flex justify-between py-0.5"><span className="text-gray-500">{k}</span><span className="font-medium">{v}</span></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineTab({ detailData }: { detailData: IpoDetailData | null }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Timeline</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          {(detailData?.timeline || []).map(([k, v], idx) => (
            <li key={`${k}-${idx}`} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-medium">{v}</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DocumentsTab({ detailData }: { detailData: IpoDetailData | null }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Documents</h3>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          {(detailData?.prospectus_links || []).map((doc, idx) => (
            <li key={`${doc.href}-${idx}`}>
              <a className="text-emerald-700 hover:underline" href={doc.href} target="_blank" rel="noopener noreferrer">{doc.text}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SidebarWidgets({ detailData, keyMetrics }: { detailData: IpoDetailData | null; keyMetrics: Record<string, string> }) {
  return (
    <>
      {detailData?.recommendation && (
        <div className="w-full bg-gray-900 text-white rounded-xl p-4 shadow-2xl border border-gray-800/60 transition-all hover:shadow-xl hover:-translate-y-0.5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`${
              detailData.recommendation.recommendation === 'SUBSCRIBE'
                ? 'bg-green-500'
                : detailData.recommendation.recommendation === 'AVOID'
                ? 'bg-red-500'
                : 'bg-amber-500'
            } w-8 h-8 rounded-full flex items-center justify-center`}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm">Internal AI Analysis</div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Confidence</span>
              <div className={`${
                detailData.recommendation.confidence === 'HIGH'
                  ? 'bg-green-900 text-green-200'
                  : detailData.recommendation.confidence === 'LOW'
                  ? 'bg-red-900 text-red-200'
                  : 'bg-amber-900 text-amber-200'
              } px-2 py-1 rounded-full text-xs font-medium`}>
                {detailData.recommendation.confidence}
              </div>
            </div>
            <div className={`${
              detailData.recommendation.recommendation === 'SUBSCRIBE'
                ? 'text-green-400'
                : detailData.recommendation.recommendation === 'AVOID'
                ? 'text-red-400'
                : 'text-amber-400'
            } font-bold text-lg`}>
              {detailData.recommendation.recommendation}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-gray-700 pt-3">
            <div className="flex items-start gap-2">
              <svg className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
              </svg>
              <div className="text-xs text-gray-400 leading-relaxed">
                <span className="font-medium">Disclaimer:</span> AI-generated for informational purposes only. Not financial advice. Consult professionals before investing.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Info Widget */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          Quick Info
        </h3>
        <div className="space-y-3">
          {keyMetrics.faceValue && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Face Value</span>
              <span className="text-sm font-medium text-gray-900">{keyMetrics.faceValue}</span>
            </div>
          )}
          {keyMetrics.amount && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-sm font-medium text-gray-900">{keyMetrics.amount}</span>
            </div>
          )}
          {keyMetrics.listingDate && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Listing Date</span>
              <span className="text-sm font-medium text-gray-900">{keyMetrics.listingDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Promoters Widget */}
      {detailData?.promoters && typeof detailData.promoters === "string" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            Promoters
          </h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">{detailData.promoters}</div>
          </div>
        </div>
      )}

      {/* Market Trends Widget */}
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg border border-emerald-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          Market Insights
        </h3>
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            Get real-time market insights and GMP tracking for better investment decisions.
          </div>
          <button className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm">
            View Market Data
          </button>
        </div>
      </div>
    </>
  );
}

function getRecommendationColor(rec?: string) {
  switch ((rec || "").toUpperCase()) {
    case "SUBSCRIBE":
      return "bg-emerald-50 border-emerald-200 text-emerald-800";
    case "AVOID":
      return "bg-red-50 border-red-200 text-red-800";
    case "NEUTRAL":
      return "bg-amber-50 border-amber-200 text-amber-800";
    default:
      return "bg-gray-50 border-gray-200 text-gray-800";
  }
}

function getConfidenceBadge(conf?: string) {
  switch ((conf || "").toUpperCase()) {
    case "HIGH":
      return <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">High confidence</span>;
    case "MEDIUM":
      return <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">Medium confidence</span>;
    case "LOW":
      return <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">Low confidence</span>;
    default:
      return null;
  }
}
// Remove unused helpers to satisfy linter
