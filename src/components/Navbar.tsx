'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Globe, LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-foreground">WanderWise</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          <Link href="/planner" className="text-sm text-sub-foreground bg-muted/50 px-4 py-2 rounded-lg hover:bg-muted transition-colors">
            Planner
          </Link>
        </div>

        <div className="hidden sm:flex items-center">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-muted/50">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="sm:hidden border-t border-border bg-background">
          <div className="px-4 py-3 space-y-1">
            <Link href="/planner" className="block px-3 py-2 text-sm text-sub-foreground rounded-lg hover:bg-muted transition-colors">
              Planner
            </Link>
            <Link href="/" className="block px-3 py-2 text-sm text-muted-foreground rounded-lg hover:bg-muted transition-colors">
              Sign Out
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
