import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
const HomePage = lazy(() => import("./pages/HomePage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./components/error-fallback";
const ChampionsPage = lazy(() => import("./pages/ChampionsPage"));
const RegistrationPage = lazy(() => import("./pages/RegistrationPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const SkillLevelPage = lazy(() => import("./pages/SkillLevelPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const TennisClubsPage = lazy(() => import("./pages/TennisClubsPage"));
const MemberLoginPage = lazy(() => import("./pages/MemberLoginPage"));
const OnAuthSuccessPage = lazy(() => import("./pages/OnAuthSuccessPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const OrderHistoryPage = lazy(() => import("./pages/OrderHistoryPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const OutboxPage = lazy(() => import("./pages/OutboxPage"));
import RequireAuth from "./components/RequireAuth";
const SeasonsPage = lazy(() => import("./pages/SeasonsPage"));
const StandingsPage = lazy(() => import("./pages/StandingsPage"));
const AdminChallengesPage = lazy(() => import("./pages/AdminChallengesPage"));
const AdminSeasonsPage = lazy(() => import("./pages/AdminSeasonsPage"));
const AdminCourtsPage = lazy(() => import("./pages/AdminCourtsPage"));
import RequireAdmin from "./components/RequireAdmin";
const CourtsPage = lazy(() => import("./pages/CourtsPage"));
const CourtsMapPage = lazy(() => import("./pages/CourtsMapPage"));
const PlayerProfilePage = lazy(() => import("./pages/PlayerProfilePage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const PlayersPage = lazy(() => import("./pages/PlayersPage"));
const ChallengesPage = lazy(() => import("./pages/ChallengesPage"));

const queryClient = new QueryClient();

const App = () =>
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={(error, errorInfo) => {
    console.error(`Error Boundary caught an error(pathname:${location.pathname + location.search}):`, error, errorInfo);
    setTimeout(() => {
      throw error;
    }, 0);
  }}>

    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/champions" element={<ChampionsPage />} />
            <Route path="/previous-seasons" element={<ChampionsPage />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/skill-level" element={<SkillLevelPage />} />
            <Route path="/tennis-clubs" element={<TennisClubsPage />} />
            <Route path="/members/memberlogin" element={<MemberLoginPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/player/:id" element={<PlayerProfilePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/challenges" element={<RequireAuth><ChallengesPage /></RequireAuth>} />
            <Route path="/schedule" element={<RequireAuth><SchedulePage /></RequireAuth>} />
            <Route path="/seasons" element={<SeasonsPage />} />
            <Route path="/standings" element={<StandingsPage />} />
            <Route path="/courts" element={<CourtsPage />} />
            <Route path="/courts/map" element={<CourtsMapPage />} />
            <Route path="/admin/challenges" element={<RequireAdmin><AdminChallengesPage /></RequireAdmin>} />
            <Route path="/admin/seasons" element={<RequireAdmin><AdminSeasonsPage /></RequireAdmin>} />
            <Route path="/admin/courts" element={<RequireAdmin><AdminCourtsPage /></RequireAdmin>} />
            <Route path="/onauthsuccess" element={<OnAuthSuccessPage />} />
            <Route path="/resetpassword" element={<ResetPasswordPage />} />
            <Route path="/order-history" element={<RequireAuth><OrderHistoryPage /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
            <Route path="/outbox" element={<RequireAuth><OutboxPage /></RequireAuth>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>;


export default App;
