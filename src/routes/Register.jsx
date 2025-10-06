import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../assets/api";
import bgImage from "../assets/images/bg-teal-waves.png";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    username: "",
    password: "",
    year_lvl: "",
    course: "",
  });

  const [repeatPassword, setRepeatPassword] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRepeatPassword = (e) => {
    setRepeatPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== repeatPassword) return;

    try {
      // eslint-disable-next-line no-unused-vars
      const res = await api.post("/api/register/", formData);

      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: "Registered Successfully!",
        text: "Redirecting to login...",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.data.username) {
          Swal.fire({
            toast: true,
            position: "bottom-end",
            icon: "error",
            title: "School ID Already Exists",
            text: "This School ID is already registered. Please use another one.",
            showConfirmButton: true, // 👈 show close button
            allowOutsideClick: true, // 👈 dismiss on outside click
            timer: undefined, // 👈 no auto close
          });
        } else {
          let msg = Object.values(err.response.data).join(" ");
          Swal.fire({
            toast: true,
            position: "bottom-end",
            icon: "error",
            title: "Oops!",
            text: msg,
            showConfirmButton: true,
            allowOutsideClick: true,
            timer: undefined,
          });
        }
      } else {
        Swal.fire({
          toast: true,
          position: "bottom-end",
          icon: "error",
          title: "Oops!",
          text: "Registration failed!",
          showConfirmButton: true,
          allowOutsideClick: true,
          timer: undefined,
        });
      }
    }
  };

  const passwordsMatch =
    formData.password.length > 0 &&
    repeatPassword.length > 0 &&
    formData.password === repeatPassword;

  return (
    <div
      className="flex flex-col justify-center items-center bg-white px-8 bg-cover"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="mx-auto flex w-full flex-col justify-center">
        <div className="my-auto mb-auto mt-8 flex flex-col">
          <div>
            <p className="text-[32px] font-bold text-white">Register</p>
            <p className="mb-12 mt-2.5 font-normal text-white text-xs">
              {" "}
              Enter your credentials to get started!
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="grid gap-2">
              <label className="text-white">Full Name</label>
              <input
                className="mb-2 h-full min-h-[44px] w-full rounded-lg border border-white px-4 py-3 text-sm placeholder:text-white"
                type="text"
                name="first_name"
                placeholder="Juan Dela Cruz"
                value={formData.first_name}
                onChange={handleChange}
              />

              <label className="text-white">Year Level</label>
              <select
                className="mb-2 h-full min-h-[44px] w-full rounded-lg border border-white px-4 py-3 text-sm bg-transparent text-white focus:text-white"
                name="year_lvl"
                value={formData.year_lvl}
                onChange={handleChange}
              >
                <option value="" className="text-black">
                  Select Year
                </option>
                <option value="1st Year" className="text-black">
                  1st Year
                </option>
                <option value="2nd Year" className="text-black">
                  2nd Year
                </option>
                <option value="3rd Year" className="text-black">
                  3rd Year
                </option>
                <option value="4th Year" className="text-black">
                  4th Year
                </option>
              </select>

              <label className="text-white">Course</label>
              <select
                className="mb-2 h-full min-h-[44px] w-full rounded-lg border border-white px-4 py-3 text-sm bg-transparent text-white focus:text-white"
                name="course"
                value={formData.course}
                onChange={handleChange}
              >
                <option value="" className="text-black">
                  Select Course
                </option>
                <option value="BSIT" className="text-black">
                  BSIT
                </option>
                <option value="BSCS" className="text-black">
                  BSCS
                </option>
                <option value="BSECE" className="text-black">
                  BSECE
                </option>
                <option value="BSCE" className="text-black">
                  BSCE
                </option>
              </select>

              <label className="text-white">School ID</label>
              <input
                className="mb-2 h-full min-h-[44px] w-full rounded-lg border border-white px-4 py-3 text-sm placeholder:text-white"
                type="text"
                name="username"
                placeholder="2023123456"
                value={formData.username}
                onChange={handleChange}
              />

              <label className="text-white">Password</label>
              <input
                className="mb-2 h-full min-h-[44px] w-full rounded-lg border border-white px-4 py-3 text-sm placeholder:text-white"
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
              />

              <label className="text-white">Repeat Password</label>
              <input
                className={`mb-2 h-full min-h-[44px] w-full rounded-lg border px-4 py-3 text-sm placeholder:text-white ${
                  repeatPassword && !passwordsMatch
                    ? "border-red-500"
                    : "border-white"
                }`}
                type="password"
                placeholder="********"
                value={repeatPassword}
                onChange={handleRepeatPassword}
              />

              {!passwordsMatch && repeatPassword.length > 0 && (
                <p className="text-red-400 text-sm">Passwords do not match</p>
              )}

              <button
                type="submit"
                disabled={!passwordsMatch}
                className={`mt-2 w-full rounded-lg px-4 py-4 text-sm font-medium ${
                  passwordsMatch
                    ? "bg-white text-green-700 hover:bg-green-600/90"
                    : "bg-gray-400 text-gray-700 cursor-not-allowed"
                }`}
              >
                Register
              </button>
              <p className="mt-4 text-white">
                Already have an account?{" "}
                <Link to={"/login"} className="font-bold text-green-200">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
