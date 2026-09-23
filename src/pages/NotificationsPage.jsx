import React, { useEffect, useState } from "react";
import { Bell, CheckCheck, ArrowRight, Circle } from "lucide-react";
import { api } from "../services/api.js";

export const NotificationsPage = ({ setCurrentView }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setItems(res?.data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const read = async id => {
    try {
      await api.markNotificationRead(id);
      setItems(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const readAll = async () => {
    try {
      await api.markAllNotificationsRead();
      setItems(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const unread = items.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8">

        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Stay updated with your learning activity.
              </p>
            </div>
          </div>

          <button
            onClick={readAll}
            disabled={!unread}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        </div>

        {/* Count */}
        {!loading && items.length > 0 && (
          <div className="mb-4 flex justify-between">
            <p className="text-sm font-medium text-gray-600">
              {items.length} {items.length === 1 ? "notification" : "notifications"}
            </p>
            {unread > 0 && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {unread} unread
              </span>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="mt-4 text-sm text-gray-500">
              Loading notifications...
            </p>
          </div>
        ) : items.length ? (
          <div className="space-y-3">
            {items.map(n => (
              <div
                key={n._id}
                className={`relative flex gap-4 rounded-2xl border p-5 ${n.read
                    ? "border-gray-200 bg-white"
                    : "border-blue-200 bg-blue-50/40 shadow-sm"
                  }`}
              >
                {!n.read && (
                  <Circle className="absolute right-4 top-4 h-2.5 w-2.5 fill-blue-600 text-blue-600" />
                )}

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${n.read
                      ? "bg-gray-100 text-gray-500"
                      : "bg-blue-100 text-blue-600"
                    }`}
                >
                  <Bell className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1 pr-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-gray-900">{n.title}</h3>

                    {!n.read && (
                      <button
                        onClick={() => read(n._id)}
                        className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Mark read
                      </button>
                    )}
                  </div>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    {n.message}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
              <Bell className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="mt-4 font-semibold text-gray-800">
              No notifications yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You're all caught up. New learning updates will appear here.
            </p>
          </div>
        )}

        {/* Back */}
        <button
          onClick={() => setCurrentView("student-dashboard")}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600"
        >
          Back to dashboard
          <ArrowRight className="h-4 w-4" />
        </button>

      </div>
    </div>
  );
};

export default NotificationsPage;