import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import { assets } from "../assets/assets";
import kconvert from "k-convert";
import moment from "moment";
import JobCard from "../components/JobCard";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import AxiosInstance from "../components/AxiosInstance";

const ApplyJob = () => {
  const { user, isSignedIn } = useUser();
  const { id } = useParams();
  const [jobData, setJobData] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [resumeURL, setResumeURL] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  const handleApply = async () => {
    if (!isSignedIn || !user) {
      toast.error("Please login first to apply.");
      return;
    }

    if (!resumeURL) {
      toast.error("Please upload your resume first.");
      return;
    }

    if (hasApplied) {
      toast.info("Already applied for this job.");
      return;
    }

    try {
      const payload = {
        user_email: user.primaryEmailAddress.emailAddress,
        user_name: user.fullName || "Anonymous",
        user_img: user.imageUrl,
        job_id: jobData._id,
        resume: resumeURL,
      };

      await AxiosInstance.post("/apply/", payload);

      toast.success("Application submitted!");
      setHasApplied(true);
    } catch (err) {
      console.error(err);
      toast.error("Error submitting application");
    }
  };

  // Fetch specific job by ID
  const fetchJobById = useCallback(async () => {
    try {
      const res = await AxiosInstance.get(`/jobs/${id}/`);
      const data = await res.data;
      setJobData(data);
    } catch (err) {
      console.error("Error fetching job:", err);
    }
  }, [id]);

  // Fetch all jobs for 'related jobs' section
  const fetchAllJobs = async () => {
    try {
      const res = await AxiosInstance.get("/jobs/");
      // if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.data;
      setAllJobs(data);
    } catch (err) {
      console.error("Error fetching all jobs:", err);
    }
  };

  const fetchResume = useCallback(async () => {
    if (!user || !jobData) return;

    try {
      const res = await AxiosInstance.get(`/user-resume/`, {
        params: { email: user.primaryEmailAddress.emailAddress },
      });
      const data = await res.data;
      setResumeURL(data?.resume || null);

      const appsRes = await AxiosInstance.get(`/user-applications/`, {
        params: { email: user.primaryEmailAddress.emailAddress },
      });

      const apps = await appsRes.data;

      if (apps.some((app) => app.job._id === jobData._id)) {
        toast.info("You've already applied for this job.");
        setHasApplied(true);
        return;
      }
    } catch (err) {
      console.error("Failed to fetch resume", err);
    }
  }, [user, jobData]);

  useEffect(() => {
    fetchJobById();
    fetchAllJobs();
  }, [fetchJobById]);

  useEffect(() => {
    if (jobData && allJobs.length > 0) {
      const related = allJobs
        .filter(
          (job) =>
            job._id !== jobData._id && job.company._id === jobData.company._id
        )
        .slice(0, 4);
      setRelatedJobs(related);
    }
  }, [jobData, allJobs]);

  useEffect(() => {
    if (isSignedIn && user && jobData) {
      fetchResume();
    }
  }, [isSignedIn, user, jobData, fetchResume]);

  if (!jobData) return <Loading />;

  return jobData ? (
    <>
      <Navbar />

      <div className="min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto">
        <div className="bg-white text-black rounded-lg w-full">
          <div className="flex justify-center md:justify-between flex-wrap gap-8 px-14 py-20 mb-6 bg-sky-50 border border-sky-400 rounded-xl">
            <div className="flex flex-col md:flex-row items-center">
              {jobData.company && (
                <img
                  className="h-24 bg-white rounded-lg p-4 mr-4 max-md:mb-4 border"
                  src={jobData.company.image}
                  alt=""
                />
              )}
              <div className="text-center md:text-left text-neutral-700">
                <h1 className="text-2xl sm:text-4xl font-medium">
                  {jobData.title}
                </h1>
                <div className="flex flex-row flex-wrap max-md:justify-center gap-y-2 gap-6 items-center text-gray-600 mt-2">
                  <span className="flex items-center gap-1">
                    <img src={assets.suitcase_icon} alt="" />
                    {jobData.company.company_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.location_icon} alt="" />
                    {jobData.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.person_icon} alt="" />
                    {jobData.company.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.money_icon} alt="" />
                    CTC:{kconvert.convertTo(jobData.salary)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center text-end text-sm max-md:mx-auto max-md:text-center">
              {hasApplied ? (
                <button
                  disabled
                  className="bg-green-600 p-2.5 px-10 text-white rounded cursor-not-allowed"
                >
                  Applied
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  className="bg-blue-600 p-2.5 px-10 text-white rounded"
                >
                  Apply Now
                </button>
              )}
              <p className="mt-2 mr-2 text-gray-600">
                Posted {moment(jobData.date).fromNow()}
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start">
            <div className="w-full lg:w-2/3 mt-6">
              <h2 className="font-bold text-2xl mb-4">Job Description</h2>
              <div
                className="rich-text "
                dangerouslySetInnerHTML={{ __html: jobData.description }}
              ></div>

              {hasApplied ? (
                <button
                  disabled
                  className="bg-green-600 p-2.5 px-10 text-white rounded cursor-not-allowed"
                >
                  Applied
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  className="bg-blue-600 p-2.5 px-10 text-white rounded"
                >
                  Apply Now
                </button>
              )}
            </div>

            {/* Right Section More Jobs */}

            <div className="w-full lg:w-1/3 mt-12 lg:mt-5 lg:ml-8  space-y-5">
              <h2>More jobs fromm {jobData.company.name}</h2>
              {relatedJobs.map((job, index) => (
                <JobCard key={index} job={job} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default ApplyJob;
