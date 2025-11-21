"use client";

import React, { useEffect, useState } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SummaryCard } from "@/components/SummaryCard";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface DashboardSummary {
  totalUsers: number;
  totalWalletBalance: number | string;
  totalTransfers: number;
  totalWithdrawals: number;
}

interface DashboardTransactionUser {
  id: string;
  name: string | null;
  email: string;
}

interface DashboardTransaction {
  id: string;
  transactionType: "DEPOSIT" | "TRANSFER" | "WITHDRAWAL";
  status: string;
  amount: number | string;
  currency: string;
  fromUser?: DashboardTransactionUser | null;
  toUser?: DashboardTransactionUser | null;
  createdAt: string;
}

interface DashboardActivityItem {
  id: string;
  transactionId: string | null;
  action: string;
  oldBalance?: number | string | null;
  newBalance?: number | string | null;
  userId?: string | null;
  createdAt: string;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

function formatCurrency(amount: number | string, currency = "USD") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return "-";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(num);
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [transactions, setTransactions] = useState<DashboardTransaction[]>(
    [],
  );
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  const [activity, setActivity] = useState<DashboardActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // Filters & pagination
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [userFilter, setUserFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setSummaryLoading(true);
        const res = await fetch(`${API_BASE}/dashboard/summary`);
        const json: ApiResponse<DashboardSummary> = await res.json();
        setSummary(json.data);
      } catch (err) {
        console.error("Failed to load dashboard summary", err);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setTransactionsLoading(true);
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
        if (typeFilter) params.set("type", typeFilter);
        if (userFilter) params.set("userId", userFilter.trim());
        if (fromDate) params.set("from", fromDate);
        if (toDate) params.set("to", toDate);

        const res = await fetch(
          `${API_BASE}/dashboard/transactions?${params.toString()}`,
        );
        const json: ApiResponse<{
          items: DashboardTransaction[];
          page: number;
          pageSize: number;
          total: number;
        }> = await res.json();

        setTransactions(json.data.items || []);
        setTransactionsTotal(json.data.total || 0);
      } catch (err) {
        console.error("Failed to load transactions", err);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [page, typeFilter, userFilter, fromDate, toDate]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setActivityLoading(true);
        const res = await fetch(`${API_BASE}/dashboard/activity?limit=20`);
        const json: ApiResponse<DashboardActivityItem[]> = await res.json();
        setActivity(json.data || []);
      } catch (err) {
        console.error("Failed to load activity", err);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const totalPages = Math.max(1, Math.ceil(transactionsTotal / pageSize));

  return (

    <SidebarInset>
      <header className="flex items-center justify-between border-b bg-background px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            System Overview
          </h1>
          <p className="text-xs text-muted-foreground">
            Real-time view of users, wallets, and money movement across the
            platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-xs">
            Export CSV
          </Button>
          <Button className="text-xs font-semibold">
            New Test Flow
          </Button>
        </div>
      </header>

      <main className="flex-1 space-y-6 bg-muted/40 px-6 py-6">
        {/* System Summary */}
        <section className="grid gap-4 md:grid-cols-4">
          <SummaryCard
            title="Total users"
            value={summary?.totalUsers ?? 0}
            loading={summaryLoading}
            subtitle="Across all micro-savers"
          />
          <SummaryCard
            title="Total value in wallets"
            value={summary?.totalWalletBalance ?? 0}
            loading={summaryLoading}
            format="currency"
            subtitle="Aggregate wallet balance"
          />
          <SummaryCard
            title="Total transfers"
            value={summary?.totalTransfers ?? 0}
            loading={summaryLoading}
            subtitle="Internal money movements"
          />
          <SummaryCard
            title="Total withdrawals"
            value={summary?.totalWithdrawals ?? 0}
            loading={summaryLoading}
            subtitle="Cash-outs to external rails"
          />
        </section>

        {/* Transactions + Activity */}
        <section className="grid gap-6 lg:grid-cols-[2.2fr,1fr]">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-black-50">
                  Transactions
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Engine-level view of deposits, transfers, and withdrawals.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setPage(1);
                    setTypeFilter(e.target.value);
                  }}
                  className="h-8 rounded-md border border-slate-700 bg-gray-650 px-2 text-[11px] text-slate-900 shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-gray-500"
                >
                  <option value="">All types</option>
                  <option value="DEPOSIT">Deposits</option>
                  <option value="TRANSFER">Transfers</option>
                  <option value="WITHDRAWAL">Withdrawals</option>
                </select>
                <Input
                  placeholder="Filter by user id"
                  value={userFilter}
                  onChange={(e) => {
                    setPage(1);
                    setUserFilter(e.target.value);
                  }}
                  className="h-8 w-32 border-slate-50 bg-slate-50 text-[11px]"
                />
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setPage(1);
                    setFromDate(e.target.value);
                  }}
                  className="h-8 w-32 border-slate-50 bg-slate-50 text-[11px]"
                />
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setPage(1);
                    setToDate(e.target.value);
                  }}
                  className="h-8 w-32 border-slate-50 bg-slate-50 text-[11px]"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-slate-50 bg-slate-50/40">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>User(s)</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-6 text-center text-xs text-slate-400">
                          Loading transactions...
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-6 text-center text-xs text-slate-500">
                          No transactions match the current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((tx) => {
                        const primaryUser = tx.toUser || tx.fromUser;
                        const secondaryUser =
                          tx.transactionType === "TRANSFER"
                            ? tx.fromUser && tx.toUser
                              ? `${tx.fromUser.name || tx.fromUser.email} → ${tx.toUser.name || tx.toUser.email
                              }`
                              : null
                            : null;

                        return (
                          <TableRow key={tx.id}>
                            <TableCell className="max-w-[120px] truncate text-xs text-slate-400">
                              {tx.id}
                            </TableCell>
                            <TableCell className="text-[11px] font-medium uppercase tracking-wide text-slate-100">
                              {tx.transactionType}
                            </TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                  tx.status === "COMPLETED" &&
                                  "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/40",
                                  tx.status === "PENDING" &&
                                  "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/40",
                                  tx.status === "FAILED" &&
                                  "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/40",
                                )}
                              >
                                {tx.status}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-[180px] text-xs text-slate-200">
                              {secondaryUser ? (
                                <>
                                  <div>{secondaryUser}</div>
                                  {primaryUser && (
                                    <div className="text-[10px] text-slate-500">
                                      {primaryUser.email}
                                    </div>
                                  )}
                                </>
                              ) : primaryUser ? (
                                <>
                                  <div>{primaryUser.name || primaryUser.email}</div>
                                  <div className="text-[10px] text-slate-500">
                                    {primaryUser.email}
                                  </div>
                                </>
                              ) : (
                                <span className="text-[10px] text-slate-500">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-xs font-semibold text-slate-50">
                              {formatCurrency(tx.amount, tx.currency)}
                            </TableCell>
                            <TableCell className="text-xs text-slate-400">
                              {formatDate(tx.createdAt)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                <div>
                  Page {page} of {totalPages} • {transactionsTotal} records
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-7 border-slate-700 bg-slate-900 px-2 text-[11px] disabled:opacity-40"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="h-7 border-slate-700 bg-slate-900 px-2 text-[11px] disabled:opacity-40"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Recent Activity
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Ledger movements and balance changes from the audit log.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-xs">
                {activityLoading ? (
                  <div className="py-4 text-center text-muted-foreground">
                    Loading activity...
                  </div>
                ) : activity.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground">
                    No recent activity.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {activity.map((item) => (
                      <li key={item.id} className="flex gap-2">
                        <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-100">
                              {item.action}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                          {item.transactionId && (
                            <div className="text-[10px] text-slate-500">
                              Tx: {item.transactionId}
                            </div>
                          )}
                          {typeof item.newBalance !== "undefined" && (
                            <div className="text-[10px] text-emerald-300">
                              New balance: {formatCurrency(item.newBalance || 0)}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </SidebarInset>

  );
}
