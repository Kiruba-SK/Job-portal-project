import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";
import { assets } from "../assets/assets";
import moment from "moment";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import AxiosInstance from "../components/AxiosInstance";
import Loading from "../components/Loading";

const Applications = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [resume, setResume] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchApplications = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    setLoading(true);
    try {
      const res = await AxiosInstance.get("/user-applications/", {
        params: { email: user.primaryEmailAddress.emailAddress },
      });
      const data = res.data;

      if (Array.isArray(data)) {
        setApplications(data);
      } else {
        setApplications([]);
        setError("Unexpected response from server");
      }
    } catch (err) {
      console.error("Failed to fetch applications", err);
      setError("Error fetching applications.");
      setApplications([]);
    }
    setLoading(false);
  }, [user]);

  const fetchUserResume = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      const res = await AxiosInstance.get("/user-resume/", {
        params: { email: user.primaryEmailAddress.emailAddress },
      });
      const data = res.data;
      setResumeUrl(data?.resume || null);
    } catch (err) {
      console.error("Error fetching user resume:", err);
      setResumeUrl(null);
    }
  }, [user]);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      fetchApplications();
      fetchUserResume();
    }
  }, [user, fetchApplications, fetchUserResume]);

  const handleSaveResume = async () => {
    if (!resume) {
      toast.info("Please select a resume file first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("email", user.primaryEmailAddress.emailAddress);
    console.log("Uploading file:", resume);

    try {
      await AxiosInstance.post("/upload-resume/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Resume uploaded successfully!");
      setIsEdit(false);
      setResume(null);
      await fetchUserResume();
    } catch (err) {
      console.error("Error uploading resume:", err);
      toast.error(err.message || "Error uploading resume");
    }
  };

  const filteredApps = applications.filter(
    (app) => statusFilter === "All" || app.status === statusFilter
  );

  return (
    <>
      <Navbar />
      <div className="container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10">
        <h2 className="text-xl font-semibold">Your Resume</h2>
        <div className="flex gap-2 mb-6 mt-6">
          {isEdit ? (
            <>
              <label
                className="cursor pointer inline-flex items-center"
                htmlFor="resumeUpload"
              >
                <p className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2">
                  {resume ? resume.name : "Select Resume"}
                </p>
                <input
                  id="resumeUpload"
                  onChange={(e) => setResume(e.target.files[0])}
                  accept="application/pdf"
                  type="file"
                  hidden
                />
                <img src={assets.profile_upload_icon} alt="" />
              </label>

              <button
                onClick={handleSaveResume}
                className="bg-green-100 border-green-400 rounded-lg px-4 py-2 mt-2"
              >
                Save
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              {resumeUrl ? (
                <a
                  className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg"
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Resume
                </a>
              ) : (
                <p className="text-gray-500">No resume uploaded</p>
              )}
              <button
                onClick={() => setIsEdit(true)}
                className="text-gray-500 border border-gray-300 rounded-lg px-4 py-2"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-4 mt-10">Jobs Applied</h2>
        <div className="flex justify-end mb-4">
          <label className="mr-2 font-medium">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        {error && <p className="text-red-500 font-medium mb-4">{error}</p>}
        {loading ? (
          <div>
            <Loading />
            <p className="text-center py-4">Loading applications...</p>
          </div>
        ) : (
          <table className="min-w-full border bg-white mt-12 rounded-lg ">
            <thead>
              <tr>
                <th className="py-3 px-4 border-b text-left">Company</th>
                <th className="py-3 px-4 border-b text-left">Job Title</th>
                <th className="py-3 px-4 border-b text-left max-sm:hidden">
                  Location
                </th>
                <th className="py-3 px-4 border-b text-left max-sm:hidden">
                  Date
                </th>
                <th className="py-3 px-4 border-b text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.length > 0 ? (
                filteredApps.map((app, index) => (
                  <tr key={index}>
                    <td className="py-3 px-4 flex items-center gap-2 border-b">
                      <img
                        className="w-8 h-8 "
                        src={app.job?.company?.image || "/default-company.png"}
                        alt=""
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-company.png";
                        }}
                      />
                      {app.job?.company?.company_name || "Unknown"}
                    </td>
                    <td className="py-2 px-4 border-b">{app.job?.title}</td>
                    <td className="py-2 px-4 border-b max-sm:hidden">
                      {app.job?.location}
                    </td>
                    <td className="py-2 px-4 border-b max-sm:hidden">
                      {moment(app.applied_at).format("ll")}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <span
                        className={`${
                          app.status === "Accepted"
                            ? "bg-green-100"
                            : app.status === "Rejected"
                            ? "bg-red-100"
                            : "bg-blue-100"
                        } px-4 py-1.5 rounded`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Applications;
