'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, User, Globe, Bell, Moon, Sun,
  Save, Check
} from 'lucide-react';
import { getSettings, saveSettings, UserSettings } from '@/lib/trips';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    email: '',
    defaultCurrency: 'INR',
    defaultTravelers: 1,
    notifications: true,
    darkMode: true,
    language: 'en',
  });
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    getSettings().then((s) => setSettings({ ...s, darkMode: theme === 'dark' }));
  }, [theme]);

  const handleSave = async () => {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleToggleDarkMode = () => {
    toggleTheme();
    setSettings({ ...settings, darkMode: theme !== 'dark' });
  };

  if (!mounted) return null;

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-faint-foreground/10 border border-faint-foreground/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
        <p className="text-faint-foreground text-sm">Manage your profile, preferences, and default trip settings.</p>
      </motion.div>

      <div className="space-y-6">
        {/* Profile section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-sub-foreground uppercase tracking-wider">Profile</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-faint-foreground mb-1.5">Display Name</label>
              <input
                type="text"
                value={settings.displayName}
                onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                placeholder="Your name"
                className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-faint-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </motion.div>

        {/* Trip Defaults */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-sub-foreground uppercase tracking-wider">Trip Defaults</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-faint-foreground mb-1.5">Default Travelers</label>
              <input
                type="number"
                min={1}
                max={20}
                value={settings.defaultTravelers}
                onChange={(e) => setSettings({ ...settings, defaultTravelers: parseInt(e.target.value) || 1 })}
                className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-sub-foreground uppercase tracking-wider">Preferences</h2>
          </div>
          <div className="space-y-4">
            {/* Notifications toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Notifications</p>
                <p className="text-xs text-faint-foreground">Receive trip reminders and updates</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.notifications ? 'bg-indigo-600' : 'bg-muted'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings.notifications ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Dark mode toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                <div>
                  <p className="text-sm text-foreground">Dark Mode</p>
                  <p className="text-xs text-faint-foreground">Toggle dark/light theme</p>
                </div>
              </div>
              <button
                onClick={handleToggleDarkMode}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-indigo-600' : 'bg-muted'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    theme === 'dark' ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Save button */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
