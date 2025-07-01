import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AxiosInstance from "./AxiosInstance";

const RecruiterLogin = ({ onClose }) => {
  const [state, setState] = useState("Login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(false);
  const [isTextDataSubmited, setIsTextDataSubmited] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Handle Password Reset
    if (forgotPassword) {
      try {
        await AxiosInstance.post("/reset-password/", {
          email,
          new_password: newPassword,
        });

        toast.success("Password reset successful!");
        setForgotPassword(false);
        setEmail("");
        setNewPassword("");
        setState("Login");
      } catch (error) {
        console.error(error);
        toast.error("Error resetting password");
      }
      return;
    }

    // Handle Sign Up Step 1
    if (state === "Sign Up" && !isTextDataSubmited) {
      setIsTextDataSubmited(true);
      return;
    }

    try {
      let response, data;

      if (state === "Login") {
        response = await AxiosInstance.post("/login/", { email, password });
        data = response.data;

        localStorage.setItem("recruiter", JSON.stringify(data.recruiter));
        toast.success(data.message || "Login successful!");
        navigate("/dashboard");
      } else {
        // SIGN UP API
        const formData = new FormData();
        formData.append("company_name", name);
        formData.append("email", email);
        formData.append("password", password);

        if (image) {
          formData.append("image", image);
        }

        response = await AxiosInstance.post("/sign-up/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        data = response.data;
        if (response.status === 201 || response.status === 200) {
          toast.success(data.message || "Account created successfully!");
          setState("Login"); // ✅ Go to login page after successful signup
          setIsTextDataSubmited(false);
          setName("");
          setEmail("");
          setPassword("");
          setImage(false);
        } else {
          toast.error(data.error || data.message || "Sign up failed");
        }
      }
    } catch (error) {
      console.error("Signup/Login Error: ", error);
      if (error.response && error.response.data) {
        toast.error(error.response.data.error || "Server error.");
      } else {
        toast.error("Server error. Try again later.");
      }
    }
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
                type="password"
                placeholder="New Password"
                required
              />
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
                type="password"
                placeholder="Password"
                required
              />
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
          className="bg-blue-600 w-full text-white py-2 mt-5 rounded-full"
        >
          {forgotPassword
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
