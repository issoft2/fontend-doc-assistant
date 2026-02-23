import { useEffect } from "react";
import Hero from "./components/Hero";
import FeatureCards from "./components/FeatureCards";
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from "./pages/login";
import { setNavigator } from "./lib/navigation";
import ChatPage from "./pages/ChatPage";
import AdminLayout from "./layouts/AdminLayout"; // ✅ NEW
import NotFound from "./pages/notFound";
import TenantConfigForm from "./components/admin/TenantConfigurationForm";
import TenantsList from "./components/admin/TenantsList";
import OrganizationsList from "./components/admin/OrganizationsList"
import CollectionList from "./components/admin/CollectionModule/CollectionList";
import UserList from "./components/admin/UserList";
import DocumentIngestion from "./components/admin/DocumentIngestion";


  const DocsRedirect: React.FC = () => {
    useEffect(() => {
      // ✅ FULL EXTERNAL URL - window.location bypasses React Router
      window.location.href = '/docs';  // Let nginx proxy this
    }, []);
    return <div className="p-8 text-center text-white">Opening API Docs...</div>;
  };

  const ReDocRedirect: React.FC = () => {
    useEffect(() => {
      window.location.href = '/redoc';
    }, []);
    return <div className="p-8 text-center text-white">Opening ReDoc...</div>;
  };

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
        <Route path="ingest" element={<DocumentIngestion />} />
      </Route>
      
       <Route path="/docs" element={<DocsRedirect />} />
       <Route path="/redoc" element={<ReDocRedirect />} />
  


      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
