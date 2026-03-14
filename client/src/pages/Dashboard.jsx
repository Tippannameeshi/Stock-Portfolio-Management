import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { dashboardData } = useAuth();

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const { portfolioSummary, holdings, allocation } = dashboardData;
  const COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">Overview of your portfolio performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm mb-1">Total Portfolio Value</p>
          <p className="text-3xl font-bold">
            ${portfolioSummary.totalPortfolioValue?.toFixed(2)}
          </p>
        </div>

        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <p className="text-purple-100 text-sm mb-1">Total Investments</p>
          <p className="text-3xl font-bold">
            ${portfolioSummary.totalInvestments?.toFixed(2)}
          </p>
        </div>

        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm mb-1">Cash Balance</p>
          <p className="text-3xl font-bold">
            ${portfolioSummary.cashBalance?.toFixed(2)}
          </p>
        </div>

        <div
          className={`rounded-2xl shadow-lg p-6 text-white ${
            portfolioSummary.totalUnrealizedPL >= 0
              ? "bg-linear-to-br from-emerald-500 to-emerald-600"
              : "bg-linear-to-br from-red-500 to-red-600"
          }`}
        >
          <p className="text-white/90 text-sm mb-1">Unrealized P/L</p>
          <p className="text-3xl font-bold">
            ${portfolioSummary.totalUnrealizedPL?.toFixed(2)}
          </p>
          <p className="text-sm mt-1">
            {portfolioSummary.unrealizedPLPercent?.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Holdings and Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Holdings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Your Holdings
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {holdings && holdings.length > 0 ? (
              holdings.map((holding, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div>
                    <p className="font-bold text-gray-800">{holding.ticker}</p>
                    <p className="text-sm text-gray-600">
                      {holding.shares} shares
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      ${holding.marketValue?.toFixed(2)}
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        holding.unrealizedPL >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {holding.unrealizedPL >= 0 ? "+" : ""}$
                      {holding.unrealizedPL?.toFixed(2)}(
                      {holding.unrealizedPLPercent}%)
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No holdings yet. Start trading to build your portfolio!
              </p>
            )}
          </div>
        </div>

        {/* Allocation */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Portfolio Allocation
          </h3>
          {allocation && allocation.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={allocation}
                  dataKey="value"
                  nameKey="ticker"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.ticker} ${entry.Percentage}%`}
                >
                  {allocation.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No allocation data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
