import React, { useEffect, useMemo, useState } from 'react';
import { fetchRegisteredUsers, selectRegisteredUser } from '../api';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CircleUserRound, Loader2, Search, ShieldCheck } from 'lucide-react';

const Login = ({ setToken }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchRegisteredUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load registered accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => {
      const name = (user.name || '').toLowerCase();
      const username = (user.username || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const id = (user._id || '').toLowerCase();
      return name.includes(query) || username.includes(query) || email.includes(query) || id.includes(query);
    });
  }, [search, users]);

  const handleSelect = async (userId) => {
    setSelectingId(userId);
    setError('');
    try {
      const { data } = await selectRegisteredUser(userId);
      setToken(data.token);
      localStorage.setItem('name', data.name || 'User');
      localStorage.setItem('userId', data.user_id || userId);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to open this account.');
    } finally {
      setSelectingId('');
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-6xl items-center justify-center py-6 sm:py-10">
      <div className="relative w-full overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-slate-950/70 shadow-[0_0_60px_rgba(2,6,23,0.35)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10" />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <section className="flex flex-col justify-between gap-8 rounded-[1.75rem] border border-cyan-400/10 bg-slate-900/60 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Account Access
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">Choose an account.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Registered users are listed below. Pick the account you want to open and jump straight into the dashboard without entering a password.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-200">
                  <BadgeCheck className="h-4 w-4" />
                  One click entry
                </div>
                <p className="mt-3 text-sm text-slate-200">Click a user card to open that dashboard instantly.</p>
              </div>
              <div className="rounded-2xl border border-fuchsia-400/15 bg-fuchsia-400/10 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-fuchsia-200">
                  <CircleUserRound className="h-4 w-4" />
                  Professional flow
                </div>
                <p className="mt-3 text-sm text-slate-200">No username field, no password field, just a clean account list.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-400">
              <Link to="/register" className="text-cyan-300 transition hover:text-cyan-200">
                Register a new account
              </Link>
              <span className="hidden sm:inline">•</span>
              <button type="button" onClick={loadUsers} className="text-slate-300 transition hover:text-white">
                Refresh list
              </button>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-cyan-400/15 bg-slate-950/60 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Registered accounts</h2>
                <p className="mt-1 text-sm text-slate-400">Select an account by its MongoDB ID.</p>
              </div>

              <div className="relative w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300/80" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or id"
                  className="w-full rounded-2xl border border-cyan-400/15 bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <div className="mt-6 max-h-[34rem] overflow-y-auto pr-1">
              {loading ? (
                <div className="flex min-h-[18rem] items-center justify-center rounded-3xl border border-cyan-400/10 bg-slate-900/40 text-slate-300">
                  <Loader2 className="mr-3 h-5 w-5 animate-spin text-cyan-300" />
                  Loading registered accounts...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-cyan-400/15 bg-slate-900/40 p-10 text-center">
                  <p className="text-lg font-semibold text-white">No matching accounts</p>
                  <p className="mt-2 text-sm text-slate-400">Try a different search or register a new account first.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredUsers.map((user) => {
                    const isSelecting = selectingId === user._id;

                    return (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => handleSelect(user._id)}
                        disabled={isSelecting}
                        className="group rounded-3xl border border-cyan-400/15 bg-slate-900/70 p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-slate-900/90 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_0_30px_rgba(34,211,238,0.08)] disabled:cursor-wait disabled:opacity-80"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-lg font-semibold text-white">{user.name}</h3>
                              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                                Registered
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-400">{user.email || 'No email on file'}</p>
                          </div>

                          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition group-hover:border-cyan-300/30 group-hover:bg-cyan-400/15">
                            {isSelecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                            {isSelecting ? 'Opening' : 'Open dashboard'}
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                            <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Account ID</div>
                            <div className="mt-1 break-all font-mono text-sm text-slate-200">{user._id}</div>
                          </div>
                          <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                            <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Username</div>
                            <div className="mt-1 truncate text-sm text-slate-200">{user.username || user.name}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;