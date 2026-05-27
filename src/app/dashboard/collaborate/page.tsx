"use client";

import {
  Collaborator,
  SavedTrip,
  deleteCollaborator,
  generateId,
  getCollaboratorsByTrip,
  getTrips,
  saveCollaborator,
} from "@/lib/trips";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Copy,
  Eye,
  Pencil,
  Plus,
  Shield,
  Trash2,
  UserCircle,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function CollaboratePage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");

  useEffect(() => {
    setMounted(true);
    getTrips().then((all) => {
      setTrips(all);
      if (all.length > 0) {
        setSelectedTripId(all[0].id);
        getCollaboratorsByTrip(all[0].id).then(setCollaborators);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      getCollaboratorsByTrip(selectedTripId).then(setCollaborators);
    }
  }, [selectedTripId]);

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  const handleAdd = async () => {
    if (!name.trim() || !email.trim() || !selectedTripId) return;
    const collab: Collaborator = {
      id: generateId(),
      tripId: selectedTripId,
      name: name.trim(),
      email: email.trim(),
      role,
      addedAt: new Date().toISOString(),
    };
    await saveCollaborator(collab);
    const updated = await getCollaboratorsByTrip(selectedTripId);
    setCollaborators(updated);
    setName("");
    setEmail("");
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    await deleteCollaborator(id);
    const updated = await getCollaboratorsByTrip(selectedTripId);
    setCollaborators(updated);
  };

  const handleCopyLink = () => {
    const shareLink = `${window.location.origin}/dashboard/trip/${selectedTripId}`;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleIcon = (r: string) => {
    switch (r) {
      case "owner":
        return <Shield className="w-3.5 h-3.5 text-amber-400" />;
      case "editor":
        return <Pencil className="w-3.5 h-3.5 text-indigo-400" />;
      case "viewer":
        return <Eye className="w-3.5 h-3.5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <UsersRound className="w-5 h-5 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Collaborate</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Invite friends and family to view or edit your trip plans together.
        </p>
      </motion.div>

      {trips.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center">
          <UsersRound className="w-10 h-10 text-faint-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No trips yet
          </h2>
          <p className="text-muted-foreground text-sm">
            Create a trip to start collaborating.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Trip selector */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <label className="block text-sm font-medium text-sub-foreground mb-3">
              Select a trip
            </label>
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

          {/* Share link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <h3 className="text-sm font-medium text-sub-foreground mb-3">
              Share Link
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-input border border-border rounded-xl px-4 py-2.5 text-muted-foreground text-sm truncate">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/dashboard/trip/${selectedTripId}`
                  : "..."}
              </div>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted border border-border text-sub-foreground text-sm hover:bg-muted/80 transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Owner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <h3 className="text-sm font-medium text-sub-foreground mb-4">
              Team Members
            </h3>

            {/* Owner row */}
            <div className="flex items-center gap-3 py-3 border-b border-border">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                <UserCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium">You</p>
                <p className="text-xs text-muted-foreground">Trip owner</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Shield className="w-3 h-3 text-amber-400" />
                <span className="text-xs text-amber-300 font-medium">
                  Owner
                </span>
              </div>
            </div>

            {/* Collaborators */}
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center gap-3 py-3 border-b border-border last:border-0"
              >
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <UserCircle className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{collab.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {collab.email}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border">
                  {getRoleIcon(collab.role)}
                  <span className="text-xs text-muted-foreground capitalize">
                    {collab.role}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(collab.id)}
                  className="p-1.5 rounded-lg text-faint-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {collaborators.length === 0 && (
              <p className="text-sm text-faint-foreground py-4 text-center">
                No collaborators added yet.
              </p>
            )}
          </motion.div>

          {/* Invite button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            Invite Collaborator
          </button>

          {/* Invite form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-medium text-sub-foreground">
                    Add Team Member
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">
                      Role
                    </label>
                    <div className="flex gap-3">
                      {(["editor", "viewer"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all ${
                            role === r
                              ? "border-purple-500 bg-purple-500/15 text-purple-400"
                              : "border-border text-muted-foreground hover:border-muted-foreground"
                          }`}
                        >
                          {r === "editor" ? (
                            <Pencil className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                          <span className="capitalize">{r}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleAdd}
                      disabled={!name.trim() || !email.trim()}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Invite
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
        </div>
      )}
    </div>
  );
}
