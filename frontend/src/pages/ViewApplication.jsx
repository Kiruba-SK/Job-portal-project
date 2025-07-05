import React, { useEffect, useState, useRef } from "react";
import { assets } from "../assets/assets";
import { MoreVertical } from "lucide-react";
import { toast } from "react-toastify";
import AxiosInstance from "../components/AxiosInstance";

const ViewApplication = () => {
  const [applications, setApplications] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchApplications = async () => {
      const recruiterData = localStorage.getItem("recruiter");
      if (!recruiterData) return;

      try {
        const companyEmail = JSON.parse(recruiterData).email;
        const res = await AxiosInstance.get(
          `/company-applications/?email=${companyEmail}`
        );

        setApplications(res.data);
      } catch (err) {
        toast.error("Failed to load applications.");
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await AxiosInstance.patch("/update-application-status/", {
        application_id: appId,
        status: newStatus,
      });
      const data = res.data;
      if (res.status === 200) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === appId ? { ...app, status: newStatus } : app
          )
        );
        toast.success(`Application ${newStatus}`);
        setDropdownVisible(null);
      } else {
        toast.error(data?.error || "Failed to update application status.");
      }
    } catch {
      toast.error("Failed to update application status.");
    }
  };

  return (
    <div className="container max-w-5xl p-4 sm:p-8">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-xs sm:text-base">
          <thead>
            <tr className="text-left">
              <th className="py-2 px-3 border-b  hidden sm:table-cell">#</th>
              <th className="py-2 px-3 border-b ">User</th>
              <th className="py-2 px-3 border-b ">
                Job
              </th>
              <th className="py-2 px-3 border-b  hidden sm:table-cell">
                Location
              </th>
              <th className="py-2 px-3 border-b text-center">Resume</th>
              <th className="py-2 px-3 border-b text-center">Status</th>
              <th className="py-2 px-3 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? (
              applications.map((app, index) => (
                <tr key={app.id} className="text-gray-700 align-top">
                  <td className="py-2 px-3 border-b hidden sm:table-cell text-center">
                    {index + 1}
                  </td>
                  <td className="py-2 px-3 border-b">
                    <div className="flex items-center gap-2">
                      <img
                        className="w-6 h-6 rounded-full hidden sm:block"
                        src={app.user_img || assets.default_user_icon}
                        alt="User"
                      />
                      <span>{app.user_name || "No name available"}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 border-b ">
                    {app.job?.title || "N/A"}
                  </td>
                  <td className="py-2 px-3 border-b hidden sm:table-cell">
                    {app.job?.location || "N/A"}
                  </td>
                  <td className="py-2 px-3 border-b text-center">
                    <a
                      href={app.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-50 text-blue-400 px-2 py-1 rounded inline-flex  items-center gap-2"
                    >
                      Resume <img src={assets.resume_download_icon} alt="" />
                    </a>
                  </td>
                  <td className="px-3 py-2 border-b text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs sm:text-sm font-medium ${
                        app.status === "Accepted"
                          ? "bg-green-100 text-green-700"
                          : app.status === "Rejected"
                          ? "bg-red-100 text-red-500"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 border-b relative text-center">
                    <button
                      className="text-gray-500"
                      onClick={() =>
                        setDropdownVisible(
                          dropdownVisible === app.id ? null : app.id
                        )
                      }
                    >
                      <MoreVertical className="w-4 h-4 hover:text-black" />
                    </button>
                    {dropdownVisible === app.id && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow z-50"
                      >
                        <button
                          onClick={() => handleStatusChange(app.id, "Accepted")}
                          className="block w-full text-left px-3 py-2 text-blue-500 hover:bg-gray-100"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, "Rejected")}
                          className="block w-full text-left px-3 py-2 text-red-500 hover:bg-gray-100"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewApplication;
