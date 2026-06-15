import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import {
  useContext
} from "react";

import {
  AuthContext
} from "./context/AuthContext";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard
  from "./pages/AdminDashboard";

import UserDashboard
  from "./pages/UserDashboard";

import ProfilePage
  from "./pages/ProfilePage";

function App() {

  const { user } =
    useContext(AuthContext);

  return (
    <>
      {user && <Navbar />}

      <div
        style={{
          flex: 1,
          padding: "32px"
        }}
      >

        <Routes>

          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/admin"
            element={
              user?.role?.id === 2
                ? <AdminDashboard />
                : <Navigate to="/" />
            }
          />

          <Route
            path="/user"
            element={
              user?.role?.id === 1
                ? <UserDashboard />
                : <Navigate to="/" />
            }
          />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

        </Routes>

      </div>
    </>
  );
}

export default App;