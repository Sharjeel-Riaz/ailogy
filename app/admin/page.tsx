"use client";
import React, { useEffect, useState } from "react";
import {
  Users,
  FileText,
  BookOpen,
  CreditCard,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import StatsCard from "./_components/StatsCard";
import RecentActivity from "./_components/RecentActivity";
import Unauthorized from "./_components/Unauthorized";

interface Stats {
  totalUsers: number;
  totalAiOutputs: number;
  totalTutors: number;
  totalSubscriptions: number;
  totalMessages: number;
  activeSubscriptions: number;
}

function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAiOutputs: 0,
    totalTutors: 0,
    totalSubscriptions: 0,
    totalMessages: 0,
    activeSubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        const data = await response.json();
        if (response.status === 401 || response.status === 403 || data.error) {
          setUnauthorized(true);
        } else {
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      trend: { value: 12, isPositive: true },
    },
    {
      title: "AI Outputs",
      value: stats.totalAiOutputs,
      icon: FileText,
      color: "bg-green-500",
      trend: { value: 8, isPositive: true },
    },
    {
      title: "Total Tutors",
      value: stats.totalTutors,
      icon: BookOpen,
      color: "bg-purple-500",
      trend: { value: 5, isPositive: true },
    },
    {
      title: "Active Subscriptions",
      value: stats.activeSubscriptions,
      icon: CreditCard,
      color: "bg-orange-500",
      trend: { value: 3, isPositive: true },
    },
    {
      title: "Total Messages",
      value: stats.totalMessages,
      icon: MessageSquare,
      color: "bg-pink-500",
      trend: { value: 15, isPositive: true },
    },
    {
      title: "Total Subscriptions",
      value: stats.totalSubscriptions,
      icon: TrendingUp,
      color: "bg-cyan-500",
      trend: { value: 2, isPositive: false },
    },
  ];

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
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome to the admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statsCards.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}

export default AdminDashboard;
