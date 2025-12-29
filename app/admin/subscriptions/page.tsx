"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  RefreshCw,
  CreditCard,
  DollarSign,
  Pencil,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/hooks/use-toast";
import Unauthorized from "../_components/Unauthorized";

interface Subscription {
  id: number;
  userId: string | null;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  stripeCurrentPeriodEnd: string | null;
  stripeStatus: string;
  plan: string | null;
  credits: number | null;
}

// Pricing plans configuration
const PRICING_PLANS = [
  {
    name: "Free",
    value: "free",
    price: 0,
    credits: 10000,
    features: ["10,000 AI credits/month", "Basic templates", "Email support"],
  },
  {
    name: "Monthly",
    value: "monthly",
    price: 9.99,
    credits: 100000,
    features: [
      "100,000 AI credits/month",
      "All templates",
      "AI Tutors",
      "Priority support",
    ],
  },
  {
    name: "Yearly",
    value: "yearly",
    price: 99.99,
    credits: 1200000,
    features: [
      "1,200,000 AI credits/year",
      "All templates",
      "AI Tutors",
      "Priority support",
      "2 months free",
    ],
  },
];

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [editForm, setEditForm] = useState({
    plan: "",
    credits: 0,
    stripeStatus: "",
    stripeCurrentPeriodEnd: "",
  });
  const [saving, setSaving] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const { toast } = useToast();

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/subscriptions");
      const data = await response.json();
      if (response.status === 401 || response.status === 403 || data.error) {
        setUnauthorized(true);
        setSubscriptions([]);
      } else if (Array.isArray(data)) {
        setSubscriptions(data);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const openEditDialog = (sub: Subscription) => {
    setSelectedSub(sub);
    setEditForm({
      plan: sub.plan || "free",
      credits: sub.credits || 0,
      stripeStatus: sub.stripeStatus || "inactive",
      stripeCurrentPeriodEnd: sub.stripeCurrentPeriodEnd
        ? new Date(sub.stripeCurrentPeriodEnd).toISOString().split("T")[0]
        : "",
    });
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedSub) return;

    setSaving(true);
    try {
      const response = await fetch(
        `/api/admin/subscriptions/${selectedSub.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: editForm.plan,
            credits: editForm.credits,
            stripeStatus: editForm.stripeStatus,
            stripeCurrentPeriodEnd: editForm.stripeCurrentPeriodEnd || null,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subscription updated successfully",
        });
        setIsEditOpen(false);
        setSelectedSub(null);
        fetchSubscriptions();
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.stripeStatus?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = subscriptions.filter(
    (s) => s.stripeStatus === "active"
  ).length;
  const monthlyCount = subscriptions.filter(
    (s) => s.plan === "monthly" && s.stripeStatus === "active"
  ).length;
  const yearlyCount = subscriptions.filter(
    (s) => s.plan === "yearly" && s.stripeStatus === "active"
  ).length;
  const totalRevenue = monthlyCount * 9.99 + yearlyCount * (99.99 / 12);

  if (unauthorized) {
    return <Unauthorized />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Billing & Subscriptions
        </h1>
        <p className="text-gray-500">Manage subscription plans and billing</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Subscriptions</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Plans</p>
              <p className="text-2xl font-bold">{monthlyCount}</p>
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
            <div className="bg-purple-100 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Yearly Plans</p>
              <p className="text-2xl font-bold">{yearlyCount}</p>
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
            <div className="bg-orange-100 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Est. MRR</p>
              <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pricing Overview Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border p-6 mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Pricing Plans</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPricing(!showPricing)}
          >
            {showPricing ? "Hide Details" : "Show Details"}
          </Button>
        </div>

        {showPricing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.value}
                className={`border rounded-lg p-4 ${
                  plan.value === "monthly"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
              >
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-2xl font-bold mt-2">
                  ${plan.price}
                  <span className="text-sm text-gray-500 font-normal">
                    {plan.value === "yearly" ? "/year" : "/month"}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {plan.credits.toLocaleString()} credits
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="text-sm flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border p-6"
      >
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={fetchSubscriptions}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Subscription</DialogTitle>
              <DialogDescription>
                Manually adjust subscription details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-plan">Plan</Label>
                <Select
                  value={editForm.plan}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, plan: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="monthly">Monthly ($9.99)</SelectItem>
                    <SelectItem value="yearly">Yearly ($99.99)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-credits">Credits</Label>
                <Input
                  id="edit-credits"
                  type="number"
                  value={editForm.credits}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      credits: parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.stripeStatus}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, stripeStatus: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-period-end">Period End Date</Label>
                <Input
                  id="edit-period-end"
                  type="date"
                  value={editForm.stripeCurrentPeriodEnd}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      stripeCurrentPeriodEnd: e.target.value,
                    })
                  }
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedSub(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEdit}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Period End</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.id}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {sub.userId?.slice(0, 15)}...
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sub.plan === "monthly" || sub.plan === "yearly"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            sub.plan === "yearly" ? "bg-purple-500" : ""
                          }
                        >
                          {sub.plan || "Free"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sub.stripeStatus === "active"
                              ? "default"
                              : sub.stripeStatus === "canceled"
                              ? "destructive"
                              : "secondary"
                          }
                          className={
                            sub.stripeStatus === "active" ? "bg-green-500" : ""
                          }
                        >
                          {sub.stripeStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(sub.credits ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {sub.stripeCurrentPeriodEnd
                          ? new Date(
                              sub.stripeCurrentPeriodEnd
                            ).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(sub)}
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default SubscriptionsPage;
