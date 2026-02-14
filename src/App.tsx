import { useEffect } from "react";
import Hero from "./components/Hero";
import FeatureCards from "./components/FeatureCards";
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from "./pages/login";
import { setNavigator } from "./lib/navigation";
import ChatPage from "./pages/chat_page";
import AdminLayout from "./layouts/AdminLayout"; // ✅ NEW
import NotFound from "./pages/notFound";
import TenantConfigForm from "./components/admin/TenantConfigurationForm";
import TenantsList from "./components/admin/TenantsList";
import OrganizationsList from "./components/admin/OrganizationsList"
import CollectionList from "./components/admin/CollectionsList";
import UserList from "./components/admin/UserList";
import DocumentIngestion from "./components/admin/DocumentIngestion";


const ReDocRedirect: React.FC = () => {
  useEffect(() => {
    window.location.href = 'https://askmi.duckdns.org/redoc';
  }, []);
  return <div>Redirecting to ReDoc...</div>;
};

const DocsRedirect: React.FC = () => <Navigate to="http://askmi.duckdns.org/docs" replace />;

const Home = () => (
  <>
    <Hero
      title="Intelligence, Unlocked"
      subtitle="Stop searching for answers. Start asking. Turn your company, organization, or government knowledge — across legal, policy, and financial documents — into instant answers, insights, and visual reports."
    />
    <FeatureCards />
  </>
);

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/chat" element={<ChatPage />} />

      {/* ✅ NEW: Admin routes with layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="tenant-config" element={<TenantConfigForm />} /> 
        <Route path="tenants" element={<TenantsList />} />  
        <Route path="organizations" element={<OrganizationsList />} />  
        <Route path="collections" element={<CollectionList />} />
        <Route path="users" element={<UserList />} />
        <Route path="ingestion" element={<DocumentIngestion />} />
      </Route>
      
       <Route path="/docs/*" element={<DocsRedirect />} />
      <Route path="/redoc/*" element={<ReDocRedirect />} />
  


      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
