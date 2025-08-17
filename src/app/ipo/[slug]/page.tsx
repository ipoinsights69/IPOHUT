import Link from "next/link";
import { notFound } from "next/navigation";
import { apiUtils, IpoDetailData } from "@/config/api";
import IpoDetailCharts from "@/components/charts/ipo-detail-charts";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const revalidate = 60; // ISR
export const dynamicParams = false; // Only allow known slugs, others 404

export async function generateStaticParams() {
  const slugs = await apiUtils.getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function IpoDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const basicData = await apiUtils.fetchIpoBySlug(slug);
  const detailData = await apiUtils.fetchIpoDetails(slug);
  
  if (!basicData) {
    notFound();
  }

  // Status badge color based on IPO status
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/ipos" className="hover:text-blue-600">IPOs</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{basicData.name}</span>
      </div>

      {/* Revamped Header with badges */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Placeholder logo */}
            <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-blue-600">
                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                <path d="M8 12h8M12 8v8" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{basicData.name}</h1>
              <div className="mt-2 flex items-center gap-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(basicData.status)}`}>
                  {basicData.status}
                </span>
                <span className="text-gray-500 text-sm">Year: {basicData.year}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge appearance="light" variant="primary" className="gap-1">Rating: 4.5</Badge>
            <Badge appearance="light" variant="success" className="gap-1">Trust: High</Badge>
            <Badge appearance="light" variant="warning" className="gap-1">Volatility: Medium</Badge>
          </div>
        </div>

        {/* Action Links */}
        <div className="mt-6 border-t border-gray-200 pt-4 flex flex-wrap gap-3">
          <Link 
            href={`/ipo/${slug}/allotment-status`}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Primary Action
          </Link>
          <Link 
            href={`/ipo/${slug}/subscription-status`}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Secondary Action
          </Link>
        </div>
      </div>

      {/* Full width urgent notice */}
      <div className="mb-8">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-yellow-600 mt-0.5">
              <path d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z" strokeWidth="2"/>
            </svg>
            <div>
              <div className="font-medium text-yellow-900">Urgent Notice</div>
              <div className="text-sm text-yellow-800">Main helpline or important information goes here as a placeholder.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Support channels grid */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">Section Title</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Phone Support' },
                { label: 'Email Support' },
                { label: 'Live Chat' },
                { label: 'Social Media' },
              ].map((item, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-3">
                  <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 10H7" strokeWidth="2" />
                      <path d="M21 6H3" strokeWidth="2" />
                      <path d="M21 14H3" strokeWidth="2" />
                      <path d="M21 18H7" strokeWidth="2" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Card Heading</div>
                    <div className="text-sm text-gray-600">Short description text as a placeholder.</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Escalation steps */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">Escalation Steps</h2>
            </div>
            <div className="p-6 grid grid-cols-1 gap-4">
              {[1,2,3,4].map((step) => (
                <div key={step} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-medium">{step}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Step Title</div>
                    <div className="text-sm text-gray-600">Brief placeholder information for this step.</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Charts */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">Visual Overview</h2>
            </div>
            <div className="p-6">
              <IpoDetailCharts />
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">FAQs</h2>
            </div>
            <div className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {[1,2,3,4].map((i) => (
                  <AccordionItem key={i} value={`q-${i}`}>
                    <AccordionTrigger>Question Title</AccordionTrigger>
                    <AccordionContent>
                      <p>Answer content as a placeholder with generic text for demonstration.</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* Existing detail sections retained below for data completeness */}
          {/* IPO Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">IPO Overview</h2>
            </div>
            <div className="p-6">
              {detailData && (
                <div className="space-y-6">
                  {/* Company Description */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">About Company</h3>
                    <p className="text-gray-600">
                      {detailData.about_company?.description || "Company description not available."}
                    </p>
                  </div>
                  {/* IPO Details */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">IPO Details</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="bg-white divide-y divide-gray-200">
                          {detailData.ipo_details?.map((detail, index) => {
                            const keys = Object.keys(detail).filter(key => key !== "" && key !== "S.No.");
                            return keys.map(key => (
                              <tr key={`${index}-${key}`}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{key}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{detail[key]}</td>
                              </tr>
                            ));
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* IPO Price */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">IPO Price</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="bg-white divide-y divide-gray-200">
                          {detailData.ipo_price?.map((price, index) => {
                            const keys = Object.keys(price).filter(key => key !== "" && key !== "S.No.");
                            return keys.map(key => (
                              <tr key={`price-${index}-${key}`}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{key}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{price[key]}</td>
                              </tr>
                            ));
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {!detailData && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Detailed information not available for this IPO.</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          {detailData?.timeline && detailData.timeline.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">IPO Timeline</h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailData.timeline.map((item, index) => (
                        <tr key={`timeline-${index}`}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{item[0]}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{item[1]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Objectives */}
          {detailData?.objectives && detailData.objectives.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">IPO Objectives</h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No.</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objective</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₹ in crores)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailData.objectives.map((objective, index) => (
                        <tr key={`objective-${index}`}>
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{objective["S.No."]}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{objective["Objects of the Issue"]}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{objective["Expected Amount(₹ in crores)"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: sidebar tips and additional data */}
        <aside className="space-y-8">
          {/* Tips box */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
            <div className="font-semibold text-gray-900 mb-3">Tips & Reminders</div>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li>Bullet point placeholder one.</li>
              <li>Bullet point placeholder two.</li>
              <li>Bullet point placeholder three.</li>
            </ul>
          </div>

          {/* Lot Size */}
          {detailData?.lots && detailData.lots.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">Lot Size</h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lots</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailData.lots.map((lot, index) => (
                        <tr key={`lot-${index}`}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{lot["Application"]}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{lot["Lots"]}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{lot["Shares"]}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{lot["Amount"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Financial Metrics */}
          {detailData?.KPI && detailData.KPI.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">Financial Metrics</h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailData.KPI.map((kpi, index) => (
                        <tr key={`kpi-${index}`}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{kpi.KPI}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{kpi.Values}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Promoters */}
          {detailData?.promoters && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">Promoters</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{detailData.promoters}</p>
                {detailData.promoters_holdings && detailData.promoters_holdings.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Promoters Holdings</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="bg-white divide-y divide-gray-200">
                          {detailData.promoters_holdings.map((holding, index) => (
                            <tr key={`holding-${index}`}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{holding[0]}</td>
                              <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{holding[1]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EPS Data */}
          {detailData?.EPS && detailData.EPS.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">EPS Data</h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailData.EPS.map((eps, index) => {
                        const keys = Object.keys(eps).filter(key => key !== "" && key !== "S.No.");
                        return keys.map(key => (
                          <tr key={`eps-${index}-${key}`}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{key}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{eps[key]}</td>
                          </tr>
                        ));
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Reservation Data */}
          {detailData?.reservation && detailData.reservation.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">Reservation Details</h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailData.reservation.map((reservation, index) => {
                        const keys = Object.keys(reservation).filter(key => key !== "" && key !== "S.No.");
                        return keys.map(key => (
                          <tr key={`reservation-${index}-${key}`}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{key}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{reservation[key]}</td>
                          </tr>
                        ));
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Review Data */}
          {detailData?.review && detailData.review.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailData.review.map((review, index) => {
                        const keys = Object.keys(review).filter(key => key !== "" && key !== "S.No.");
                        return keys.map(key => (
                          <tr key={`review-${index}-${key}`}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{key}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{review[key]}</td>
                          </tr>
                        ));
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Prospectus */}
          {detailData?.prospectus_links && detailData.prospectus_links.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">Prospectus</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {detailData.prospectus_links.map((link, index) => (
                    <li key={`link-${index}`}>
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {link.title || link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}