'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt, Plus, Trash2, ChevronDown,
  Plane, Hotel, Utensils, Bus, Ticket, ShoppingBag, MoreHorizontal,
  DollarSign, TrendingUp, PieChart
} from 'lucide-react';
import {
  getTrips, getExpenses, getExpensesByTrip, saveExpense, deleteExpense,
  Expense, SavedTrip, generateId
} from '@/lib/trips';

const EXPENSE_CATEGORIES = [
  { label: 'Flights', icon: Plane },
  { label: 'Accommodation', icon: Hotel },
  { label: 'Food & Drinks', icon: Utensils },
  { label: 'Transport', icon: Bus },
  { label: 'Activities', icon: Ticket },
  { label: 'Shopping', icon: ShoppingBag },
  { label: 'Other', icon: MoreHorizontal },
];

export default function ExpenseTrackerPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [category, setCategory] = useState('Food & Drinks');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [paidBy, setPaidBy] = useState('');

  useEffect(() => {
    setMounted(true);
    getTrips().then((all) => {
      setTrips(all);
      if (all.length > 0) {
        setSelectedTripId(all[0].id);
        getExpensesByTrip(all[0].id).then(setExpenses);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      getExpensesByTrip(selectedTripId).then(setExpenses);
    }
  }, [selectedTripId]);

  const handleAddExpense = async () => {
    if (!description.trim() || !amount || !selectedTripId) return;
    const newExpense: Expense = {
      id: generateId(),
      tripId: selectedTripId,
      category,
      description: description.trim(),
      amount: parseFloat(amount),
      currency: 'INR',
      date: date || new Date().toISOString().split('T')[0],
      paidBy: paidBy.trim() || 'Me',
    };
    await saveExpense(newExpense);
    const updated = await getExpensesByTrip(selectedTripId);
    setExpenses(updated);
    setDescription('');
    setAmount('');
    setPaidBy('');
    setShowForm(false);
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id);
    const updated = await getExpensesByTrip(selectedTripId);
    setExpenses(updated);
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const selectedTrip = trips.find((t) => t.id === selectedTripId);
  const budgetNum = selectedTrip?.budget ? parseFloat(selectedTrip.budget.replace(/[^0-9.]/g, '')) || 0 : 0;

  // Category breakdown
  const categoryTotals = EXPENSE_CATEGORIES.map((cat) => ({
    ...cat,
    total: expenses.filter((e) => e.category === cat.label).reduce((sum, e) => sum + e.amount, 0),
  })).filter((c) => c.total > 0);

  if (!mounted) return null;

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Expense Tracker</h1>
        </div>
        <p className="text-muted-foreground text-sm">Track spending across your trips and stay within budget.</p>
      </motion.div>

      {trips.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center">
          <Receipt className="w-10 h-10 text-faint-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">No trips yet</h2>
          <p className="text-muted-foreground text-sm">Create a trip first to start tracking expenses.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Trip selector */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="relative">
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer pr-10"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.destination} — {t.dates}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Spent</span>
              </div>
              <p className="text-2xl font-bold text-foreground">₹{totalSpent.toLocaleString()}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Budget</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{budgetNum > 0 ? `₹${budgetNum.toLocaleString()}` : 'Not set'}</p>
              {budgetNum > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        totalSpent / budgetNum > 0.9 ? 'bg-red-500' : totalSpent / budgetNum > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min((totalSpent / budgetNum) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{Math.round((totalSpent / budgetNum) * 100)}% used</p>
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <PieChart className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Entries</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{expenses.length}</p>
            </motion.div>
          </div>

          {/* Category breakdown */}
          {categoryTotals.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-medium text-sub-foreground mb-4">Spending by Category</h3>
              <div className="space-y-3">
                {categoryTotals.map((cat) => (
                  <div key={cat.label} className="flex items-center gap-3">
                    <cat.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground w-28 shrink-0">{cat.label}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-foreground font-medium w-24 text-right">₹{cat.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Add expense button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>

          {/* Add expense form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-medium text-sub-foreground">New Expense</h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Category */}
                    <div className="col-span-2">
                      <label className="block text-xs text-muted-foreground mb-1.5">Category</label>
                      <div className="flex flex-wrap gap-2">
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <button
                            key={cat.label}
                            type="button"
                            onClick={() => setCategory(cat.label)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                              category === cat.label
                                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                                : 'border-border text-muted-foreground hover:border-muted-foreground'
                            }`}
                          >
                            <cat.icon className="w-3 h-3" />
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">Description</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Hotel check-in"
                        className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs text-muted-foreground mb-1.5">Amount (₹ INR)</label>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0"
                          className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">Paid by</label>
                      <input
                        type="text"
                        value={paidBy}
                        onChange={(e) => setPaidBy(e.target.value)}
                        placeholder="Me"
                        className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleAddExpense}
                      disabled={!description.trim() || !amount}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Expense
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="px-5 py-2.5 rounded-xl border border-border text-sub-foreground text-sm hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expense list */}
          {expenses.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <h3 className="text-sm font-medium text-sub-foreground">All Expenses</h3>
              </div>
              <div className="divide-y divide-border">
                {expenses.map((expense) => {
                  const Cat = EXPENSE_CATEGORIES.find((c) => c.label === expense.category)?.icon || MoreHorizontal;
                  return (
                    <div key={expense.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Cat className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">{expense.category} · {expense.date} · {expense.paidBy}</p>
                      </div>
                      <p className="text-sm font-medium text-foreground shrink-0">₹{expense.amount.toLocaleString()}</p>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-1.5 rounded-lg text-faint-foreground hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
