import { useEffect } from "react";
import Hero from "./components/Hero";
import FeatureCards from "./components/FeatureCards";
import { Routes, Route, useNavigate} from 'react-router-dom';
import Login from "./pages/login";
import { setNavigator } from "./lib/navigation";
import ChatPage from "./pages/chat_page";
import NotFound from "./pages/notFound";
// import Dashboard from "./pages/admin_dashboard";


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
      <>
      

        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<ChatPage />} />

            <Route path="*" element={< NotFound />} />

            {/* <Route path="/admin/config" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="tenant" element={<TenantForm />} />
            </Route> */}
      </Routes>
      </>
    );
  };
  
export default App;
