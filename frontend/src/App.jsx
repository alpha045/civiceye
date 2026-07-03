import { useEffect } from "react";
import socket from "./socket";
import toast from "react-hot-toast";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useSelector } from "react-redux";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

import UserDashboard from "./pages/user/Dashboard.jsx";
import RegisterComplaint from "./pages/user/RegisterComplaint.jsx";
import MyComplaints from "./pages/user/MyComplaints.jsx";
import TrackComplaint from "./pages/user/TrackComplaint.jsx";
import UserNotifications from "./pages/user/Notifications.jsx";
import UserProfile from "./pages/user/Profile.jsx";

import AdminDashboard from "./pages/admin/Dashboard.jsx";
import ComplaintManagement from "./pages/admin/ComplaintManagement.jsx";
import ComplaintDetails from "./pages/admin/ComplaintDetails.jsx";
import Departments from "./pages/admin/Departments.jsx";
import Reports from "./pages/admin/Reports.jsx";

import SuperAdminDashboard from "./pages/superadmin/Dashboard.jsx";

const base = import.meta.env.BASE_URL.replace(
  /\/$/,
  ""
);

function RoleRedirect() {
  const { user } = useSelector(
    (s) => s.auth
  );

  if (!user)
    return (
      <Navigate
        to="/login"
        replace
      />
    );

  if (user.role === "superadmin")
    return (
      <Navigate
        to="/superadmin/dashboard"
        replace
      />
    );

  if (user.role === "admin")
    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );

  return (
    <Navigate
      to="/dashboard"
      replace
    />
  );
}

export default function App() {
  const { user } = useSelector(
  (s) => s.auth
);

useEffect(() => {

  if (
    user?._id &&
    user?.role === "user"
  ) {

    socket.emit("join", user._id);

    console.log(
      "JOINED ROOM:",
      user._id
    );

    socket.on(
  "new_notification",
  (data) => {

    window.dispatchEvent(
      new Event(
        "new-notification"
      )
    );

    toast.success(
      data.message
    );

    console.log(
      "LIVE NOTIFICATION:",
      data
    );
  }
);
  }

  return () => {
    socket.off(
      "new_notification"
    );
  };

}, [user]);

  return (
    <BrowserRouter basename={base}>
      <Routes>
        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              roles={["user"]}
            >
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/register-complaint"
          element={
            <ProtectedRoute
              roles={["user"]}
            >
              <RegisterComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-complaints"
          element={
            <ProtectedRoute
              roles={["user"]}
            >
              <MyComplaints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/track-complaint"
          element={
            <ProtectedRoute
              roles={["user"]}
            >
              <TrackComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute
              roles={["user"]}
            >
              <UserNotifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute
              roles={["user"]}
            >
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              roles={[
                "admin",
                "superadmin",
              ]}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute
              roles={[
                "admin",
                "superadmin",
              ]}
            >
              <ComplaintManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/complaints/:id"
          element={
            <ProtectedRoute
              roles={[
                "admin",
                "superadmin",
              ]}
            >
              <ComplaintDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute
              roles={[
                "admin",
                "superadmin",
              ]}
            >
              <Departments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute
              roles={[
                "admin",
                "superadmin",
              ]}
            >
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute
              roles={[
                "superadmin",
              ]}
            >
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/me"
          element={<RoleRedirect />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}