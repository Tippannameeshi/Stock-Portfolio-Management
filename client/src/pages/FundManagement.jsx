import React, { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
} from "lucide-react";
import { api } from "../services/apiService";
import { useAuth } from "../contexts/AuthContext";

const FundManagement = () => {
  const { user, refreshDashboard } = useAuth();
  const [transactionType, setTransactionType] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [cashBalance, setCashBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [message, setMessage] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);

  useEffect(() => {
    if (user?.cashBalance || user?.cashBalance === 0) {
      setCashBalance(Number(user.cashBalance));
    }
    if (user?.user_id) {
      loadFunds();
      loadTransactionHistory();
    } else {
      setCashBalance(0);
      setTransactionHistory([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  const loadFunds = async () => {
    setMessage(null);
    setLoadingBalance(true);
    try {
      const data = await api.getFunds();
      const balance =
        data?.rows?.[0]?.cashbalance ??
        data?.rows?.[0]?.cashBalance ??
        data?.cashbalance ??
        data?.cashBalance ??
        data?.balance ??
        user?.cashBalance ??
        0;

      setCashBalance(Number(balance || 0));
    } catch (err) {
      console.error("Failed to load funds:", err);
      setMessage({
        type: "error",
        text: "Failed to load balance. Try again.",
      });
    } finally {
      setLoadingBalance(false);
    }
  };

  const loadTransactionHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await api.getWalletTransactions();
      // Handle different response formats
      const transactions = data?.rows || data?.transactions || data || [];
      setTransactionHistory(transactions);
    } catch (err) {
      console.error("Failed to load transaction history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleTransaction = async () => {
    setMessage(null);

    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount." });
      return;
    }

    if (
      transactionType === "withdrawal" &&
      numericAmount > Number(cashBalance)
    ) {
      setMessage({
        type: "error",
        text: "Withdrawal exceeds available balance.",
      });
      return;
    }

    setLoading(true);
    try {
      await api.updateFunds({
        amount: numericAmount,
        transactionType: transactionType.toUpperCase(),
      });

      setAmount("");
      await loadFunds();
      await loadTransactionHistory();
      refreshDashboard();
      setMessage({ type: "success", text: "Transaction successful." });
    } catch (error) {
      console.error("Transaction error:", error);
      setMessage({
        type: "error",
        text: "Transaction failed: " + (error?.message || "unknown error"),
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const quickAmounts = [100, 200, 500, 1000];
  const isValidAmount = amount && parseFloat(amount) > 0;
  const canWithdraw =
    transactionType === "withdrawal" &&
    parseFloat(amount || 0) <= Number(cashBalance);
  const canDeposit = transactionType === "deposit";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Fund Management
          </h2>
          <p className="text-gray-600">Manage your trading account balance</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              loadFunds();
              loadTransactionHistory();
            }}
            disabled={loadingBalance || loadingHistory}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
            title="Refresh balance and history"
          >
            <RefreshCw
              size={16}
              className={loadingBalance || loadingHistory ? "animate-spin" : ""}
            />
            <span className="text-sm">
              {loadingBalance || loadingHistory ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>
      </div>

      {/* Balance Display */}
      <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm mb-1">
              Available Cash Balance
            </p>
            <p className="text-4xl font-bold mb-1">
              ${Number(cashBalance || 0).toFixed(2)}
            </p>
            <p className="text-green-100 text-sm">Ready to invest</p>
          </div>
        </div>
      </div>

      {/* Transaction Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Transaction</h3>

        {/* Toggle */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setTransactionType("deposit")}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
              transactionType === "deposit"
                ? "bg-linear-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Plus size={20} />
            <span>Deposit</span>
          </button>
          <button
            onClick={() => setTransactionType("withdrawal")}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
              transactionType === "withdrawal"
                ? "bg-linear-to-r from-red-600 to-pink-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Minus size={20} />
            <span>Withdraw</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500 text-lg">
                $
              </span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            {transactionType === "withdrawal" && (
              <p className="text-sm text-gray-500 mt-2">
                Available to withdraw: ${Number(cashBalance || 0).toFixed(2)}
              </p>
            )}
          </div>

          {/* Quick Select */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Quick Select
            </p>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className="py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-all"
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleTransaction}
            disabled={
              loading ||
              !isValidAmount ||
              (transactionType === "withdrawal" && !canWithdraw)
            }
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              isValidAmount && (canDeposit || canWithdraw) && !loading
                ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {loading
              ? "Processing..."
              : transactionType === "deposit"
              ? "Deposit Funds"
              : "Withdraw Funds"}
          </button>

          {transactionType === "withdrawal" &&
            !canWithdraw &&
            isValidAmount && (
              <p className="text-sm text-red-600 text-center">
                Withdrawal amount exceeds available balance
              </p>
            )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Transaction History
          </h3>
          {loadingHistory && (
            <span className="text-sm text-gray-500">Loading...</span>
          )}
        </div>

        {transactionHistory.length === 0 && !loadingHistory ? (
          <div className="text-center py-12">
            <Clock size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No transactions yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your wallet transactions will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactionHistory.map((transaction, index) => {
              const txType = (
                transaction.transactiontype ||
                transaction.transactionType ||
                ""
              ).toLowerCase();
              const isDeposit = txType === "deposit";
              const txAmount = Number(transaction.amount || 0);
              const txStatus = transaction.status || "COMPLETED";
              const txTimestamp =
                transaction.transactiontimestamp ||
                transaction.transactionTimestamp ||
                transaction.timestamp;

              return (
                <div
                  key={
                    transaction.wallettransactionid ||
                    transaction.walletTransactionId ||
                    index
                  }
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-full ${
                        isDeposit
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {isDeposit ? (
                        <ArrowDownCircle size={24} />
                      ) : (
                        <ArrowUpCircle size={24} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {isDeposit ? "Deposit" : "Withdrawal"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(txTimestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        isDeposit ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isDeposit ? "+" : "-"}${txAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{txStatus}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FundManagement;