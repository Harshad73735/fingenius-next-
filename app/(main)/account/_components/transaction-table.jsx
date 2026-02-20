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
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by description or category..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-9 h-9 text-sm rounded-lg border-border/60 dark:border-slate-700 focus-visible:ring-purple-500/30"
          />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v === "ALL" ? "" : v); setCurrentPage(1); }}>
            <SelectTrigger className="h-9 w-[120px] text-xs rounded-lg border-border/60 dark:border-slate-700">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || typeFilter) && (
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground" onClick={handleClearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}

          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium"
              onClick={handleBulkDelete}
              disabled={deleteLoading}
            >
              <Trash className="h-3.5 w-3.5" />
              Delete ({selectedIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 dark:border-slate-700/50 overflow-hidden shadow-sm">
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
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Search className="h-8 w-8 opacity-20" />
                    <p className="text-sm font-medium">No transactions found</p>
                    {(searchTerm || typeFilter) && (
                      <button onClick={handleClearFilters} className="text-xs text-purple-500 hover:underline mt-1">Clear filters</button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((t) => (
                <TableRow
                  key={t.id}
                  className={cn(
                    "border-b border-border/30 dark:border-slate-700/40 transition-colors duration-150",
                    "hover:bg-muted/30 dark:hover:bg-slate-800/40",
                    selectedIds.includes(t.id) && "bg-purple-50/60 dark:bg-purple-900/10"
                  )}
                >
                  <TableCell className="pl-4">
                    <Checkbox checked={selectedIds.includes(t.id)} onCheckedChange={() => handleSelect(t.id)} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(t.date), "MMM d, yyyy")}
                    {t.isRecurring && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <RefreshCw className="h-3 w-3 text-blue-400" />
                        <span className="text-[10px] text-blue-500 capitalize">{t.recurringInterval?.toLowerCase()}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground dark:text-white truncate max-w-[160px] sm:max-w-[240px]">
                      {t.description || <span className="text-muted-foreground italic text-xs">No description</span>}
                    </p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {t.category && (
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: categoryColors[t.category] || "#6366f1" }}
                      >
                        {t.category}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={cn(
                      "inline-flex items-center gap-0.5 font-semibold text-sm tabular-nums",
                      t.type === "EXPENSE" ? "text-rose-500 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                    )}>
                      {t.type === "EXPENSE"
                        ? <ArrowDownRight className="h-3.5 w-3.5" />
                        : <ArrowUpRight className="h-3.5 w-3.5" />}
                      ${t.amount.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-muted">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 rounded-xl">
                        <DropdownMenuItem className="rounded-lg text-sm cursor-pointer" onClick={() => router.push(`/transaction/create?edit=${t.id}`)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="rounded-lg text-sm text-destructive focus:text-destructive cursor-pointer" onClick={() => deleteFn([t.id])}>
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