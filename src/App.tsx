import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./components/error-fallback";
import ChampionsPage from "./pages/ChampionsPage";
import RegistrationPage from "./pages/RegistrationPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import SkillLevelPage from "./pages/SkillLevelPage";
import ProductPage from "./pages/ProductPage";
import TennisClubsPage from "./pages/TennisClubsPage";
import MemberLoginPage from "./pages/MemberLoginPage";
import OnAuthSuccessPage from "./pages/OnAuthSuccessPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import OutboxPage from "./pages/OutboxPage";
import RequireAuth from "./components/RequireAuth";
import SeasonsPage from "./pages/SeasonsPage";
import StandingsPage from "./pages/StandingsPage";
import AdminChallengesPage from "./pages/AdminChallengesPage";
import PlayersPage from "./pages/PlayersPage";
import ChallengesPage from "./pages/ChallengesPage";

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
            <Route path="/challenges" element={<RequireAuth><ChallengesPage /></RequireAuth>} />
            <Route path="/seasons" element={<SeasonsPage />} />
            <Route path="/standings" element={<StandingsPage />} />
            <Route path="/admin/challenges" element={<RequireAuth><AdminChallengesPage /></RequireAuth>} />
            <Route path="/onauthsuccess" element={<OnAuthSuccessPage />} />
            <Route path="/resetpassword" element={<ResetPasswordPage />} />
            <Route path="/order-history" element={<RequireAuth><OrderHistoryPage /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
            <Route path="/outbox" element={<RequireAuth><OutboxPage /></RequireAuth>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>;


export default App;
