import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import Homepage from "./pages/Hompage";
import Register from "./pages/Register";

function App() {

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <Routes>
      <Route path="/" element={<Homepage 
        
        menuOpen={menuOpen} setMenuOpen={setMenuOpen} profileOpen={profileOpen} setProfileOpen={setProfileOpen}
        
        />} />
      <Route path="/accounts/register" element={<Register 
      
        menuOpen={menuOpen} setMenuOpen={setMenuOpen} profileOpen={profileOpen} setProfileOpen={setProfileOpen}
        
        />} />
    </Routes>
  )
}

export default App
