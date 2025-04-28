import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";

import Main from "./pages/MainPage/Main/Main";
import Workout from "./pages/MainPage/Workout/Workout";
import GymSlider from "./pages/MainPage/GymSlider/GymSlider";
import Diet from "./pages/MainPage/Diet/Diet";
import Calculator from "./pages/MainPage/Calculator/Calculator";
import Individual_Warmups from "./pages/MainPage/Individual_Warmups/Individual_Warmups";
import SportBrands from "./pages/MainPage/SportBrands/SportBrands";

import Auth from "./pages/Auth/Auth";
import Profile from "./pages/Profile/Profile";
import Settings from "./pages/Settings/Settings";
import Comments from "./pages/Comments/Comments";
import AdminPanel from "./pages/AdminPanel/AdminPanel";

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
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/comments" element={<Comments />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
