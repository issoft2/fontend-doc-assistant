import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeatureCards from "./components/FeatureCards";

const App = () => {
  return (
    <>
      <Navbar />

      <Hero
        title="Intelligence, Unlocked"
        subtitle="Stop searching for answers. Start asking. Turn your company, organization, or government knowledge — across legal, policy, and financial documents — into instant answers, insights, and visual reports."
      />
        <FeatureCards />
       
      
    </>
  );
};

export default App;
