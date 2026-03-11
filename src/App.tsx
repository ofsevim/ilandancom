import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ListingProvider } from "@/context/ListingContext";
import AuthModal from "@/components/AuthModal";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import MessagesPage from "./pages/MessagesPage";
import CreateListing from "./pages/CreateListing";
import FavoritesPage from "./pages/FavoritesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ListingProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ilanlar" element={<Listings />} />
          <Route path="/ilan/:id" element={<ListingDetail />} />
          <Route path="/mesajlar" element={<MessagesPage />} />
          <Route path="/ilan-ver" element={<CreateListing />} />
          <Route path="/favoriler" element={<FavoritesPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ListingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
