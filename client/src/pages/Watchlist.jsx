import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { api } from "../services/apiService";
import StockCard from "../components/StockCard";

const Watchlist = ({ onStockSelect }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      const data = await api.getWatchlist();
      setWatchlist(data.rows || []);
    } catch (error) {
      console.error("Failed to load watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (ticker) => {
    try {
      await api.updateWatchlist(ticker);
      await loadWatchlist();
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">Loading watchlist...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">My Watchlist</h2>
        <p className="text-gray-600">Stocks you're tracking</p>
      </div>

      {watchlist.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star size={40} className="text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-800 mb-2">
            Your watchlist is empty
          </p>
          <p className="text-gray-500">
            Add stocks from the Market page to track them here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {watchlist.map((stock) => (
            <StockCard
              key={stock.stockid}
              stock={stock}
              isInWatchlist={true}
              onToggleWatchlist={removeFromWatchlist}
              onViewDetails={onStockSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
