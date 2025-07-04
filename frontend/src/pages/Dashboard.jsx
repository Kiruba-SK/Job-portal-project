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
        <div className="px-5 flex justify-between items-center">
          <img
            onClick={(e) => navigate("/")}
            className="h-12 w-auto cursor-pointer max-sm:w-32"
            src={assets.logo}
            alt="Logo"
          />
          <div className="flex items-center gap-3">
            <p>Welcome, {recruiter.company_name || "Recruiter"}</p>
            <div className="relative group">
              <img
                className="w-8 h-8 object-cover rounded-full border cursor-pointer"
                src={recruiter.image ? recruiter.image : assets.company_icon}
                alt="Company logo"
              />
              <div className="absolute hidden group-hover:block top-full right-0 z-50  ">
                <ul className="mt-2 p-2 text-gray-700 test-sm border rounded-md shadow-md bg-blue-100 hover:bg-blue-50">
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
      <div className="flex items-start">
        <div className="inline-block min-h-screen border-r-2">
          <ul className="flex flex-col items-start pt-5 text-gray-800">
            <NavLink
              className={({ isActive }) =>
                `group relative flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                  isActive && "bg-blue-100 border-r-4 border-blue-500"
                }`
              }
              to={"/dashboard/manage-jobs"}
            >
              <div className="relative group">
                <img className="min-w-4" src={assets.home_icon} alt="" />
                {/* Tooltip for small screens */}
                <span className="absolute left-10 top-1/2 -translate-y-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap hidden group-hover:block sm:hidden z-50">
                  Manage Jobs
                </span>
              </div>
              <p className="max-sm:hidden">Manage Jobs</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `group relative flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                  isActive && "bg-blue-100 border-r-4 border-blue-500"
                }`
              }
              to={"/dashboard/add-job"}
            >
              <div className="relative group">
                <img className="min-w-4" src={assets.add_icon} alt="" />
                <span className="absolute left-10 top-1/2 -translate-y-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap hidden group-hover:block sm:hidden z-50">
                  Add Job
                </span>
              </div>
              <p className="max-sm:hidden ">Add Job</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `roup relative flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                  isActive && "bg-blue-100 border-r-4 border-blue-500"
                }`
              }
              to={"/dashboard/view-applications"}
            >
              <div className="relative group">
                <img className="min-w-4" src={assets.person_tick_icon} alt="" />
                <span className="absolute left-10 top-1/2 -translate-y-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap hidden group-hover:block sm:hidden z-50">
                  View Applications
                </span>
              </div>{" "}
              <p className="max-sm:hidden">View Application</p>
            </NavLink>
          </ul>
        </div>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
