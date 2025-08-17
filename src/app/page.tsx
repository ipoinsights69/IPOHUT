"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { apiUtils, IpoStatistics, IpoData, ListingGainsResponse, IpoListingGain } from "@/config/api";
import { Search, TrendingUp, Calendar, CheckCircle } from "lucide-react";



export default function HomePage() {
  // const [searchQuery] = useState(""); // Search functionality to be implemented when needed
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

  // Search functionality to be implemented
  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (searchQuery.trim()) {
  //     console.log('Searching for:', searchQuery);
  //   }
  // };

  // Status color utility - to be used when implementing status badges
  // const getStatusColor = (status: string) => {
  //   switch (status.toLowerCase()) {
  //     case 'upcoming': return 'bg-blue-100 text-blue-800';
  //     case 'open': return 'bg-green-100 text-green-800';
  //     case 'closed': return 'bg-gray-100 text-gray-800';
  //     default: return 'bg-gray-100 text-gray-800';
  //   }
  // };

  // IPO info extraction utility - to be used when displaying IPO cards
  // const extractIpoInfo = (details: IpoDetailData | undefined) => {
  //   if (!details) return {};
  //   const info: Record<string, string> = {};
  //   // Extract lot size, face value, price range, timeline dates...
  //   return info;
  // };

  // Status icon utility - to be used when implementing status indicators
  // const getStatusIcon = (status: string) => {
  //   switch (status.toLowerCase()) {
  //     case 'upcoming': return <Calendar className="w-4 h-4" />;
  //     case 'open': return <Clock className="w-4 h-4" />;
  //     case 'closed': return <CheckCircle className="w-4 h-4" />;
  //     default: return <Calendar className="w-4 h-4" />;
  //   }
  // };

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
    <main className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="container mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide">IPO Intelligence Platform</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Track IPOs <span className="text-emerald-600">Smarter</span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Real-time IPO data, GMP tracking, allotment checker, and expert insights for informed investment decisions.
                </p>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Live GMP</h3>
                    <p className="text-xs text-gray-600 mt-1">Real-time grey market premium tracking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Allotment Status</h3>
                    <p className="text-xs text-gray-600 mt-1">Instant allotment verification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">IPO Calendar</h3>
                    <p className="text-xs text-gray-600 mt-1">Complete upcoming IPO schedule</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Search className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">Expert Analysis</h3>
                    <p className="text-xs text-gray-600 mt-1">Professional investment insights</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              {/* <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">2,500+</div>
                  <div className="text-sm text-gray-600">IPOs Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">99.2%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
              </div> */}
            </div>

            {/* Right Content - Live Dashboard */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Live IPO Dashboard</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-emerald-600 font-medium">Live</span>
                </div>
              </div>

              {/* Live IPO Cards */}
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-100 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Active IPO */}
                     {getIposByStatus('open').slice(0, 1).map((ipo, index) => {
                        const metrics = extractIpoMetrics(ipo);
                        return (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-emerald-50 to-white">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{ipo.name}</h4>
                                <p className="text-xs text-gray-600">Open for Subscription</p>
                              </div>
                              <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-md">Active</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{metrics.priceBand}</div>
                                <div className="text-xs text-gray-500">Price Band</div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-emerald-600">{metrics.openDateFormatted}</div>
                                <div className="text-xs text-gray-500">Open Date</div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-blue-600">{metrics.closeDateFormatted}</div>
                                <div className="text-xs text-gray-500">Close Date</div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: '60%'}}></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Duration: {metrics.duration}</span>
                                <span>Issue Size: {metrics.issueSize}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {/* Upcoming IPO */}
                     {getIposByStatus('upcoming').slice(0, 1).map((ipo, index) => {
                        const metrics = extractIpoMetrics(ipo);
                        return (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{ipo.name}</h4>
                                <p className="text-xs text-gray-600">Scheduled Launch</p>
                              </div>
                              <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-md">Upcoming</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{metrics.priceBand}</div>
                                <div className="text-xs text-gray-500">Price Band</div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-purple-600">{metrics.openDateFormatted}</div>
                                <div className="text-xs text-gray-500">Open Date</div>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-600">{metrics.issueSize}</div>
                                <div className="text-xs text-gray-500">Issue Size</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </>
                )}
              </div>

              {/* Dashboard Footer */}
              {/* <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Updated 2 minutes ago</span>
                  <Link href="/ipos" className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div> */}
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
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exchange</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeTab === 'top' ? (
                      !listingGainsData || listingGainsData.ipos.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
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
                                <div className="flex items-center gap-3">
                                  <Link href={`/ipo/${ipo.slug}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                    {ipo.name}
                                  </Link>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {isPositive ? '+' : ''}{ipo.listing_gain_percent}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                ₹{issuePrice.toFixed(0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                ₹{listingPrice.toFixed(0)}
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
                          <td colSpan={5} className="px-6 py-12 text-center">
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
                                <div className="flex items-center gap-3">
                                  <Link href={`/ipo/${ipo.slug}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                    {ipo.name}
                                  </Link>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {isPositive ? '+' : ''}{ipo.listing_gain_percent}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                ₹{issuePrice.toFixed(0)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                ₹{listingPrice.toFixed(0)}
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
