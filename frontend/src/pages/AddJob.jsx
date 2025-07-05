import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import { useNavigate } from "react-router-dom";
import { JobCategories, JobLocations } from "../assets/assets";
import { toast } from "react-toastify";
import AxiosInstance from "../components/AxiosInstance";

const AddJob = () => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Bangalore");
  const [category, setCategory] = useState("Programming");
  const [level, setLevel] = useState("Beginer Level");
  const [salary, setSalary] = useState(0);
  const navigate = useNavigate();

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    // Initiate Quill only once
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
      });
    }
  }, []);

  const handleAddJob = async (e) => {
    e.preventDefault();

    const recruiter = JSON.parse(localStorage.getItem("recruiter"));
    const companyId = recruiter?._id;

    if (!companyId) {
      toast.info("You must have recruiter privileges to post a job.");
      return;
    }

    const description = quillRef.current.root.innerHTML;
    if (quillRef.current.getText().trim() === "") {
      toast.error("Job description cannot be empty.");
      return;
    }

    const jobData = {
      title,
      location,
      level,
      company_id: Number(companyId),
      description,
      salary: parseInt(salary),
      date: new Date().toISOString(),
      category,
    };

    try {
      await AxiosInstance.post("/jobs/", jobData);

      toast.success("Job created successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error:", err);
      toast.error(
        err.response?.data?.error || "Failed to post job. Please try again."
      );
    }
  };

  return (
    <form
      className="conatiner p-4 sm:p-8 flex flex-col w-full items-start gap-3 text-sm sm:text-base"
      onSubmit={handleAddJob}
    >
      <div className="w-full">
        <p className="mb-2">Job Title</p>
        <input
          type="text"
          placeholder="Type here"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          required
          className="w-full max-w-lg px-3 py-2 border-2 border-gray-300 rounded"
        />
      </div>

      <div className="w-full max-w-lg">
        <p className="my-2">Job Description</p>
        <div ref={editorRef}></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="my-2">Job Category</p>
          <select
            className="w-full px-3 py-2 border-2 border-gray-300 rounded text-gray-800"
            onChange={(e) => setCategory(e.target.value)}
          >
            {JobCategories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="my-2">Job Location</p>
          <select
            className="w-full px-3 py-2 border-2 border-gray-300 rounded text-gray-800"
            onChange={(e) => setLocation(e.target.value)}
          >
            {JobLocations.map((location, index) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="my-2">Job Level</p>
          <select
            className="w-full px-3 py-2 border-2 border-gray-300 rounded text-gray-800"
            onChange={(e) => setLevel(e.target.value)}
          >
            {/* <option className="" value=""></option> */}
            <option value="Beginner level">Beginner level</option>
            <option value="Intermediate level">Intermediate level</option>
            <option value="Senior level">Senior level</option>
          </select>
        </div>
      </div>

      <div>
        <p className="my-2">Job Salary</p>
        <input
          min={0}
          className="w-full px-3 py-2 border-2 border-gray-300 rounded sm:w-[120px]"
          onChange={(e) => setSalary(e.target.value)}
          type="number"
          placeholder="2500"
        />
      </div>

      <button className="w-28 py-3 mt-4 bg-black text-white rounded">
        ADD
      </button>
    </form>
  );
};

export default AddJob;
