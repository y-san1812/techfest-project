import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Copy, Link2 } from 'lucide-react';

interface ReferralSummary {
  code: string;
  totalRegistrations: number;
  eventBreakdown: { eventId: string; eventTitle: string; registrations: number }[];
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .get<ReferralSummary>('/referrals/me')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyCode = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Referral Dashboard</h2>
          <p className="text-sm text-muted-foreground">Track registrations via your unique referral code</p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground animate-pulse-glow">Loading…</p>
        ) : !data ? (
          <div className="glass-card p-8 text-center text-muted-foreground">
            Failed to load referral data.
          </div>
        ) : (
          <>
            <div className="glass-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your code</p>
                <p className="mt-2 text-xl font-bold text-foreground flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  <span className="select-all">{data.code}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total registrations</p>
                  <p className="text-2xl font-bold text-primary">{data.totalRegistrations.toLocaleString()}</p>
                </div>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Event breakdown</h3>
              {data.eventBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">No registrations yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.eventBreakdown
                    .sort((a, b) => b.registrations - a.registrations)
                    .map((row) => (
                      <div key={row.eventId} className="flex items-center justify-between">
                        <p className="text-sm text-foreground">{row.eventTitle}</p>
                        <p className="text-sm font-semibold text-primary">{row.registrations}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

