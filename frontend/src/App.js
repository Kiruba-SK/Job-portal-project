import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Applications from "./pages/Applications";
import Home from "./pages/Home";
import ApplyJob from "./pages/ApplyJob";
import RecruiterLogin from "./components/RecruiterLogin";
import AddJob from "./pages/AddJob";
import Dashboard from "./pages/Dashboard";
import ManageJobs from "./pages/ManageJobs";
import ViewApplication from "./pages/ViewApplication";
import "quill/dist/quill.snow.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);
  return (
    <div>
      <ToastContainer position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" 
        />
      {showRecruiterLogin && (
        <RecruiterLogin onClose={() => setShowRecruiterLogin(false)} />
      )}

      <Routes>
        <Route
          path="/"
          element={<Home setShowRecruiterLogin={setShowRecruiterLogin} />}
        />{" "}
        <Route path="/apply-job/:id" element={<ApplyJob />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="add-job" element={<AddJob />} />
          <Route path="manage-jobs" element={<ManageJobs />} />
          <Route path="view-applications" element={<ViewApplication />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
