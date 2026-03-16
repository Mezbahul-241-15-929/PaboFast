'use client';

import React, { useState, useEffect } from 'react';

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState(''); // State to track what user types

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const allProducts = [
    { id: 1, name: "iPhone 16 Pro Max", price: "$899", oldPrice: "$930", rating: 0, category: "Products" },
    { id: 2, name: "Rangs 43 Inch Frameless FHD Double Glass Android TV", price: "$700", oldPrice: "$800", rating: 0, category: "Products" },
    { id: 3, name: "Portable Electric Grinder Maker", price: "$777", oldPrice: "$888", rating: 0, category: "Products" },
    { id: 4, name: "MacBook Air M4 chip, 16/256GB", price: "$600", oldPrice: "$699", rating: 0, category: "Products" },
    { id: 5, name: "How to setup your new Smart Home", price: "Free", oldPrice: "", rating: 5, category: "Blogs" },
  ];

  // Logic to filter products based on Search Query AND Active Tab
  const filteredResults = allProducts.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || item.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="w-full">
      {/* --- 1. NAVBAR SEARCH BAR --- */}
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full max-w-4xl mx-auto flex items-center justify-between bg-white border border-gray-200 rounded-full px-6 py-2.5 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-300"
      >
        <span className="text-gray-400 font-light text-base">I am shopping for...</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* --- 2. POPUP SECTION --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex justify-center items-center sm:p-4 transition-all">
          
          <div 
            className={`
              bg-white flex flex-col overflow-hidden transition-all duration-300
              sm:w-full sm:max-w-4xl sm:max-h-[85vh] sm:rounded-2xl sm:shadow-2xl
              max-sm:w-full max-sm:h-full max-sm:rounded-none
              animate-in zoom-in-95 duration-200
            `}
          >
            {/* Header Area with specific padding */}
            <div className="p-5 sm:p-7 border-b border-gray-100 flex items-center gap-4">
              <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Type anything to search..." 
                  className="w-full bg-transparent border-none outline-none px-3 text-gray-800 text-lg"
                  autoFocus 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} // Makes the bar work
                />
              </div>
              <button 
                onClick={() => {
                    setIsOpen(false);
                    setSearchQuery(''); // Reset search on close
                }}
                className="p-2 sm:p-3 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 px-6 py-4 bg-gray-50/20">
              {['All', 'Products', 'Blogs'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activeTab === tab 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Results Section with specific padding */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-blue-900 font-bold text-xl px-1">{activeTab} Results</h3>
                <span className="text-sm text-gray-400">{filteredResults.length} found</span>
              </div>
              
              <div className="grid gap-4">
                {filteredResults.length > 0 ? (
                  filteredResults.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex gap-5 p-4 rounded-xl hover:bg-blue-50/30 border border-transparent hover:border-blue-100 transition-all group cursor-pointer"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-100 overflow-hidden">
                         <svg className="w-10 h-10 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                         </svg>
                      </div>
                      
                      <div className="flex flex-col justify-center flex-1">
                        <h4 className="text-gray-900 font-semibold text-base group-hover:text-blue-600 transition-colors line-clamp-1">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-blue-600 font-bold text-lg">{item.price}</span>
                          {item.oldPrice && <span className="text-gray-400 line-through text-sm">{item.oldPrice}</span>}
                          
                          <div className="flex items-center gap-1 ml-auto">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className="text-xs">★</span>
                              ))}
                            </div>
                            <span className="text-gray-400 text-xs ml-1 font-medium">({item.rating})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    {/* <p className="text-gray-400">No results found for "{searchQuery}"</p> */}
                    <p className="text-gray-400">No results found</p>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden sm:block p-3 text-center bg-gray-50 text-[10px] text-gray-400 uppercase tracking-widest border-t border-gray-100">
              Esc to close • Result filtering active
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;