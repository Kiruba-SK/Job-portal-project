import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AxiosInstance from "./AxiosInstance";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RecruiterLogin = ({ onClose }) => {
  const [state, setState] = useState("Login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(false);
  const [isTextDataSubmited, setIsTextDataSubmited] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const validateInputs = () => {
    if (!email.includes("@")) {
      toast.error("Enter a valid email address");
      return false;
    }
    if ((forgotPassword ? newPassword : password).length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!validateInputs()) return;

    setLoading(true);

    try {
      let response;

      // Handle Password Reset
      if (forgotPassword) {
        response = await AxiosInstance.post("/reset-password/", {
          email,
          new_password: newPassword,
        });

        toast.success("Password reset successful!");
        setForgotPassword(false);
        setEmail("");
        setNewPassword("");
        setState("Login");
        setLoading(false);

        return;
      }

      // Handle Sign Up Step 1
      if (state === "Sign Up" && !isTextDataSubmited) {
        setIsTextDataSubmited(true);
        setLoading(false);
        return;
      }

      if (state === "Login") {
        response = await AxiosInstance.post("/login/", { email, password });
        const data = response.data;

        localStorage.setItem("recruiter", JSON.stringify(data.recruiter));
        toast.success(data.message || "Login successful!");
        navigate("/dashboard");
      } else {
        if (!image) {
          toast.error("Please upload your company logo");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("company_name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("image", image);

        response = await AxiosInstance.post("/sign-up/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 201 || response.status === 200) {
          const msg = response.data?.message || "Account created successfully!";
          toast.success(msg);
          setState("Login");
          setIsTextDataSubmited(false);
          setName("");
          setEmail("");
          setPassword("");
          setImage(false);
          const fileInput = document.getElementById("image");
          if (fileInput) fileInput.value = null;
        } else {
          toast.error("Sign up failed");
        }
      }
    } catch (error) {
      const status = error.response?.status;
      const errData = error.response?.data;
      console.error("Signup error:", status, errData);

      if (status === 400) {
        toast.error(errData?.error || "Invalid input.");
      } else if (status === 401) {
        toast.error(errData?.error || "Invalid credentials.");
      } else if (status === 404) {
        toast.error("User does not exist");
      } else if (error.code === "ECONNABORTED") {
        toast.error("Request timed out. Try again.");
      } else {
        toast.error("Network/server error. Please try again later.");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0  z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center">
      <form
        onSubmit={onSubmitHandler}
        className="relative bg-white p-10 rounded-xl text-slate-500"
      >
        <h1 className="text-center text-2xl text-neutral-700 font-medium">
          Recruiter {state}
        </h1>
        <p className="text-sm">
          {forgotPassword
            ? "Enter your email to reset password"
            : "Welcome back! Please sign in to continue"}
        </p>

        {/* FORGOT PASSWORD FIELDS */}
        {forgotPassword && (
          <>
            <div className="border px-4 py-2 flex items-center gap-2 rounded-full mt-5">
              <img src={assets.email_icon} alt="" />
              <input
                className="outline-none text-sm"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Registered Email"
                required
              />
            </div>
            <div className="border px-4 py-2 flex items-center gap-2 rounded-full mt-5">
              <img src={assets.lock_icon} alt="" />
              <input
                className="outline-none text-sm"
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                required
              />
              <span
                className="cursor-pointer text-gray-500 hover:text-gray-800"
                onClick={() => setShowNewPassword((prev) => !prev)}
              >
                {showPassword ?  <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </>
        )}

        {/* Sign Up Step 2: Upload Image */}
        {!forgotPassword && state === "Sign Up" && isTextDataSubmited && (
          <>
            <div className="flex items-center gap-4 my-10">
              <label htmlFor="image">
                <img
                  className="w-16 rounded-full"
                  src={image ? URL.createObjectURL(image) : assets.upload_area}
                  alt="Upload"
                />
                <input
                  onChange={(e) => setImage(e.target.files[0])}
                  type="file"
                  id="image"
                  hidden
                />
              </label>
              <p>
                Upload Company <br /> logo
              </p>
            </div>
          </>
        )}

        {/* Email, Password, Name Fields */}
        {!forgotPassword && (!isTextDataSubmited || state === "Login") && (
          <>
            {state === "Sign Up" && (
              <div className="border px-4 py-2 flex items-center gap-2 rounded-full mt-5">
                <img src={assets.person_icon} alt="" />
                <input
                  className="outline-none text-sm"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  placeholder="Company Name"
                  required
                />
              </div>
            )}

            <div className="border px-4 py-2 flex items-center gap-2 rounded-full mt-5">
              <img src={assets.email_icon} alt="" />
              <input
                className="outline-none text-sm"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Email Id"
                required
              />
            </div>

            <div className="border px-4 py-2 flex items-center gap-2 rounded-full mt-5">
              <img src={assets.lock_icon} alt="" />
              <input
                className="outline-none text-sm"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
              />
              <span
                className="cursor-pointer text-gray-500 hover:text-gray-800"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ?  <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </>
        )}

        {/* FORGOT PASSWORD LINK */}
        {state === "Login" && !forgotPassword && (
          <p
            className="text-sm underline text-gray-600  mt-4 cursor-pointer text-center"
            onClick={() => setForgotPassword(true)}
          >
            Forgot password?
          </p>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 w-full text-white py-2 mt-5 rounded-full ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading
            ? "Please wait..."
            : forgotPassword
            ? "Reset Password"
            : state === "Login"
            ? "Login"
            : isTextDataSubmited
            ? "Create Account"
            : "Next"}
        </button>

        {/* TOGGLE LOGIN / SIGN UP */}
        {!forgotPassword && (
          <p className="mt-5 text-center">
            {state === "Login" ? (
              <>
                Don't have an account?{" "}
                <span
                  className="text-blue-600 cursor-pointer underline"
                  onClick={() => {
                    setState("Sign Up");
                    setIsTextDataSubmited(false);
                  }}
                >
                  Sign Up
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  className="text-blue-600 cursor-pointer underline"
                  onClick={() => {
                    setState("Login");
                    setIsTextDataSubmited(false);
                  }}
                >
                  Login
                </span>
              </>
            )}
          </p>
        )}

        {/* CLOSE MODAL */}
        <img
          onClick={onClose}
          className="absolute top-6 right-6 cursor-pointer"
          src={assets.cross_icon}
          alt="Close"
        />
      </form>
    </div>
  );
};

export default RecruiterLogin;
