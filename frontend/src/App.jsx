import { Route, Routes } from "react-router-dom";
import Homepage from "./pages/Hompage";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import api from "./api/axios";
import VerifyEmail from "./pages/VerifyEmail";

function App() {

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [ userData, setUserData ] = useState({
        'firstName' : '',
        'lastName' : '',
        'username' : '',
        'email': ''
    })

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setIsAuthenticated(false);
      setIsAuthChecked(true);
      return;
    }

    const getMe = async () => {
      try {
        const response = await api.get("/auth/get-me");
        setIsAuthenticated(Boolean(response?.data?.user));
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem("accessToken");
      } finally {
        setIsAuthChecked(true);
      }
    };

    getMe();
  }, []);

  return (
    <>
      <Header 
          menuOpen={menuOpen} 
          setMenuOpen={setMenuOpen} 
          profileOpen={profileOpen} 
          setProfileOpen={setProfileOpen} 
          isAuthenticated={isAuthenticated} 
          setIsAuthenticated={setIsAuthenticated} 
          setUserData={setUserData} />

      <Routes>

        <Route path="/" element={<Homepage />} />

        <Route path="/accounts/register" element={<Register 
            setProfileOpen={setProfileOpen} 
            isAuthenticated={isAuthenticated} 
            setIsAuthenticated={setIsAuthenticated}
            setUserData={setUserData}
          
          />} />

        <Route path="/dashboard" element={<Dashboard
        
          isAuthenticated={isAuthenticated}
          isAuthChecked={isAuthChecked}
          setIsAuthenticated={setIsAuthenticated}
          userData={userData}
          
          />} />

        <Route path="/verify-email" element={<VerifyEmail

          userData={userData}
          
          />} />
        
      </Routes>
      <Footer />
    </>
  )
}

export default App
