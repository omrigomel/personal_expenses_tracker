import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import Register from "./Register";
import Analysis from "./Analysis";
import MonthlyView from "./MonthlyView";
import ForgotPassword from "./ForgotPassword";
import Account from "./Account";
import ChatAndRecommendations from "./ChatAndRecommendations";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/home" element={<Home />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/monthlyview/:period" element={<MonthlyView />} />
                <Route path="/chatandrecommendations" element={<ChatAndRecommendations />} />
                <Route path="/account" element={<Account />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
