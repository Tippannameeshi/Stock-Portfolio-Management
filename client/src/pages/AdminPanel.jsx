import React, { useState, useEffect } from "react";
import { UserCheck, UserX, PlusCircle } from "lucide-react";
import { api } from "../services/apiService";
import { useAuth } from "../contexts/AuthContext";

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("reactivations");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stock form
  const [stockForm, setStockForm] = useState({
    tickerSymbol: "",
    companyName: "",
    currentPrice: "",
    industry: "",
    logoUrl: "",
  });

  useEffect(() => {
    if (activeTab === "reactivations") {
      loadPendingUsers();
    } else if (activeTab === "users") {
      loadAllUsers();
    }
  }, [activeTab]);

  const loadPendingUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getPendingReactivations();
      setPendingUsers(data.data || []);
    } catch (error) {
      console.error("Failed to load pending users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAllUsers({
        status: "ACTIVE",
        page: 1,
        limit: 50,
      });
      setAllUsers(data.data || []);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.updateUserStatus(userId, newStatus);
      alert(`User status updated to ${newStatus}`);

      // Reload data
      if (activeTab === "reactivations") {
        loadPendingUsers();
      } else {
        loadAllUsers();
      }
    } catch (error) {
      alert("Failed to update user status: " + error.message);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      await api.addStock(stockForm);
      alert("Stock added successfully!");
      setStockForm({
        tickerSymbol: "",
        companyName: "",
        currentPrice: "",
        industry: "",
        logoUrl: "",
      });
    } catch (error) {
      alert("Failed to add stock: " + error.message);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-800 font-semibold">Access Denied</p>
          <p className="text-red-600 mt-2">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h2>
        <p className="text-gray-600">Manage users and stocks</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("reactivations")}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === "reactivations"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Reactivation Requests
          {pendingUsers.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {pendingUsers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === "users"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          All Users
        </button>
        <button
          onClick={() => setActiveTab("stocks")}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === "stocks"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Manage Stocks
        </button>
      </div>

      {/* Reactivation Requests Tab */}
      {activeTab === "reactivations" && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Pending Reactivation Requests
          </h3>

          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No pending reactivation requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Cash Balance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Requested
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingUsers.map((user) => (
                    <tr key={user.userid} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        ${parseFloat(user.cashbalance).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(user.createdat).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            handleStatusChange(user.userid, "ACTIVE")
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        >
                          Reactivate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* All Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">All Users</h3>

          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Cash Balance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allUsers.map((userData) => (
                    <tr key={userData.userid} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                        {userData.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {userData.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            userData.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {userData.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            userData.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : userData.status === "SUSPENDED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {userData.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        ${parseFloat(userData.cashbalance).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          {userData.status === "ACTIVE" &&
                            userData.userid !== user.id && (
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    userData.userid,
                                    "SUSPENDED"
                                  )
                                }
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                              >
                                Suspend
                              </button>
                            )}
                          {userData.status === "SUSPENDED" && (
                            <button
                              onClick={() =>
                                handleStatusChange(userData.userid, "ACTIVE")
                              }
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            >
                              Activate
                            </button>
                          )}
                          {userData.status === "INACTIVE" && (
                            <button
                              onClick={() =>
                                handleStatusChange(userData.userid, "ACTIVE")
                              }
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Manage Stocks Tab */}
      {activeTab === "stocks" && (
        <div className="space-y-6">
          {/* Add Stock Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <PlusCircle className="mr-2" size={24} />
              Add New Stock
            </h3>

            <form onSubmit={handleAddStock} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ticker Symbol
                  </label>
                  <input
                    type="text"
                    required
                    value={stockForm.tickerSymbol}
                    onChange={(e) =>
                      setStockForm({
                        ...stockForm,
                        tickerSymbol: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="AAPL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={stockForm.companyName}
                    onChange={(e) =>
                      setStockForm({
                        ...stockForm,
                        companyName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Apple Inc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Initial Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={stockForm.currentPrice}
                    onChange={(e) =>
                      setStockForm({
                        ...stockForm,
                        currentPrice: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="150.00"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    required
                    value={stockForm.industry}
                    onChange={(e) =>
                      setStockForm({
                        ...stockForm,
                        industry: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Technology"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Logo Url
                  </label>
                  <input
                    type="text"
                    required
                    value={stockForm.logoUrl}
                    onChange={(e) =>
                      setStockForm({
                        ...stockForm,
                        logoUrl: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Paste the Company's Logo Url"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg"
              >
                Add Stock
              </button>
            </form>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-blue-900 mb-2">
              Stock Management Tips
            </h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Use uppercase ticker symbols (e.g., AAPL, GOOGL)</li>
              <li>• Set accurate initial prices for better user experience</li>
              <li>• Cannot delete stocks that have existing trades</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
