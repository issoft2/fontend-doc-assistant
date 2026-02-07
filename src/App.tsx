import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeatureCards from "./components/FeatureCards";
import { Routes, Route } from 'react-router-dom';
import Login from "./components/login";


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
