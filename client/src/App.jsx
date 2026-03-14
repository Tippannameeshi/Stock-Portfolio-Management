import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Topbar from "./components/Layout/Topbar";
import Sidebar from "./components/Layout/Sidebar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Market from "./pages/Market";
import StockDetail from "./pages/StockDetail";
import FundManagement from "./pages/FundManagement";
import Watchlist from "./pages/Watchlist";
import TradeHistory from "./pages/TradeHistory";
import AdminPanel from "./pages/AdminPanel";

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState("login");
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedStockId, setSelectedStockId] = useState(null);

  const handleStockSelect = (stockId) => {
    setSelectedStockId(stockId);
    setCurrentPage("stockDetail");
  };

  const handleBackToMarket = () => {
    setSelectedStockId(null);
    setCurrentPage("market");
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSelectedStockId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl font-bold text-white">T</span>
          </div>
          <p className="text-xl text-gray-600">Loading TradePro...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authView === "register") {
      return <Register onNavigateToLogin={() => setAuthView("login")} />;
    }
    return <Login onNavigateToRegister={() => setAuthView("register")} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar onNavigate={handleNavigate} />
      <div className="flex">
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
        <main className="flex-1 overflow-auto">
          {currentPage === "dashboard" && <Dashboard />}
          {currentPage === "market" && (
            <Market onStockSelect={handleStockSelect} />
          )}
          {currentPage === "stockDetail" && (
            <StockDetail
              stockId={selectedStockId}
              onBack={handleBackToMarket}
            />
          )}
          {currentPage === "funds" && <FundManagement />}
          {currentPage === "watchlist" && (
            <Watchlist onStockSelect={handleStockSelect} />
          )}
          {currentPage === "history" && <TradeHistory />}
          {currentPage === "admin" && <AdminPanel />}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
