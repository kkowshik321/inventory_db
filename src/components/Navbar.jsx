import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="navbar">
      <h1 className="navbar-title">Inventory Dashboard</h1>

      <div className="navbar-menu">
        {user ? (
          <>
            <span className="navbar-welcome">Welcome, {user.fullName}</span>
            <button
              onClick={handleLogout}
              className="navbar-logout"
              title="Sign out"
            >
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="navbar-link">Login</Link>
            <Link to="/register" className="navbar-link">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
