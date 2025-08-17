"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { IpoDetailData } from "@/config/api";

// Chart data interfaces
interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

interface EPSDataItem {
  period: string;
  value: number;
  year: string;
}

interface TimelineDataItem {
  event: string;
  fullEvent: string;
  date: string;
  order: number;
}

interface PromoterDataItem {
  name: string;
  fullName: string;
  value: number;
  percentage: number;
}

interface IpoDetailChartsProps {
  detailData: IpoDetailData | null;
}

const CHART_COLORS = [
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#8B5CF6", // violet-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#06B6D4", // cyan-500
  "#84CC16", // lime-500
  "#F97316", // orange-500
];

export default function IpoDetailCharts({ detailData }: IpoDetailChartsProps) {
  // Process KPI data for charts
  const processKPIData = (kpiData: Array<{KPI: string; Values: string}>): ChartDataItem[] => {
    if (!kpiData || kpiData.length === 0) return [];
    return kpiData.map((item, index) => ({
      name: item.KPI,
      value: parseFloat(item.Values.replace(/[^0-9.-]/g, '')) || 0,
      color: CHART_COLORS[index % CHART_COLORS.length],
    })).filter(item => !isNaN(item.value));
  };

  // Process EPS data for trend analysis
  const processEPSData = (epsData: Array<Record<string, string>>): EPSDataItem[] => {
    if (!epsData || epsData.length === 0) return [];
    
    const processedEpsData: EPSDataItem[] = [];
    epsData.forEach((eps, index) => {
      Object.entries(eps).forEach(([key, value]) => {
        if (key !== "" && key !== "S.No." && value && typeof value === 'string') {
          const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
          if (!isNaN(numValue)) {
            processedEpsData.push({
              period: key,
              value: numValue,
              year: `Year ${index + 1}`,
            });
          }
        }
      });
    });
    return processedEpsData;
  };

  // Process reservation data for pie chart
  const processReservationData = (reservationData: Array<Record<string, string>>): ChartDataItem[] => {
    if (!reservationData || reservationData.length === 0) return [];
    
    const processedReservationData: ChartDataItem[] = [];
    reservationData.forEach((reservation) => {
      Object.entries(reservation).forEach(([key, value]) => {
        if (key !== "" && key !== "S.No." && value && typeof value === 'string') {
          const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
          if (!isNaN(numValue) && numValue > 0) {
            processedReservationData.push({
              name: key,
              value: numValue,
            });
          }
        }
      });
    });
    return processedReservationData.slice(0, 6); // Limit to 6 categories for better visualization
  };

  // Process timeline data for timeline chart
  const processTimelineData = (timelineData: Array<[string, string]>): TimelineDataItem[] => {
    if (!timelineData || timelineData.length === 0) return [];
    return timelineData.map(([event, date], index) => ({
      event: event.length > 20 ? event.substring(0, 20) + '...' : event,
      fullEvent: event,
      date,
      order: index,
    }));
  };

  // Process promoter holdings data
  const processPromoterData = (promoters: Array<Record<string, string>>, promoterHoldings: Array<[string, string]>): PromoterDataItem[] => {
    if (!promoters?.length && !promoterHoldings?.length) return [];
    
    // Combine promoter data with holdings if available
    const combinedData = promoters?.map((promoter: Record<string, string>, index: number) => {
      const holding = promoterHoldings?.[index];
      const promoterName = Object.values(promoter)[0] as string || `Promoter ${index + 1}`;
      const holdingValue = holding ? parseFloat(Object.values(holding)[0] as string) || 0 : 0;
      
      return {
        name: promoterName.length > 20 ? promoterName.substring(0, 20) + '...' : promoterName,
        fullName: promoterName,
        value: holdingValue,
        percentage: holdingValue
      };
    }) || [];
    
    return combinedData.filter(item => item.value > 0);
  };

  const kpiData = processKPIData(detailData?.KPI || []);
  const epsData = processEPSData(detailData?.EPS || []);
  const reservationData = processReservationData(detailData?.reservation || []);
  const timelineData = processTimelineData(detailData?.timeline || []);
  const promoterData = processPromoterData(
    Array.isArray(detailData?.promoters) ? detailData.promoters : [],
    Array.isArray(detailData?.promoters_holdings) ? detailData.promoters_holdings : []
  );

  if (!detailData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* KPI Metrics Chart */}
      {kpiData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpiData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6B7280" 
                  tick={{ fontSize: 11 }} 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
                <Tooltip 
                   contentStyle={{ 
                     backgroundColor: '#fff', 
                     border: '1px solid #e5e7eb', 
                     borderRadius: '12px',
                     boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                     padding: '12px 16px',
                     fontSize: '14px',
                     fontWeight: '500'
                   }}
                   cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                   animationDuration={200}
                 />
                <Bar 
                   dataKey="value" 
                   fill="#3B82F6" 
                   radius={[6, 6, 0, 0]}
                   // onMouseEnter handler can be added for hover effects
                 />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EPS Trend Chart */}
        {epsData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">EPS Trend Analysis</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={epsData}>
                   <defs>
                     <linearGradient id="epsGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                     </linearGradient>
                   </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" stroke="#6B7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
                  <Tooltip 
                     contentStyle={{ 
                       backgroundColor: '#fff', 
                       border: '1px solid #e5e7eb', 
                       borderRadius: '12px',
                       boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                       padding: '12px 16px',
                       fontSize: '14px'
                     }}
                     cursor={{ stroke: '#10B981', strokeWidth: 2 }}
                     animationDuration={200}
                   />
                  <Area 
                     type="monotone" 
                     dataKey="value" 
                     stroke="#10B981" 
                     fill="url(#epsGradient)" 
                     fillOpacity={0.8}
                     strokeWidth={3}
                     dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                     activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
                   />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Reservation Distribution */}
        {reservationData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservation Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                     contentStyle={{ 
                       backgroundColor: '#fff', 
                       border: '1px solid #e5e7eb', 
                       borderRadius: '12px',
                       boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                       padding: '12px 16px',
                       fontSize: '14px'
                     }}
                     cursor={false}
                     animationDuration={200}
                   />
                  <Legend />
                  <Pie 
                    data={reservationData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    label={({ percent }) => `${((percent || 0) * 100).toFixed(1)}%`}
                     labelLine={false}
                  >
                    {reservationData.map((entry: ChartDataItem, index: number) => (
                       <Cell 
                         key={`cell-${index}`} 
                         fill={CHART_COLORS[index % CHART_COLORS.length]}
                         stroke={CHART_COLORS[index % CHART_COLORS.length]}
                         strokeWidth={2}
                       />
                     ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Promoter Holdings */}
        {promoterData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Promoter Holdings</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={promoterData}>
                  <RadialBar 
                    dataKey="value" 
                    cornerRadius={10} 
                    fill="#8884d8" 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px' 
                    }}
                    formatter={(value, _name, props) => [
                      `${value}%`,
                      props.payload.fullName
                    ]}
                  />
                  <Legend />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Visualization */}
      {timelineData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">IPO Timeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6B7280" tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="event" 
                  stroke="#6B7280" 
                  tick={{ fontSize: 11 }} 
                  width={120}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px' 
                  }}
                  formatter={(value, _name, props) => [
                    props.payload.date,
                    props.payload.fullEvent
                  ]}
                />
                <Bar dataKey="order" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {kpiData.length === 0 && epsData.length === 0 && reservationData.length === 0 && timelineData.length === 0 && promoterData.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Chart Data Available</h3>
          <p className="text-gray-500">Charts will appear here when financial data is available for this IPO.</p>
        </div>
      )}
    </div>
  );
}