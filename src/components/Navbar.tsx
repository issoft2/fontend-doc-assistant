import { Link, NavLink } from "react-router-dom";
import logo from "../assets/images/logo.png";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-indigo-500/30 bg-indigo-700/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo + Brand */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Secured Personalized Intelligence"
              className="h-10 w-auto"
            />
            <span className="hidden md:block text-xl font-semibold text-white tracking-tight">
              Company Knowledge, Re-Imagined
            </span>
          </Link>

          {/* Navigation */}
          {/* <div className="hidden md:flex items-center gap-8">
            

            <NavLink
              to="/pricing"
              className="text-sm font-medium text-indigo-100 hover:text-white transition"
            >
              Pricing
            </NavLink>
          </div> */}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-indigo-100 hover:text-white transition"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
