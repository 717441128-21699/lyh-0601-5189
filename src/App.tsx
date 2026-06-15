import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Workshop from "@/pages/Workshop";
import TattooCreate from "@/pages/TattooCreate";
import Competition from "@/pages/Competition";
import CompetitionLive from "@/pages/CompetitionLive";
import Reports from "@/pages/Reports";
import Leaderboard from "@/pages/Leaderboard";
import PlayerProfile from "@/pages/PlayerProfile";
import Market from "@/pages/Market";
import Guild from "@/pages/Guild";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workshop" element={<Workshop />} />
          <Route path="/workshop/create" element={<TattooCreate />} />
          <Route path="/competition" element={<Competition />} />
          <Route path="/competition/live" element={<CompetitionLive />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/player/:id" element={<PlayerProfile />} />
          <Route path="/market" element={<Market />} />
          <Route path="/guild" element={<Guild />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}
