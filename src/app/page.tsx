"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { apiUtils, IpoStatistics, IpoData, IpoDetailData, ListingGainsResponse, IpoListingGain } from "@/config/api";
import { Search, TrendingUp, Calendar, Clock, CheckCircle, ArrowRight } from "lucide-react";



export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ipoData, setIpoData] = useState<IpoStatistics | null>(null);
  const [listingGainsData, setListingGainsData] = useState<ListingGainsResponse | null>(null);
  const [lowestGainsData, setLowestGainsData] = useState<ListingGainsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'top' | 'lowest'>('top');
  const [activeIpoTab, setActiveIpoTab] = useState<'upcoming' | 'open' | 'closed'>('upcoming');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchIPOData = async () => {
      try {
        const [statisticsData, listingGains, lowestGains] = await Promise.all([
          apiUtils.fetchIpoStatistics(true, 20),
          apiUtils.fetchListingGains(6, 'gain_desc'),
          apiUtils.fetchListingGains(6, 'gain_asc')
        ]);
        
        if (statisticsData) {
          setIpoData(statisticsData);
        }
        if (listingGains) {
          setListingGainsData(listingGains);
        }
        if (lowestGains) {
          setLowestGainsData(lowestGains);
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

  const extractIpoInfo = (details: IpoDetailData | undefined) => {
    if (!details) return {};
    
    const info: Record<string, string> = {};
    
    // Extract lot size
    if (details.lots && details.lots.length > 0) {
      const lotInfo = details.lots.find(lot => 
        Object.keys(lot).some(key => key.toLowerCase().includes('lot'))
      );
      if (lotInfo) {
        const lotKey = Object.keys(lotInfo).find(key => key.toLowerCase().includes('lot'));
        if (lotKey) info.lotSize = lotInfo[lotKey];
      }
    }
    
    // Extract face value from ipo_price (tuple array)
    if (details.ipo_price && details.ipo_price.length > 0) {
      const priceInfo = details.ipo_price.find(([key]) => 
        key.toLowerCase().includes('face') || key.toLowerCase().includes('value')
      );
      if (priceInfo) {
        info.faceValue = priceInfo[1];
      }
    }
    
    // Extract price range from ipo_price (tuple array)
    if (details.ipo_price && details.ipo_price.length > 0) {
      const priceInfo = details.ipo_price.find(([key]) => 
        key.toLowerCase().includes('price') || key.toLowerCase().includes('range')
      );
      if (priceInfo) {
        info.priceRange = priceInfo[1];
      }
    }
    
    // Extract timeline dates
    if (details.timeline && details.timeline.length > 0) {
      const openDate = details.timeline.find(([event]) => 
        event.toLowerCase().includes('open') || event.toLowerCase().includes('start')
      );
      const closeDate = details.timeline.find(([event]) => 
        event.toLowerCase().includes('close') || event.toLowerCase().includes('end')
      );
      
      if (openDate) info.openDate = openDate[1];
      if (closeDate) info.closeDate = closeDate[1];
    }
    
    return info;
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
    if (!ipoData?.by_status) return [];
    const statusKey = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() as keyof typeof ipoData.by_status;
    return ipoData.by_status[statusKey]?.ipos?.slice(0, 6) || [];
  };

  const extractIpoMetrics = (ipo: IpoData) => {
    const details = ipo.ipo_details || [];
    const timeline = ipo.timeline || [];
    
    // Extract key information from ipo_details (array of [key, value] tuples)
    const issuePrice = details.find(([key]) => 
      key.toLowerCase().includes('issue price') || key.toLowerCase().includes('price')
    );
    const lotSize = details.find(([key]) => 
      key.toLowerCase().includes('lot size')
    );
    const faceValue = details.find(([key]) => 
      key.toLowerCase().includes('face value')
    );
    const totalIssueSize = details.find(([key]) => 
      key.toLowerCase().includes('total issue size') || key.toLowerCase().includes('issue size')
    );
    const ipoDate = details.find(([key]) => 
      key.toLowerCase().includes('ipo date')
    );
    
    // Extract timeline information
    const openDate = timeline.find(([event]) => 
      event.toLowerCase().includes('open')
    );
    const closeDate = timeline.find(([event]) => 
      event.toLowerCase().includes('close')
    );
    const listingDate = timeline.find(([event]) => 
      event.toLowerCase().includes('listing')
    );
    
    // Clean up text by removing common suffixes
    const cleanText = (text: string) => {
      if (!text || text === 'TBA') return text;
      return text
        .replace(/per share/gi, '')
        .replace(/per equity share/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    // Format price band (e.g., "₹315-332" or "₹315")
    const formatPriceBand = (priceText: string) => {
      if (!priceText || priceText === 'TBA') return 'TBA';
      const cleaned = cleanText(priceText);
      // If it already has ₹ symbol, return as is, otherwise add it
      return cleaned.includes('₹') ? cleaned : `₹${cleaned}`;
    };

    // Format issue size with proper currency formatting
    const formatIssueSize = (sizeText: string) => {
      if (!sizeText || sizeText === 'TBA') return 'TBA';
      const cleaned = cleanText(sizeText);
      
      // Extract only the numeric part before 'shares'
      // Example: "6,26,31,604shares(aggregating up to ₹2,079.37Cr)" -> "6,26,31,604"
      const sharesMatch = cleaned.match(/([\d,]+)\s*shares/i);
      if (sharesMatch) {
        return sharesMatch[1];
      }
      
      // If it already has ₹ symbol, return as is, otherwise add it
      return cleaned.includes('₹') ? cleaned : `₹${cleaned}`;
    };

    // Calculate IPO duration in days
    const calculateDuration = () => {
      if (!openDate || !closeDate || openDate[1] === 'TBA' || closeDate[1] === 'TBA') {
        return 'TBA';
      }
      try {
        const start = new Date(openDate[1]);
        const end = new Date(closeDate[1]);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return `${diffDays} days`;
      } catch {
        return 'TBA';
      }
    };

    // Format dates for display (e.g., "Aug 19")
    const formatDate = (dateStr: string) => {
      if (!dateStr || dateStr === 'TBA') return 'TBA';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    return {
      issuePrice: issuePrice ? cleanText(issuePrice[1]) : 'TBA',
      priceBand: issuePrice ? formatPriceBand(issuePrice[1]) : 'TBA',
      lotSize: lotSize ? cleanText(lotSize[1]) : 'TBA',
      faceValue: faceValue ? cleanText(faceValue[1]) : 'TBA',
      totalIssueSize: totalIssueSize ? cleanText(totalIssueSize[1]) : 'TBA',
      issueSize: totalIssueSize ? formatIssueSize(totalIssueSize[1]) : 'TBA',
      ipoDate: ipoDate ? cleanText(ipoDate[1]) : 'TBA',
      openDate: openDate ? openDate[1] : 'TBA',
      closeDate: closeDate ? closeDate[1] : 'TBA',
      listingDate: listingDate ? listingDate[1] : 'TBA',
      openDateFormatted: openDate ? formatDate(openDate[1]) : 'TBA',
      closeDateFormatted: closeDate ? formatDate(closeDate[1]) : 'TBA',
      listingDateFormatted: listingDate ? formatDate(listingDate[1]) : 'TBA',
      duration: calculateDuration(),
      timeline: timeline.slice(0, 2) // Get first 2 timeline events for compact view
    };
  };

  // Clean minimal styling for better UX
  const getStatusStyling = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return {
          badge: 'bg-blue-500 text-white text-xs font-medium',
          priceBox: 'bg-white border border-gray-100',
          priceText: 'text-gray-900',
          issueBox: 'bg-gray-50 border-0',
          issueText: 'text-gray-700',
          progressBar: 'bg-blue-500',
          progressWidth: 'w-1/6',
          cardBorder: 'border-gray-100 hover:border-gray-200',
          cardShadow: 'hover:shadow-lg hover:shadow-gray-100/25',
          accent: 'text-blue-600'
        };
      case 'open':
        return {
          badge: 'bg-emerald-500 text-white text-xs font-medium',
          priceBox: 'bg-white border border-gray-100',
          priceText: 'text-gray-900',
          issueBox: 'bg-gray-50 border-0',
          issueText: 'text-gray-700',
          progressBar: 'bg-emerald-500',
          progressWidth: 'w-3/5',
          cardBorder: 'border-gray-100 hover:border-gray-200',
          cardShadow: 'hover:shadow-lg hover:shadow-gray-100/25',
          accent: 'text-emerald-600'
        };
      case 'closed':
        return {
          badge: 'bg-gray-500 text-white text-xs font-medium',
          priceBox: 'bg-white border border-gray-100',
          priceText: 'text-gray-900',
          issueBox: 'bg-gray-50 border-0',
          issueText: 'text-gray-700',
          progressBar: 'bg-gray-400',
          progressWidth: 'w-full',
          cardBorder: 'border-gray-100 hover:border-gray-200',
          cardShadow: 'hover:shadow-lg hover:shadow-gray-100/25',
          accent: 'text-gray-600'
        };
      default:
        return {
          badge: 'bg-gray-400 text-white text-xs font-medium',
          priceBox: 'bg-white border border-gray-100',
          priceText: 'text-gray-900',
          issueBox: 'bg-gray-50 border-0',
          issueText: 'text-gray-700',
          progressBar: 'bg-gray-400',
          progressWidth: 'w-1/6',
          cardBorder: 'border-gray-100 hover:border-gray-200',
          cardShadow: 'hover:shadow-lg hover:shadow-gray-100/25',
          accent: 'text-gray-600'
        };
    }
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

      {/* IPO Status Section with Tabs */}
      <section className="py-12 bg-white">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">IPO Status Overview</h2>
              <p className="text-sm text-gray-600">Browse IPOs by their current status</p>
            </div>
            <Link href={`/ipos?status=${activeIpoTab}`} className="text-gray-900 hover:text-gray-700 font-medium text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all">
              View All
            </Link>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveIpoTab('upcoming')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeIpoTab === 'upcoming'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveIpoTab('open')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeIpoTab === 'open'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setActiveIpoTab('closed')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeIpoTab === 'closed'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Closed
            </button>
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
          ) : getIposByStatus(activeIpoTab).length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className={`w-8 h-8 rounded ${
                  activeIpoTab === 'upcoming' ? 'bg-gray-300' :
                  activeIpoTab === 'open' ? 'bg-emerald-300' : 'bg-gray-300'
                }`}></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeIpoTab === 'upcoming' ? 'Upcoming' : activeIpoTab === 'open' ? 'Open' : 'Recently Closed'} IPOs
              </h3>
              <p className="text-gray-600">
                {activeIpoTab === 'upcoming' ? 'There are currently no IPOs scheduled for launch.' :
                 activeIpoTab === 'open' ? 'There are currently no IPOs open for subscription.' :
                 'There are currently no recently closed IPOs to display.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getIposByStatus(activeIpoTab).map((ipo: IpoData, index: number) => {
                const metrics = extractIpoMetrics(ipo);
                const styling = getStatusStyling(activeIpoTab);
                
                return (
                  <Link key={index} href={`/ipo/${ipo.slug}`} className="group">
                    <div className={`bg-white border ${styling.cardBorder} rounded-xl p-4 ${styling.cardShadow} transition-all duration-200 hover:scale-[1.02] h-fit`}>
                      
                      {/* Clean Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 pr-3">
                          <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 h-10">
                            {ipo.name}
                          </h3>
                        </div>
                        <div className={`${styling.badge} px-2 py-1 rounded-md shrink-0 text-xs`}>
                          {activeIpoTab === 'upcoming' ? 'Upcoming' : activeIpoTab === 'open' ? 'Open' : 'Closed'}
                        </div>
                      </div>

                      {/* Price & Issue Size */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className={`${styling.priceBox} p-3 rounded-lg`}>
                          <div className={`text-lg font-semibold ${styling.priceText} mb-1`}>{metrics.priceBand}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Price Band</div>
                        </div>
                        <div className={`${styling.issueBox} p-3 rounded-lg`}>
                          <div className={`text-lg font-semibold ${styling.issueText} mb-1`}>{metrics.issueSize}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Issue Size</div>
                        </div>
                      </div>

                      {/* Minimal Details */}
                      <div className="flex justify-between items-center mb-4 py-2">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">{metrics.lotSize}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Lot Size</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">{metrics.faceValue}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Face Value</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-sm font-medium ${styling.accent}`}>{metrics.duration}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Duration</div>
                        </div>
                      </div>

                      {/* Clean Timeline */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                          <span>{metrics.openDateFormatted}</span>
                          <span>{metrics.closeDateFormatted}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className={`${styling.progressBar} h-1.5 rounded-full ${styling.progressWidth} ${
                            activeIpoTab === 'upcoming' ? 'group-hover:w-1/3' :
                            activeIpoTab === 'open' ? 'group-hover:w-4/5' : ''
                          } transition-all duration-300`}></div>
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">
                            {activeIpoTab === 'closed' ? 'Listed:' : 'Listing:'}
                          </span> {metrics.listingDateFormatted} • BSE, NSE
                        </div>
                        <div className="text-xs text-slate-800 font-semibold group-hover:text-slate-900 transition-colors">
                          View Details →
                        </div>
                      </div>

                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Listing Gains Section with Tabs */}
      <section className="py-12 bg-white">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">IPO Listing Performance</h2>
              <p className="text-sm text-gray-600">Compare listing day gains and losses</p>
            </div>
            <Link href={`/ipos?sort=${activeTab === 'top' ? 'listing-gains' : 'listing-gains-asc'}`} className="text-gray-900 hover:text-gray-700 font-medium text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all">
              View All
            </Link>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('top')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'top'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Top Gains
            </button>
            <button
              onClick={() => setActiveTab('lowest')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'lowest'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Lowest Gains
            </button>
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
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-28"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Price</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing Price</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gain %</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exchange</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeTab === 'top' ? (
                      !listingGainsData || listingGainsData.ipos.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                              <TrendingUp className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Top Gains Data</h3>
                            <p className="text-gray-600">There are currently no IPOs with top gains data available.</p>
                          </td>
                        </tr>
                      ) : (
                        listingGainsData?.ipos.slice(0, 8).map((ipo: IpoListingGain, index: number) => {
                          const gainPercent = parseFloat(ipo.listing_gain_percent.replace('%', ''));
                          const isPositive = gainPercent >= 0;
                          const issuePrice = parseFloat(ipo.listing_trading["Final Issue Price"].replace('₹', ''));
                          const listingPrice = parseFloat(ipo.listing_trading["Open"].replace('₹', ''));
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link href={`/ipo/${ipo.slug}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                  {ipo.name}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                ₹{issuePrice.toFixed(0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                ₹{listingPrice.toFixed(0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {isPositive ? '+' : ''}{ipo.listing_gain_percent}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {ipo.listing_date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {ipo.listing_at}
                              </td>

                            </tr>
                          );
                        })
                      )
                    ) : (
                      !lowestGainsData || lowestGainsData.ipos.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                              <TrendingUp className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Lowest Gains Data</h3>
                            <p className="text-gray-600">There are currently no IPOs with lowest gains data available.</p>
                          </td>
                        </tr>
                      ) : (
                        lowestGainsData?.ipos.slice(0, 8).map((ipo: IpoListingGain, index: number) => {
                          const gainPercent = parseFloat(ipo.listing_gain_percent.replace('%', ''));
                          const isPositive = gainPercent >= 0;
                          const issuePrice = parseFloat(ipo.listing_trading["Final Issue Price"].replace('₹', ''));
                          const listingPrice = parseFloat(ipo.listing_trading["Open"].replace('₹', ''));
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link href={`/ipo/${ipo.slug}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                  {ipo.name}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                ₹{issuePrice.toFixed(0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                ₹{listingPrice.toFixed(0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {isPositive ? '+' : ''}{ipo.listing_gain_percent}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {ipo.listing_date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {ipo.listing_at}
                              </td>

                            </tr>
                          );
                        })
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

    </main>
     
    <Footer />

    </>
  );
}
