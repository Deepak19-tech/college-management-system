import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Courses from "./pages/Courses";
import Library from "./pages/Library";
import Communication from "./pages/Communication";
import Reports from "./pages/Reports";

const queryClient = new QueryClient();

function AppInner() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/library" element={<Library />} />
          <Route path="/communication" element={<Communication />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
