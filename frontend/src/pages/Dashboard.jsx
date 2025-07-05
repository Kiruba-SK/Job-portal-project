import {
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { assets } from "../assets/assets";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [recruiter, setRecruiter] = useState({});

  useEffect(() => {
    const rec = localStorage.getItem("recruiter");
    if (!rec) {
      return navigate("/");
    }
    setRecruiter(JSON.parse(rec));
  }, [navigate]);

  if (location.pathname === "/dashboard") {
    return <Navigate to="/dashboard/manage-jobs" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("recruiter");
    navigate("/");
  };

  return (
    <div className="min-h-screen">
      {/* Navbar for Recruiter Panel */}
      <div className="shadow py-4">
        <div className="px-4 sm:px-6 flex justify-between items-center">
          <img
            onClick={(e) => navigate("/")}
            className="h-10 sm:h-12 cursor-pointer max-sm:w-32"
            src={assets.logo}
            alt="Logo"
          />
          <div className="flex items-center gap-3">
            <p className="text-sm sm:text-base">
              Welcome, {recruiter.company_name || "Recruiter"}
            </p>
            <div className="relative group">
              <img
                className="w-8 h-8 object-cover rounded-full border cursor-pointer"
                src={recruiter.image ? recruiter.image : assets.company_icon}
                alt="Company logo"
              />
              <div className="absolute hidden group-hover:block top-full right-0 z-50 ">
                <ul className="mt-2 p-2 test-sm border rounded-md shadow-md bg-blue-100 hover:bg-blue-200">
                  <li
                    className="py-2 px-4 cursor-pointer "
                    onClick={handleLogout}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="flex ">
        {/* Sidebar */}
        <div className="w-10 sm:w-56 border-r-2 min-h-screen">
          <ul className="flex flex-col items-center sm:items-start pt-5 text-gray-800 space-y-1">
            {[
              {
                path: "/dashboard/manage-jobs",
                icon: assets.home_icon,
                label: "Manage Jobs",
              },
              {
                path: "/dashboard/add-job",
                icon: assets.add_icon,
                label: "Add Job",
              },
              {
                path: "/dashboard/view-applications",
                icon: assets.person_tick_icon,
                label: "View Applications",
              },
            ].map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center justify-center sm:justify-start p-3 sm:px-6 w-full hover:bg-gray-100 ${
                    isActive ? "bg-blue-100 border-r-4 border-blue-500" : ""
                  }`
                }
              >
                <div className="relative group">
                  <img className="w-5 sm:w-6" src={item.icon} alt={item.label} />
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 sm:hidden z-50">
                    {item.label}
                  </div>
                </div>
                <p className="ml-2 hidden sm:inline">{item.label}</p>
              </NavLink>
            ))}
          </ul>
        </div>
        <div className="flex-1 p-2 sm:p-8 overflow-x-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
