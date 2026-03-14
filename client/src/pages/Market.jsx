import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { api } from "../services/apiService";
import StockCard from "../components/StockCard";

const Market = ({ onStockSelect }) => {
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    const intervalID = setInterval(loadData, 20000);

    return () => clearInterval(intervalID);
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([loadStocks(), loadWatchlist()]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStocks = async () => {
    try {
      const data = await api.getAllStocks();
      setStocks(data.rows || []);
    } catch (error) {
      console.error("Failed to load stocks:", error);
    }
  };

  const loadWatchlist = async () => {
    try {
      const data = await api.getWatchlist();
      setWatchlist(data.rows?.map((item) => item.tickersymbol) || []);
    } catch (error) {
      console.error("Failed to load watchlist:", error);
    }
  };

  const toggleWatchlist = async (ticker) => {
    try {
      await api.updateWatchlist(ticker);
      await loadWatchlist();
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    }
  };

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.tickersymbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.companyname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">Loading market data...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Market Overview
        </h2>
        <p className="text-gray-600">
          Browse and discover investment opportunities
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-4 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search stocks by ticker or company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStocks.map((stock) => (
          <StockCard
            key={stock.stockid}
            stock={stock}
            isInWatchlist={watchlist.includes(stock.tickersymbol)}
            onToggleWatchlist={toggleWatchlist}
            onViewDetails={onStockSelect}
          />
        ))}
      </div>

      {filteredStocks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No stocks found</p>
          <p className="text-gray-400 mt-2">Try adjusting your search</p>
        </div>
      )}
    </div>
  );
};

export default Market;
