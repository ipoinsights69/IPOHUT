"use client";
import React, { useState } from "react";
import Link from "next/link";
import { IpoDetailData, IpoData } from "@/config/api";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, TrendingUp, ArrowRight, FileText, Users, BarChart3, Target, Building2 } from "lucide-react";

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
          <div className="space-y-6">
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
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Overview</h3>
        <div className="prose max-w-none text-gray-600">
          <p>Detailed company information and IPO overview will be displayed here.</p>
        </div>
      </div>

      {/* IPO Details */}
      {detailData?.ipo_details && detailData.ipo_details.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">IPO Details</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detailData.ipo_details.map((detail: [string, string], index: number) => (
                <div key={`detail-${index}`} className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <span className="text-sm text-gray-600">{detail[0]}</span>
                  <span className="text-sm font-medium text-gray-900">{detail[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Objectives */}
      {detailData?.objectives && detailData.objectives.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">IPO Objectives</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {detailData.objectives.map((objective, index) => (
                <div key={`objective-${index}`} className="flex items-start gap-3 p-3 bg-white rounded border">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Target className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{objective["Objects of the Issue"]}</div>
                    <div className="text-xs text-gray-600 mt-1">₹{objective["Expected Amount(₹ in crores)"]} crores</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FinancialsTab({ detailData }: { detailData: IpoDetailData | null }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
      </div>

      {/* KPI Data */}
      {detailData?.KPI && detailData.KPI.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">Key Performance Indicators</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {detailData.KPI.map((kpi, index) => (
                <div key={`kpi-${index}`} className="bg-white rounded border p-3">
                  <div className="text-xs text-gray-600 mb-1">{kpi.KPI}</div>
                  <div className="text-sm font-semibold text-gray-900">{kpi.Values}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reservation Data */}
      {detailData?.reservation && detailData.reservation.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">Share Reservation</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {detailData.reservation.map((item, index) => (
                <div key={`reservation-${index}`} className="flex justify-between items-center p-3 bg-white rounded border">
                  <span className="text-sm text-gray-600">{item.Category}</span>
                  <span className="text-sm font-medium text-gray-900">{item.Percentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineTab({ detailData }: { detailData: IpoDetailData | null }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">IPO Timeline</h3>
      </div>

      {detailData?.timeline && detailData.timeline.length > 0 && (
        <div className="space-y-4">
          {detailData.timeline.map((item, index) => (
            <div key={`timeline-${index}`} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{item[0]}</div>
                <div className="text-sm text-gray-600 mt-1">{item[1]}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentsTab({ detailData }: { detailData: IpoDetailData | null }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents & Links</h3>
      </div>

      {detailData?.prospectus_links && detailData.prospectus_links.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">Prospectus</h4>
          <div className="space-y-3">
            {detailData.prospectus_links.map((link, index) => (
              <a
                key={`link-${index}`}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {link.title || link.text}
                  </div>
                  <div className="text-xs text-gray-600">Click to download</div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarWidgets({ detailData, keyMetrics }: { detailData: IpoDetailData | null; keyMetrics: Record<string, string> }) {
  return (
    <>
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