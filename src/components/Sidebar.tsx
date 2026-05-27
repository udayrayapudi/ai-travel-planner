'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Globe, Home, PlusCircle, LogOut, Menu, X,
  Info, CloudRain, Navigation, DollarSign, Luggage,
  RefreshCw, Receipt, UsersRound, Settings, MessageCircleQuestion,
  Moon, Sun
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

const MAIN_NAV = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'New Trip', href: '/dashboard/new', icon: PlusCircle },
  { label: 'AI Trip Help', href: '/dashboard/ai-help', icon: MessageCircleQuestion },
];

const PLAN_ITEMS = [
  { label: 'Trip Highlights', href: '#highlights', icon: Info },
  { label: 'Weather Analysis', href: '#weather', icon: CloudRain },
  { label: 'Budget Range', href: '#budget', icon: DollarSign },
  { label: 'Itinerary', href: '#itinerary', icon: Navigation },
  { label: 'Packing Checklist', href: '#packing', icon: Luggage },
];

const CONTROL_ITEMS = [
  { label: 'Refine Plan', href: '/dashboard/refine', icon: RefreshCw },
  { label: 'Expense Tracker', href: '/dashboard/expenses', icon: Receipt },
  { label: 'Collaborate', href: '/dashboard/collaborate', icon: UsersRound },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = () => {
    router.push('/');
  };

  const isTripView = pathname.startsWith('/dashboard/trip/') || pathname === '/dashboard/new';

  const navContent = (
    <>
      {/* Brand */}
      <div className="px-6 py-5 flex items-center gap-2.5 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Globe className="w-4.5 h-4.5 text-white" />
        </div>
        <span className="text-lg font-bold text-foreground tracking-tight">WanderWise</span>
      </div>

      {/* Theme toggle */}
      <div className="px-3 pt-3">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all border border-transparent"
        >
          {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {/* Main nav */}
      <nav className="px-3 py-4 space-y-1">
        {MAIN_NAV.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Your Plan section — visible on trip view pages */}
      {isTripView && (
        <div className="px-3 pb-2">
          <h3 className="px-4 text-xs font-semibold text-sub-foreground uppercase tracking-wider mb-3 mt-2">Your Plan</h3>
          <div className="space-y-0.5">
            {PLAN_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
                  const id = item.href.replace('#', '');
                  const el = document.getElementById(id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <item.icon className="w-[18px] h-[18px] text-faint-foreground" />
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Control Center */}
      <div className="px-3 pb-2 mt-auto">
        <h3 className="px-4 text-xs font-semibold text-sub-foreground uppercase tracking-wider mb-3 mt-4">Control Center</h3>
        <div className="space-y-0.5">
          {CONTROL_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-faint-foreground hover:text-foreground hover:bg-muted transition-all border border-transparent"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-[260px] shrink-0 flex-col bg-sidebar border-r border-border h-screen sticky top-0 overflow-y-auto">
        {navContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-foreground">WanderWise</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-sidebar flex flex-col shadow-2xl overflow-y-auto">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
