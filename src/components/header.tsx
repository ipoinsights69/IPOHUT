"use client";

import Link from "next/link";
import { NAVIGATION_CONFIG } from "@/config/navigation";
import { useState, useEffect, FormEvent } from "react";
import { Search, Menu, X, TrendingUp, Bell, User } from "lucide-react";

// Define types for search results
type SearchResult = {
  slug: string;
  name: string;
  status: string;
};

export function Header() {
  const { siteName, header } = NAVIGATION_CONFIG;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/ipo/search?query=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200' 
          : 'bg-white border-b border-gray-100'
      }`}>
        {/* Main Navigation Bar */}
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-gray-800">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900 transition-colors duration-200 group-hover:text-gray-700">
                {siteName}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {header.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                aria-label="Search IPOs"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button className="hidden md:flex p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200">
                <Bell className="w-5 h-5" />
              </button>

              {/* User Profile */}
              <button className="hidden md:flex p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200">
                <User className="w-5 h-5" />
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      
        
        {/* Search Overlay */}
        {searchOpen && (
          <div className="absolute inset-x-0 top-full bg-white border-b border-gray-200 shadow-lg">
            <div className="container mx-auto max-w-4xl p-6">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search IPOs, companies, or symbols..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 bg-white"
                    autoFocus
                  />
                  <button 
                     type="submit" 
                     className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-all duration-200 text-sm font-medium"
                   >
                    Search
                  </button>
                </div>
              </form>
              
              {/* Search Results */}
              {searchQuery.trim().length > 1 && (
                <div className="mt-4 max-h-80 overflow-y-auto">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      <span className="ml-3 text-gray-600 text-sm">Searching...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((result) => (
                        <Link 
                          key={result.slug}
                          href={`/ipo/${result.slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="block p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-gray-100 hover:border-gray-200 group"
                        >
                          <div className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">{result.name}</div>
                          <div className="text-sm text-gray-500 mt-1">{result.status}</div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Search className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-gray-500 text-sm">No results found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          
          {/* Mobile Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <span className="text-lg font-semibold text-gray-900">{siteName}</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Navigation */}
              <nav className="flex-1 px-6 py-6">
                <ul className="space-y-1">
                  {header.map((item) => (
                    <li key={item.href}>
                      <Link 
                        href={item.href}
                        className="flex items-center px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="flex-1">{item.label}</span>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              
              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-200 space-y-2">
                <button className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}