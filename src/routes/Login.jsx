import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../assets/api";
import bgImage from "../assets/images/bg-teal-waves.png";
import logo from "../assets/images/logo.jpg";
function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/login/", formData);

      Swal.fire({
        toast: true,
        position: "bottom",
        icon: "success",
        title: "Login successful!",
        showConfirmButton: false,
        timer: 2000,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: res.data.id,
          username: res.data.username,
          email: res.data.email,
          first_name: res.data.first_name,
          last_name: res.data.last_name,
          is_staff: res.data.is_staff,
          is_superuser: res.data.is_superuser,
        })
      );

      navigate("/home");
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "bottom",
        icon: "error",
        title: "Invalid username or password",
        showConfirmButton: true,
        timer: undefined,
      });
    }
  };

  return (
    <div
      className="flex flex-col justify-center items-center bg-white px-8 bg-cover h-screen"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="mx-auto flex w-full flex-col justify-center px-5 lg:max-w-[400px]">
        <img src={logo} className="w-16 h-16 rounded-full" alt="" />
        <p className="text-[32px] font-bold text-white">Sign In</p>
        <p className="mb-4 mt-2 font-normal text-zinc-200">
          Enter your School ID and password to sign in
        </p>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <label className="text-white" htmlFor="username">
            School ID
          </label>
          <input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your School ID"
            type="text"
            autoComplete="username"
            className="mb-2 h-[44px] w-full rounded-lg border border-zinc-200 px-4 text-sm font-medium  focus:outline-0 bg-transparent text-white"
          />

          <label className="text-white" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            className="mb-2 h-[44px] w-full rounded-lg border border-zinc-200 px-4 text-sm font-medium  focus:outline-0 bg-transparent text-white"
          />

          <button
            className="bg-green-500 hover:bg-green-500/90 mt-3 flex h-[44px] w-full items-center justify-center rounded-lg text-sm font-medium"
            type="submit"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-white">
          Dont have an account?{" "}
          <Link to={"/register"} className="font-bold text-green-200">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
