import React from "react";
import { TrendingUp, TrendingDown, Star } from "lucide-react";

const StockCard = ({
  stock,
  isInWatchlist,
  onToggleWatchlist,
  onViewDetails,
}) => {
  const ticker = stock.tickersymbol || stock.ticker_symbol;
  const companyName = stock.companyname || stock.companyName;
  const currentPrice = stock.currentprice || stock.currentPrice;
  const priceChange = stock.pricechangepercent || stock.priceChangePercent || 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{ticker}</h3>
          <p className="text-sm text-gray-600 line-clamp-1">{companyName}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(ticker);
          }}
          className={`p-2.5 rounded-lg transition-all duration-200 ${
            isInWatchlist
              ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          }`}
        >
          <Star size={18} />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-gray-900 mb-1">${currentPrice}</p>
        <div
          className={`flex items-center ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="ml-1.5 text-sm font-semibold">
            {isPositive ? "+" : ""}
            {Number(priceChange).toFixed(2)}%
          </span>
        </div>
      </div>

      <button
        onClick={() => onViewDetails(stock.stockid || stock.stockId)}
        className="w-full bg-linear-to-r  from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
      >
        View Details
      </button>
    </div>
  );
};

export default StockCard;
