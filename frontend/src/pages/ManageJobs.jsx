import React, { useEffect, useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const rec = JSON.parse(localStorage.getItem("recruiter") || "{}");
    if (!rec._id) return alert("Please login");

    fetch(`http://127.0.0.1:8000/jobs/?company_id=${rec._id}`)
      .then((r) => r.json())
      .then(setJobs)
      .catch(console.error);

    fetch(`http://localhost:8000/company-applications/?email=${rec.email}`)
      .then((res) => res.json())
      .then(setApplications)
      .catch(console.error);
  }, []);

  const getApplicationCount = (jobId) => {
    return applications.filter((app) => app.job?._id === jobId).length;
  };

  const handleVisibilityToggle = (jobId, currentVisible) => {
    fetch(`http://127.0.0.1:8000/jobs/${jobId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ visible: !currentVisible }),
    })
      .then((res) => res.json())
      .then((updatedJob) => {
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job._id === jobId ? { ...job, visible: updatedJob.visible } : job
          )
        );
      })
      .catch(console.error);
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
            {jobs.map((job, index) => (
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
                  <input className="scale-125 ml-4" type="checkbox" checked={job.visible} onChange={() => handleVisibilityToggle(job._id, job.visible)}/>
                </td>
              </tr>
            ))}
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
