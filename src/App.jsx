import { BrowserRouter, Route, Routes } from "react-router";
import { AuthProvider } from "./context/AuthContext.jsx";
import { I18nProvider } from "./i18n/I18nContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Landing from "./pages/Landing.jsx";
import { Login, Register } from "./pages/AuthPages.jsx";
import { ForgotPassword, ResetPassword } from "./pages/PasswordPages.jsx";
import Today from "./pages/Today.jsx";
import Offers from "./pages/Offers.jsx";
import NewOffer from "./pages/NewOffer.jsx";
import OfferDetail from "./pages/OfferDetail.jsx";
import LeadDetail from "./pages/LeadDetail.jsx";
import Inbox from "./pages/Inbox.jsx";
import Stats from "./pages/Stats.jsx";
import Settings from "./pages/Settings.jsx";
import Packs from "./pages/Packs.jsx";
import Guide from "./pages/Guide.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* pages réservées aux utilisateurs connectés */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/today" element={<Today />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/offers/new" element={<NewOffer />} />
                <Route path="/offers/:id" element={<OfferDetail />} />
                <Route path="/offers/:id/edit" element={<NewOffer />} />
                <Route path="/leads/:id" element={<LeadDetail />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/packs" element={<Packs />} />
                <Route path="/guide" element={<Guide />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
}
