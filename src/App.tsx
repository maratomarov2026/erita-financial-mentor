import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Welcome from "./pages/Welcome";
import Diagnostics from "./pages/Diagnostics";
import MyMap from "./pages/MyMap";
import Dashboard from "./pages/Dashboard";
import ModulesHome from "./pages/ModulesHome";
import Psychology from "./pages/modules/Psychology";
import Discipline from "./pages/modules/Discipline";
import SystemBudget from "./pages/modules/SystemBudget";
import Assets from "./pages/modules/Assets";
import Strategy from "./pages/modules/Strategy";
import GoalsList from "./pages/GoalsList";
import GoalWizard from "./pages/GoalWizard";
import GoalDetail from "./pages/GoalDetail";
import Mentor from "./pages/Mentor";
import Profile from "./pages/Profile";
import { useAppStore } from "./store/useAppStore";

function RootRedirect() {
  const onboardingSeen = useAppStore((s) => s.profile.onboardingSeen);
  const diagnosticsCompleted = useAppStore((s) => s.diagnostics.completed);
  if (!onboardingSeen) return <Navigate to="/welcome" replace />;
  if (!diagnosticsCompleted) return <Navigate to="/diagnostics" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/diagnostics" element={<Diagnostics />} />
        <Route path="/my-map" element={<MyMap />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/modules" element={<ModulesHome />} />
          <Route path="/modules/psychology" element={<Psychology />} />
          <Route path="/modules/discipline" element={<Discipline />} />
          <Route path="/modules/system" element={<SystemBudget />} />
          <Route path="/modules/assets" element={<Assets />} />
          <Route path="/modules/strategy" element={<Strategy />} />
          <Route path="/goals" element={<GoalsList />} />
          <Route path="/goals/new" element={<GoalWizard />} />
          <Route path="/goals/:id" element={<GoalDetail />} />
          <Route path="/mentor" element={<Mentor />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
