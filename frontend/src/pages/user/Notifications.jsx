import { useEffect, useState } from "react";
import UserLayout from "../../layouts/UserLayout.jsx";
import api from "../../utils/api.js";

export default function Notifications() {

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const fetchNotifications =
      async () => {

        try {

          await api.put(
              "/notifications/mark-read"
            );

          const { data } =
            await api.get(
              "/notifications"
            );

          setNotifications(
            data.notifications
          );

        } catch (error) {

          console.log(error);

        } finally {

          setLoading(false);

        }
      };

    fetchNotifications();

  }, []);

  return (
    <UserLayout>

      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Notifications
          </h1>

          <p className="text-gray-500 mt-1">
            Real-time complaint updates
          </p>
        </div>

        {loading ? (

          <div className="text-center py-10">
            Loading...
          </div>

        ) : notifications.length === 0 ? (

          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
            <p className="text-gray-400">
              No notifications yet
            </p>
          </div>

        ) : (

          <div className="space-y-4">

            {notifications.map((n) => (

              <div
                key={n._id}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
              >

                <div className="flex items-start justify-between">

                  <div>

                    <h2 className="font-semibold text-gray-900">
                      {n.title}
                    </h2>

                    <p className="text-gray-600 mt-1">
                      {n.message}
                    </p>

                  </div>

                  <span className="text-xs text-gray-400">
                    {new Date(
                      n.createdAt
                    ).toLocaleString()}
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </UserLayout>
  );
}