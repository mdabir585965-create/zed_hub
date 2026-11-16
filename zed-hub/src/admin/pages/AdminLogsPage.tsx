import { useEffect, useState } from 'react';
import { getAdminLogs } from '../../firebase/logs';
import { AdminLog } from '../../shared/types';
import { formatDateTime } from '../../shared/utils/format';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [cursor, setCursor] = useState<unknown | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminLogs(25)
      .then((res) => {
        setLogs(res.items);
        setCursor(res.lastDoc);
        setHasMore(res.hasMore);
      })
      .finally(() => setLoading(false));
  }, []);

  const loadMore = async () => {
    if (!cursor) return;
    const res = await getAdminLogs(25, cursor as never);
    setLogs((prev) => [...prev, ...res.items]);
    setCursor(res.lastDoc);
    setHasMore(res.hasMore);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zed-gold/25 pb-5">
        <h1 className="font-serif text-3xl">Immutable Admin Activity Logs</h1>
        <p className="text-xs text-neutral-500">
          Audit trail protected by Firestore Security Rules (append-only, no updates or deletes).
        </p>
      </div>

      <div className="overflow-x-auto border border-zed-gold/25 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-zed-cream text-[11px] uppercase tracking-widest text-neutral-600">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Administrator</th>
              <th className="p-4">Action</th>
              <th className="p-4">Entity</th>
              <th className="p-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  No logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap p-4 text-xs text-neutral-500">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="p-4 text-xs">{log.adminEmail}</td>
                  <td className="p-4 text-xs font-semibold uppercase text-zed-gold-dark">
                    {log.action}
                  </td>
                  <td className="p-4 text-xs uppercase">{log.entity}</td>
                  <td className="p-4 text-sm">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            type="button"
            onClick={loadMore}
            className="border border-zed-black px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-zed-black hover:text-white"
          >
            Load Older Logs
          </button>
        </div>
      )}
    </div>
  );
}
