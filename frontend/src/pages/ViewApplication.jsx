import React, { useEffect, useState, useRef } from "react";
import { assets } from "../assets/assets";
import { MoreVertical } from "lucide-react";
import { toast } from "react-toastify";
import AxiosInstance from "../components/AxiosInstance";

const ViewApplication = () => {
  const [applications, setApplications] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const dropdownRef = useRef(null);

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
    } catch (err) {
      console.error(err);
      toast.error("Failed to update application status.");
    }
  };

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
        console.error("Failed to load applications", err);
        toast.error("Failed to load applications.");
      }
    };

    fetchApplications();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <div>
        <table className="w-full max-w-4xl bg-white border border-gray-200 max-sm:text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">#</th>
              <th className="py-2 px-4 text-left">User name</th>
              <th className="py-2 px-4 text-left max-sm:hidden">Job Title</th>
              <th className="py-2 px-4 text-left max-sm:hidden">Location</th>
              <th className="py-2 px-4 text-left">Resume</th>
              <th className="py-2 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? (
              applications.map((app, index) => (
                <tr key={app.id} className="text-gray-700">
                  <td className="py-2 px-4 border-b text-center">
                    {index + 1}
                  </td>
                  <td className="py-2 px-4 border-b text-center flex">
                    <img
                      className="w-10 h-10 rounded-full mr-3 max-sm:hidden"
                      src={app.user_img || assets.default_user_icon}
                      alt=""
                    />
                    <span>{app.user_name || "No name available"}</span>
                  </td>
                  <td className="py-2 px-4 border-b max-sm:hidden">
                    {app.job?.title || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b max-sm:hidden">
                    {app.job?.location || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <a
                      href={app.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-50 text-blue-400 px-3 py-1 rounded inline-flex gap-2 items-center"
                    >
                      Resume <img src={assets.resume_download_icon} alt="" />
                    </a>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded ${
                        app.status === "Accepted"
                          ? "bg-green-100"
                          : app.status === "Rejected"
                          ? "bg-red-100"
                          : "bg-yellow-100"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b relative">
                    <button
                      className="text-gray-500 font-bold "
                      onClick={() =>
                        setDropdownVisible(
                          dropdownVisible === app.id ? null : app.id
                        )
                      }
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600 hover:text-black" />{" "}
                    </button>
                    {dropdownVisible === app.id && (
                      <div
                        ref={dropdownRef}
                        className="z-50  absolute right-0 md:left-0 top-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow group-hover:block"
                      >
                        <button
                          onClick={() => handleStatusChange(app.id, "Accepted")}
                          className="block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusChange(app.id, "Rejected")}
                          className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
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
