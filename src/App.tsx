import { Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { TransactionDetailPage } from "./pages/TransactionDetailPage";
import { MyTransactionsPage } from "./pages/MyTransactionsPage";
import { CreateEventPage } from "./pages/CreateEventPage";
import { OrganizerEventsPage } from "./pages/OrganizerEventsPage";
import { OrganizerEventManagePage } from "./pages/OrganizerEventManagePage";
import { OrganizerProfilePage } from "./pages/OrganizerProfilePage";
import { OrganizerDashboardPage } from "./pages/OrganizerDashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { ProfilePage } from "./pages/ProfilePage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route
          path="/events/:slug/checkout"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions/:id"
          element={
            <ProtectedRoute>
              <TransactionDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tickets"
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <MyTransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/dashboard"
          element={
            <ProtectedRoute roles={["ORGANIZER"]}>
              <OrganizerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/new"
          element={
            <ProtectedRoute roles={["ORGANIZER"]}>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events"
          element={
            <ProtectedRoute roles={["ORGANIZER"]}>
              <OrganizerEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizer/events/:eventId/manage"
          element={
            <ProtectedRoute roles={["ORGANIZER"]}>
              <OrganizerEventManagePage />
            </ProtectedRoute>
          }
        />
        <Route path="/organizers/:organizerId" element={<OrganizerProfilePage />} />
      </Route>
    </Routes>
  );
}
