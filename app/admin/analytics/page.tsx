"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  MessageSquare,
  BookOpen,
  UserCheck,
  CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";
import StatsCard from "../_components/StatsCard";
import Unauthorized from "../_components/Unauthorized";

interface AnalyticsData {
  dailyOutputs: { date: string; count: number }[];
  templateUsage: { template: string; count: number }[];
  userGrowth: { date: string; count: number }[];
  overview: {
    totalUsers: number;
    activeSubscriptions: number;
    totalTutors: number;
    totalMessages: number;
    userMessages: number;
    totalAiOutputs: number;
    monthlyRevenue: number;
    activeUsers: number;
  };
  subscriptionBreakdown: {
    free: number;
    monthly: number;
    yearly: number;
    active: number;
    inactive: number;
    canceled: number;
  };
}

function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/analytics");
        const result = await response.json();
        if (
          response.status === 401 ||
          response.status === 403 ||
          result.error
        ) {
          setUnauthorized(true);
        } else {
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (unauthorized) {
    return <Unauthorized />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Analytics Dashboard
        </h1>
        <p className="text-gray-500">Platform usage and statistics overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Signups"
          value={data?.overview?.totalUsers || 0}
          icon={Users}
          color="bg-blue-500"
        />
        <StatsCard
          title="Active Users"
          value={data?.overview?.activeUsers || 0}
          icon={UserCheck}
          color="bg-green-500"
        />
        <StatsCard
          title="Monthly Revenue"
          value={data?.overview?.monthlyRevenue || 0}
          icon={DollarSign}
          color="bg-orange-500"
        />
        <StatsCard
          title="Active Subscriptions"
          value={data?.overview?.activeSubscriptions || 0}
          icon={CreditCard}
          color="bg-purple-500"
        />
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="bg-cyan-100 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">AI Outputs Generated</p>
              <p className="text-2xl font-bold">
                {(data?.overview?.totalAiOutputs || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="bg-pink-100 p-2 rounded-lg">
              <MessageSquare className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tutor Conversations</p>
              <p className="text-2xl font-bold">
                {(data?.overview?.userMessages || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Tutors</p>
              <p className="text-2xl font-bold">
                {data?.overview?.totalTutors || 0}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subscription Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border p-6 mb-6"
      >
        <h2 className="text-lg font-semibold mb-4">Subscription Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-600">
              {data?.subscriptionBreakdown?.free || 0}
            </p>
            <p className="text-sm text-gray-500">Free</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {data?.subscriptionBreakdown?.monthly || 0}
            </p>
            <p className="text-sm text-gray-500">Monthly</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {data?.subscriptionBreakdown?.yearly || 0}
            </p>
            <p className="text-sm text-gray-500">Yearly</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {data?.subscriptionBreakdown?.active || 0}
            </p>
            <p className="text-sm text-gray-500">Active</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {data?.subscriptionBreakdown?.inactive || 0}
            </p>
            <p className="text-sm text-gray-500">Inactive</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {data?.subscriptionBreakdown?.canceled || 0}
            </p>
            <p className="text-sm text-gray-500">Canceled</p>
          </div>
        </div>
      </motion.div>

      {/* Template Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border p-6 mb-6"
      >
        <h2 className="text-lg font-semibold mb-4">Template Usage</h2>
        {data?.templateUsage && data.templateUsage.length > 0 ? (
          <div className="space-y-4">
            {data.templateUsage.slice(0, 10).map((item, index) => (
              <div key={item.template} className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.template}</span>
                    <span className="text-sm text-gray-500">
                      {item.count} uses
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (item.count / data.templateUsage[0].count) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No data available</p>
        )}
      </motion.div>

      {/* Daily Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border p-6"
      >
        <h2 className="text-lg font-semibold mb-4">
          Daily Activity (Last 7 Days)
        </h2>
        {data?.dailyOutputs && data.dailyOutputs.length > 0 ? (
          <div className="grid grid-cols-7 gap-2">
            {data.dailyOutputs.slice(0, 7).map((day) => (
              <div key={day.date} className="text-center">
                <div
                  className="bg-red-100 rounded-lg mx-auto mb-2 flex items-end justify-center"
                  style={{
                    height: "100px",
                    width: "40px",
                  }}
                >
                  <div
                    className="bg-red-600 rounded-lg w-full transition-all"
                    style={{
                      height: `${Math.min(
                        (day.count /
                          Math.max(...data.dailyOutputs.map((d) => d.count))) *
                          100,
                        100
                      )}%`,
                      minHeight: day.count > 0 ? "10px" : "0",
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500">{day.date}</p>
                <p className="text-sm font-medium">{day.count}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No data available</p>
        )}
      </motion.div>
    </div>
  );
}

export default AnalyticsPage;
