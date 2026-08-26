"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  Sparkles,
  LogOut,
  Check,
  Lock,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "ai" | "account">("profile");

  const [name, setName] = useState("Santosh Patel");
  const [email, setEmail] = useState("santosh.patel@stmarys.edu");
  const [school, setSchool] = useState("St. Mary's Academy");
  const [department, setDepartment] = useState("Department of Science");

  const [confidenceHigh, setConfidenceHigh] = useState("0.85");
  const [confidenceMedium, setConfidenceMedium] = useState("0.60");
  const [autoGrade, setAutoGrade] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#E2E2E2] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3EE] border border-[#FFCCAA] text-[#FF5500] text-xs font-extrabold uppercase mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Settings & Preferences</span>
          </div>
          <h1 className="text-2xl font-black text-[#21262C]">Account Settings</h1>
          <p className="text-xs text-[#606266] mt-1">
            Manage your teacher profile, AI confidence thresholds, and application preferences.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs border border-red-200 flex items-center gap-2 transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E2E2] pb-2">
        {[
          { key: "profile", label: "Profile", icon: User },
          { key: "ai", label: "AI Mapping Preferences", icon: Sparkles },
          { key: "account", label: "Account & Security", icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                activeTab === tab.key
                  ? "bg-[#FF5500] text-white shadow-2xs"
                  : "bg-white text-[#606266] hover:bg-[#F6F6F6] border border-[#E2E2E2]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Form */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleSave}
          className="bg-white border border-[#E2E2E2] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
        >
          <h2 className="font-extrabold text-base text-[#21262C]">
            Teacher Profile Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#606266] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E2E2] rounded-xl text-xs font-medium text-[#21262C] focus:outline-none focus:border-[#FF5500]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#606266] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E2E2] rounded-xl text-xs font-medium text-[#21262C] focus:outline-none focus:border-[#FF5500]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#606266] mb-1.5">
                School / Institution
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E2E2] rounded-xl text-xs font-medium text-[#21262C] focus:outline-none focus:border-[#FF5500]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#606266] mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E2E2] rounded-xl text-xs font-medium text-[#21262C] focus:outline-none focus:border-[#FF5500]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#F0F0F0]">
            {savedNotice ? (
              <span className="text-xs font-bold text-[#22C55E] flex items-center gap-1">
                <Check className="w-4 h-4" /> Changes saved successfully!
              </span>
            ) : (
              <span className="text-xs text-[#8C8C8C]">
                Last updated today at 11:35 AM
              </span>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#E04A00] text-white font-bold text-xs shadow-xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* AI Preferences Form */}
      {activeTab === "ai" && (
        <form
          onSubmit={handleSave}
          className="bg-white border border-[#E2E2E2] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
        >
          <h2 className="font-extrabold text-base text-[#21262C]">
            AI Mapping & Confidence Thresholds
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#606266] mb-1">
                High Confidence Match Threshold (Default: 0.85)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.5"
                max="0.99"
                value={confidenceHigh}
                onChange={(e) => setConfidenceHigh(e.target.value)}
                className="w-full sm:w-64 px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E2E2] rounded-xl text-xs font-medium text-[#21262C] focus:outline-none focus:border-[#FF5500]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#606266] mb-1">
                Medium Confidence Match Threshold (Default: 0.60)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.3"
                max="0.8"
                value={confidenceMedium}
                onChange={(e) => setConfidenceMedium(e.target.value)}
                className="w-full sm:w-64 px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E2E2] rounded-xl text-xs font-medium text-[#21262C] focus:outline-none focus:border-[#FF5500]"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="autoGrade"
                checked={autoGrade}
                onChange={(e) => setAutoGrade(e.target.checked)}
                className="w-4 h-4 text-[#FF5500] rounded border-[#E2E2E2] focus:ring-[#FF5500]"
              />
              <label htmlFor="autoGrade" className="text-xs font-bold text-[#21262C]">
                Enable Automatic AI Scoring & Constructive Feedback (Optional)
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#F0F0F0]">
            <span className="text-xs text-[#8C8C8C]">
              Configures threshold filters for the hybrid semantic engine
            </span>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#E04A00] text-white font-bold text-xs shadow-xs transition-colors"
            >
              Update Thresholds
            </button>
          </div>
        </form>
      )}

      {/* Account Security */}
      {activeTab === "account" && (
        <div className="bg-white border border-[#E2E2E2] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="font-extrabold text-base text-[#21262C]">
            Account Security & Authentication
          </h2>
          <p className="text-xs text-[#606266]">
            Session type: <span className="font-bold text-[#21262C]">JWT HttpOnly Cookie</span>
          </p>

          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs border border-red-200 flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Active Session & Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
