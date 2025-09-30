import React from "react";
import logo from "../assets/images/logo.jpg";
import bgImage from "../assets/images/bg-teal-waves.png";
function Welcome() {
  return (
    <>
      <div
        className="flex flex-col h-screen justify-center items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <img src={logo} className="rounded-full" alt="" />
        <div className="mx-auto mt-10 flex justify-center px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8">
          <div className="text-center ">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              <span className="block xl:inline">
                <span className="mb-1 block">Supreme Student Council</span>
                <span className="bg-gradient-to-r from-indigo-200 to-green-400 bg-clip-text text-transparent">
                  Event Attendance Checker
                </span>
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-lg text-white sm:mt-5 md:mt-5">
              Say goodbye to slow roll calls, errors, and proxy sign-ins—attendance is now quick, easy, and accurate.
            </p>
            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center">
              <div className="rounded-md shadow">
                <a
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-green-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 md:py-4 md:px-10 md:text-lg"
                  href="#"
                >
                  Get Registered 🚀
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Welcome;
