import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeatureCards from "./components/FeatureCards";
import { Routes, Route, useNavigate} from 'react-router-dom';
import Login from "./pages/login";
import { setNavigator } from "./lib/navigation";




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
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </>
    );
  };
  
export default App;
