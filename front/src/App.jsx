import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import Main from "./components/Main/Main";
import Workout from "./components/Workout/Workout";
import GymSlider from "./components/GymSlider/GymSlider";
import Diet from "./components/Diet/Diet";
import Calculator from "./components/Calculator/Calculator";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Individual_Warmups from "./components/Individual_Warmups/Individual_Warmups";
import SportBrands from "./components/SportBrands/SportBrands";
import Auth from "./components/Auth/Auth";
import Profile from "./components/Profile/Profile";
import Settings from "./components/Settings/Settings";
import Comments from "./components/Comments/Comments";
import AdminPanel from "./components/AdminPanel/AdminPanel";

function HomePage() {
  return (
    <>
      <Header />
      <div id="main">
        <Main />
      </div>
      <div className="divider"></div>
      <div id="workout-set">
        <Workout />
      </div>
      <div id="individual-workout">
        <Individual_Warmups />
      </div>
      <div className="divider"></div>
      <div id="gym">
        <GymSlider />
      </div>
      <div className="divider"></div>
      <div id="diet">
        <Diet />
      </div>
      <div className="divider"></div>
      <div id="calculator">
        <Calculator />
      </div>
      <div className="divider"></div>
      <div id="slider">
        <SportBrands />
      </div>
      <div id="footer">
        <Footer />
      </div>
      <ScrollToTop />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/comments" element={<Comments />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
