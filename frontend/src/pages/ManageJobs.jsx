import React, { useEffect, useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../components/AxiosInstance";
import { toast } from "react-toastify";

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const rec = JSON.parse(localStorage.getItem("recruiter") || "{}");
    if (!rec._id) {
      toast.error("Please login as recruiter.");
      navigate("/");
      return;
    }

    // Fetch jobs by recruiter
    AxiosInstance.get(`/jobs/?company_id=${rec._id}`)
      .then((res) => setJobs(res.data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch jobs.");
      });

    // Fetch company applications by email
    AxiosInstance.get(`/company-applications/?email=${rec.email}`)
      .then((res) => setApplications(res.data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch applications.");
      });
  }, [navigate]);

  const getApplicationCount = (jobId) => {
    return applications.filter((app) => app.job?._id === jobId).length;
  };

  const handleVisibilityToggle = async (jobId, currentVisible) => {
    try {
      const res = await AxiosInstance.patch(`/jobs/${jobId}/`, {
        visible: !currentVisible,
      });
      const updatedJob = res.data;

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job._id === jobId ? { ...job, visible: updatedJob.visible } : job
        )
      );

      toast.success("Visibility updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update visibility.");
    }
  };

  return (
    <div className="container p-8 max-w-5xl">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 max-sm:text-sm">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left max-sm:hidden">#</th>
              <th className="py-2 px-4 border-b text-left">Job Title</th>
              <th className="py-2 px-4 border-b text-left max-sm:hidden">
                Date
              </th>
              <th className="py-2 px-4 border-b text-left max-sm:hidden">
                Location
              </th>
              <th className="py-2 px-4 border-b text-center">Applications</th>
              <th className="py-2 px-4 border-b text-left">Visible</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length > 0 ? (
              jobs.map((job, index) => (
                <tr key={job._id} className="text-gray-700">
                  <td className="py-2 px-4 border-b max-sm:hidden">
                    {index + 1}
                  </td>
                  <td className="py-2 px-4 border-b">{job.title}</td>
                  <td className="py-2 px-4 border-b max-sm:hidden">
                    {moment(job.date).format("YYYY-MM-DD")}
                  </td>
                  <td className="py-2 px-4 border-b max-sm:hidden">
                    {job.location}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {getApplicationCount(job._id)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <input
                      className="scale-125 ml-4"
                      type="checkbox"
                      checked={job.visible}
                      onChange={() =>
                        handleVisibilityToggle(job._id, job.visible)
                      }
                    />
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
      <div className="mt-5 flex justify-end">
        <button
          onClick={() => navigate("/dashboard/add-job")}
          className="bg-black text-white py-2 px-4 rounded"
        >
          Add new job
        </button>
      </div>
    </div>
  );
};

export default ManageJobs;
