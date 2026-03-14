import React, { useState, useEffect } from "react";
import { ArrowLeft, Star, TrendingUp, TrendingDown } from "lucide-react";
import { api } from "../services/apiService";
import { useAuth } from "../contexts/AuthContext";

const StockDetail = ({ stockId, onBack }) => {
  const { user, refreshDashboard } = useAuth();
  const [stock, setStock] = useState(null);
  const [tradeType, setTradeType] = useState("buy");
  const [quantity, setQuantity] = useState("");
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [cashBalance, setCashBalance] = useState(0);

  useEffect(() => {
    loadFunds();
  }, [user]);

  const loadFunds = async () => {
    try {
      const data = await api.getFunds(); // apiRequest will inject user_id
      // try several common shapes
      const balance = data.cashbalance;

      setCashBalance(balance);
    } catch (err) {
      console.error("Failed to load funds:", err);
      setMessage({
        type: "error",
        text: "Failed to load balance. Try again.",
      });
    }
  };

  useEffect(() => {
    loadStock();
    const intervalId = setInterval(loadStock, 10000);
    return () => clearInterval(intervalId);
  }, [stockId]);

  const loadStock = async () => {
    try {
      const data = await api.getStockById(stockId);
      setStock(data.rows?.[0]);
      console.log(data.rows?.[0]);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load stock:", error);
      setLoading(false);
    }
  };

  const toggleWatchlist = async () => {
    try {
      await api.updateWatchlist(stock.tickersymbol);
      setIsInWatchlist(!isInWatchlist);
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    }
  };

  const executeTrade = async () => {
    setExecuting(true);
    try {
      await api.executeTrade({
        userId: user.user_id,
        ticker: stock.tickersymbol,
        quantity: parseInt(quantity),
        tradeType: tradeType.toUpperCase(),
      });
      alert("Trade executed successfully!");
      setQuantity("");
      await loadStock();
      refreshDashboard();
    } catch (error) {
      alert("Trade failed: " + error.message);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">Loading stock details...</div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">Stock not found</p>
          <button
            onClick={onBack}
            className="mt-4 text-blue-600 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const estimatedPrice = parseFloat(
    (parseFloat(quantity || 0) * stock.currentprice).toFixed(2)
  );
  const canBuy = estimatedPrice > 0 && estimatedPrice <= cashBalance;
  const canSell =
    parseInt(quantity || 0) > 0 &&
    parseInt(quantity || 0) <= (stock.currentholding || 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {stock.tickersymbol}
            </h2>
            <p className="text-gray-600">{stock.companyname}</p>
          </div>
        </div>
        <button
          onClick={toggleWatchlist}
          className={`p-3 rounded-xl transition-all ${
            isInWatchlist
              ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          }`}
        >
          <Star size={24} />
        </button>
      </div>

      {/* Price Card */}
      <div className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-2">Current Price</p>
            <p className="text-5xl font-bold mb-3">${stock.currentprice}</p>
            <div className="flex items-center">
              {stock.pricechangepercent >= 0 ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              )}
              <span className="ml-2 text-lg font-semibold">
                {stock.pricechangepercent >= 0 ? "+" : ""}
                {stock.pricechangepercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Holdings (if user owns) */}
      {stock.currentholding > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Your Holdings
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Shares Owned</p>
              <p className="text-3xl font-bold text-gray-800">
                {stock.currentholding}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Unrealized P/L</p>
              <p
                className={`text-3xl font-bold ${
                  stock.unrealizedpl >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stock.unrealizedpl >= 0 ? "+" : ""}${stock.unrealizedpl}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trading Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Trade</h3>

        {/* Buy/Sell Toggle */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setTradeType("buy")}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              tradeType === "buy"
                ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setTradeType("sell")}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              tradeType === "sell"
                ? "bg-linear-to-r from-red-600 to-pink-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Sell
          </button>
        </div>

        {/* Quantity Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Shares
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter quantity"
            />
          </div>

          {/* Trade Summary */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Price per share:</span>
              <span className="font-semibold">${stock.currentprice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                Estimated {tradeType === "buy" ? "cost" : "proceeds"}:
              </span>
              <span className="font-bold text-lg">${estimatedPrice}</span>
            </div>
            {tradeType === "buy" && (
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600">Your cash balance:</span>
                <span className="font-semibold text-green-600">
                  ${cashBalance}
                </span>
              </div>
            )}
            {tradeType === "sell" && (
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600">Shares available:</span>
                <span className="font-semibold">
                  {stock.currentholding || 0}
                </span>
              </div>
            )}
          </div>

          {/* Execute Button */}
          <button
            onClick={executeTrade}
            disabled={
              executing ||
              !quantity ||
              (tradeType === "buy" && !canBuy) ||
              (tradeType === "sell" && !canSell)
            }
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              (tradeType === "buy" && canBuy) ||
              (tradeType === "sell" && canSell)
                ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {executing
              ? "Executing..."
              : `Execute ${tradeType === "buy" ? "Buy" : "Sell"} Order`}
          </button>

          {tradeType === "buy" && !canBuy && quantity && (
            <p className="text-sm text-red-600 text-center">
              Insufficient funds for this purchase
            </p>
          )}
          {tradeType === "sell" && !canSell && quantity && (
            <p className="text-sm text-red-600 text-center">
              You don't have enough shares to sell
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
