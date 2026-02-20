"use client";

import { bulkDeleteTransactions } from '@/actions/accounts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { categoryColors } from '@/data/categories';
import useFetch from '@/hooks/use-fetch';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight, ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCw, Search, Trash, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

const TransactionTable = ({ transactions }) => {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ field: "date", direction: "desc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((t) => t.description?.toLowerCase().includes(lower) || t.category?.toLowerCase().includes(lower));
    }
    if (typeFilter) result = result.filter((t) => t.type === typeFilter);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortConfig.field === "date") cmp = new Date(a.date) - new Date(b.date);
      else if (sortConfig.field === "amount") cmp = a.amount - b.amount;
      else if (sortConfig.field === "category") cmp = a.category.localeCompare(b.category);
      return sortConfig.direction === "asc" ? cmp : -cmp;
    });
    return result;
  }, [transactions, searchTerm, typeFilter, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE));
  const paginatedTransactions = filteredAndSortedTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field) => {
    setSortConfig((c) => ({ field, direction: c.field === field && c.direction === "asc" ? "desc" : "asc" }));
  };

  const handleSelect = (id) => {
    setSelectedIds((c) => c.includes(id) ? c.filter((i) => i !== id) : [...c, id]);
  };

  const handleSelectAll = () => {
    setSelectedIds((c) =>
      c.length === filteredAndSortedTransactions.length ? [] : filteredAndSortedTransactions.map((t) => t.id)
    );
  };

  const { loading: deleteLoading, fn: deleteFn, data: deleted } = useFetch(bulkDeleteTransactions);

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} transaction(s)? This cannot be undone.`)) return;
    deleteFn(selectedIds);
  };

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.success("Transactions deleted");
      setSelectedIds([]);
    }
  }, [deleted, deleteLoading]);

  const handleClearFilters = () => { setSearchTerm(""); setTypeFilter(""); setCurrentPage(1); };

  const SortIcon = ({ field }) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === "asc"
      ? <ChevronUp className="ml-1 h-3.5 w-3.5 text-purple-500" />
      : <ChevronDown className="ml-1 h-3.5 w-3.5 text-purple-500" />;
  };

  return (
    <div className="space-y-3">
      {/* Progress bar during delete */}
      {deleteLoading && (
        <div className="h-0.5 w-full rounded-full overflow-hidden bg-muted">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-[shimmer_1.5s_infinite] w-1/2" />
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by description or category..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10 h-11 text-sm rounded-xl border-border/60 bg-white/50 dark:bg-slate-900/50 focus-visible:ring-purple-500/30"
          />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v === "ALL" ? "" : v); setCurrentPage(1); }}>
            <SelectTrigger className="h-11 w-[130px] text-sm rounded-xl border-border/60 bg-white/50 dark:bg-slate-900/50 font-medium">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/60">
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || typeFilter) && (
            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800" onClick={handleClearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}

          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              className="h-11 px-4 rounded-xl flex items-center gap-2 font-semibold shadow-sm"
              onClick={handleBulkDelete}
              disabled={deleteLoading}
            >
              <Trash className="h-4 w-4" />
              Delete ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 dark:bg-slate-800/60 hover:bg-muted/40 dark:hover:bg-slate-800/60 border-b border-border/50 dark:border-slate-700/50">
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={selectedIds.length === filteredAndSortedTransactions.length && filteredAndSortedTransactions.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => handleSort("date")}>
                <div className="flex items-center"><span>Date</span><SortIcon field="date" /></div>
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</TableHead>
              <TableHead className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors hidden sm:table-cell" onClick={() => handleSort("category")}>
                <div className="flex items-center"><span>Category</span><SortIcon field="category" /></div>
              </TableHead>
              <TableHead className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors text-right" onClick={() => handleSort("amount")}>
                <div className="flex items-center justify-end"><span>Amount</span><SortIcon field="amount" /></div>
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Search className="h-10 w-10 opacity-20 text-purple-500" />
                    <p className="text-base font-medium">No transactions found</p>
                    {(searchTerm || typeFilter) && (
                      <button onClick={handleClearFilters} className="text-sm text-purple-500 hover:text-purple-600 font-semibold hover:underline transition-all">Clear active filters</button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((t) => (
                <TableRow
                  key={t.id}
                  className={cn(
                    "border-b border-border/30 dark:border-slate-700/40 transition-colors duration-200",
                    "hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-default",
                    selectedIds.includes(t.id) && "bg-purple-50/60 dark:bg-purple-900/10"
                  )}
                >
                  <TableCell className="pl-4">
                    <Checkbox checked={selectedIds.includes(t.id)} onCheckedChange={() => handleSelect(t.id)} />
                  </TableCell>
                  <TableCell className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                    {format(new Date(t.date), "MMM d, yyyy")}
                    {t.isRecurring && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <RefreshCw className="h-3 w-3 text-indigo-400" />
                        <span className="text-[10px] font-bold tracking-wider text-indigo-500 uppercase">{t.recurringInterval}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-semibold text-foreground dark:text-white truncate max-w-[160px] sm:max-w-[280px]">
                      {t.description || <span className="text-muted-foreground italic font-normal text-xs">No description</span>}
                    </p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {t.category && (
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-sm tracking-wide lowercase"
                        style={{ backgroundColor: categoryColors[t.category] || "#6366f1" }}
                      >
                        {t.category}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={cn(
                      "inline-flex flex-col items-end gap-0.5",
                      t.type === "EXPENSE" ? "text-foreground dark:text-white" : "text-emerald-600 dark:text-emerald-400"
                    )}>
                      <span className="font-bold tabular-nums text-sm">
                        {t.type === "EXPENSE" ? "-" : "+"}
                        ${t.amount.toFixed(2)}
                      </span>
                      {/* Indicator pill */}
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest",
                        t.type === "EXPENSE" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      )}>
                        {t.type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 rounded-xl border-border/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
                        <DropdownMenuItem className="rounded-lg text-sm cursor-pointer font-medium" onClick={() => router.push(`/transaction/create?edit=${t.id}`)}>
                          Edit Transaction
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem className="rounded-lg text-sm font-semibold text-rose-600 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-900/20 cursor-pointer" onClick={() => deleteFn([t.id])}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedTransactions.length)} of {filteredAndSortedTransactions.length}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-7 px-3 text-xs rounded-lg" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage <= 3 ? i + 1 : currentPage > totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
              if (page < 1 || page > totalPages) return null;
              return (
                <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm"
                  className={cn("h-7 w-7 p-0 text-xs rounded-lg", currentPage === page && "bg-purple-600 hover:bg-purple-700 border-0")}
                  onClick={() => setCurrentPage(page)}>
                  {page}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" className="h-7 px-3 text-xs rounded-lg" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;