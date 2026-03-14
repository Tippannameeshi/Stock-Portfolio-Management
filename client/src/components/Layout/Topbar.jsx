import React, { useEffect, useState, useRef } from "react";
import { LogOut, BarChart3, ChevronDown, Trash2, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/apiService";

const Topbar = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [cashBalance, setCashBalance] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleDeactivateAccount = async () => {
    setIsDeleting(true);
    try {
      // Call your API to set user status to inactive
      const res = await api.deactivateAccount();

      if (res.success === false) {
        alert(res.error);
      } else {
        // Show success message
        alert("Your account has been deactivated successfully.");

        // Logout and redirect
        logout();
      }
    } catch (err) {
      console.error("Failed to deactivate account:", err);
      alert("Failed to deactivate account. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Call your API to delete account
      const response = await api.deleteAccount();

      console.log("Full response:", response); // Debug log

      // Extract the actual data (API responses are usually wrapped)
      const res = response.data || response;

      console.log("Extracted data:", res); // Debug log

      if (res.success === false || !res.success) {
        alert(res.error || "Failed to delete account");
      } else {
        // Show success message
        alert(res.message || "Your account has been deleted successfully.");

        // Logout and redirect
        logout();
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
      alert(err.message || "Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <header className="bg-white shadow-md px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate("dashboard")}
          >
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TradePro
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-semibold text-gray-800">{user?.name}</p>
            </div>
            <div className="bg-linear-to-br from-green-50 to-emerald-50 px-4 py-2 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 mb-0.5">Cash Balance</p>
              <p className="text-lg font-bold text-green-800">${cashBalance}</p>
            </div>

            {/* User Menu Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 border border-gray-300"
              >
                <User size={18} />
                <span className="font-medium">Account</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} />
                    <span>Delete Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Delete Account
              </h2>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? Or you can try
              deacivating your account instead.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-yellow-800">
                Deleting you account will remove all your data
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? "deactivating..." : "Deactivate Account"}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? "deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;
