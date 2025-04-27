import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import Home from "./pages/home";
import PrivateRoute from "./components/PrivateRoutes";

function App() {
  return (
    

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
      </Routes>
    
   
  );
}

export default App;