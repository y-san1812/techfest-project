import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import EventsPage from "./pages/EventsPage";
import RegistrationsPage from "./pages/RegistrationsPage";
import TasksPage from "./pages/TasksPage";
import NotificationsPage from "./pages/NotificationsPage";
import ReportsPage from "./pages/ReportsPage";
import ReferralsPage from "./pages/ReferralsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/events" element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR', 'CLUB_COORDINATOR']}>
                <EventsPage />
              </ProtectedRoute>
            } />
            <Route path="/registrations" element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'FACULTY_COORDINATOR', 'CLUB_COORDINATOR']}>
                <RegistrationsPage />
              </ProtectedRoute>
            } />
            <Route path="/referrals" element={
              <ProtectedRoute roles={['CAMPUS_AMBASSADOR']}>
                <ReferralsPage />
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute roles={['TEAM_LEAD', 'VOLUNTEER', 'SUPER_ADMIN', 'ADMIN']}>
                <TasksPage />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/reports" element={
              <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
                <ReportsPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
