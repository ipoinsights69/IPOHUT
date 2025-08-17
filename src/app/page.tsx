"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { apiUtils, IpoStatistics, IpoData } from "@/config/api";
import { Search, TrendingUp, Calendar, Clock, CheckCircle, ArrowRight } from "lucide-react";



export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ipoData, setIpoData] = useState<IpoStatistics | null>(null);
  const [allIpos, setAllIpos] = useState<IpoData[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchIPOData = async () => {
      try {
        const [statisticsData, allIposData] = await Promise.all([
          apiUtils.fetchIpoStatistics(true, 10),
          apiUtils.fetchAllIpos()
        ]);
        if (statisticsData) {
          setIpoData(statisticsData);
        }
        if (allIposData) {
          setAllIpos(allIposData);
        }
      } catch (error) {
        console.error('Failed to fetch IPO data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIPOData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or handle search
      console.log('Searching for:', searchQuery);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming': return <Calendar className="w-4 h-4" />;
      case 'open': return <Clock className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getIposByStatus = (status: string) => {
    return allIpos.filter(ipo => ipo.status.toLowerCase() === status.toLowerCase()).slice(0, 6);
  };



  return (
    <>
    <main className="min-h-screen bg-white pt-16">
      {/* Header Section */}
      <section className="border-b border-gray-100">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Title & Description */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">Live Market Data</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
                IPO Market Intelligence
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Real-time IPO data, comprehensive analysis, and market insights for informed investment decisions
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="flex-shrink-0 w-full lg:w-96">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search IPOs, companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500 transition-all"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {ipoData?.by_status?.Upcoming?.count || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Upcoming IPOs</div>
                  <div className="text-xs text-gray-500 mt-1">Scheduled for launch</div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-sm"></div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {ipoData?.by_status?.Open?.count || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Open for Subscription</div>
                  <div className="text-xs text-gray-500 mt-1">Currently accepting applications</div>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-emerald-600 rounded-sm"></div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {ipoData?.by_status?.Closed?.count || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Recently Closed</div>
                  <div className="text-xs text-gray-500 mt-1">Subscription ended</div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-gray-600 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming IPOs Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Upcoming IPOs</h2>
              <p className="text-sm text-gray-600">Companies scheduled to go public</p>
            </div>
            <Link href="/ipos?status=upcoming" className="text-gray-900 hover:text-gray-700 font-medium text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all">
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-8">
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : getIposByStatus('upcoming').length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming IPOs</h3>
              <p className="text-gray-600">There are currently no IPOs scheduled for launch.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getIposByStatus('upcoming').map((ipo: IpoData, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/ipo/${ipo.slug}`} className="text-gray-900 hover:text-blue-600 font-medium transition-colors">
                          {ipo.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {ipo.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {ipo.ipo_details?.slice(0, 2).map((detail: Record<string, string>, index: number) => (
                            <div key={index} className="mb-1 last:mb-0">
                              {Object.values(detail)[0] as string}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ipo.year}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Open IPOs Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Open for Subscription</h2>
              <p className="text-sm text-gray-600">IPOs currently accepting applications</p>
            </div>
            <Link href="/ipos?status=open" className="text-gray-900 hover:text-gray-700 font-medium text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all">
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-8">
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : getIposByStatus('open').length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 bg-emerald-300 rounded"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Open IPOs</h3>
              <p className="text-gray-600">There are currently no IPOs open for subscription.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getIposByStatus('open').map((ipo: IpoData, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/ipo/${ipo.slug}`} className="text-gray-900 hover:text-blue-600 font-medium transition-colors">
                          {ipo.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {ipo.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {ipo.ipo_details?.slice(0, 2).map((detail: Record<string, string>, index: number) => (
                            <div key={index} className="mb-1 last:mb-0">
                              {Object.values(detail)[0] as string}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ipo.year}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Closed IPOs Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Recently Closed</h2>
              <p className="text-sm text-gray-600">Check allotment status and performance</p>
            </div>
            <Link href="/ipos?status=closed" className="text-gray-900 hover:text-gray-700 font-medium text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all">
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-8">
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : getIposByStatus('closed').length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recently Closed IPOs</h3>
              <p className="text-gray-600">There are currently no recently closed IPOs to display.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getIposByStatus('closed').map((ipo: IpoData, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/ipo/${ipo.slug}`} className="text-gray-900 hover:text-blue-600 font-medium transition-colors">
                          {ipo.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                          {ipo.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {ipo.ipo_details?.slice(0, 2).map((detail: Record<string, string>, index: number) => (
                            <div key={index} className="mb-1 last:mb-0">
                              {Object.values(detail)[0] as string}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ipo.year}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>


    </main>
     
    {/* Footer */}

    </>
  );
}
