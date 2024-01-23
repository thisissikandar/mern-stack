import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";

const Layout = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="flex w-screen h-screen">
        <div className=" bg-slate-900 w-80 h-screen p-3 text-green-300 flex flex-col gap-3">
        <Link to="/" className="flex items-center mx-auto">
            <img
              src="https://alexharkness.com/wp-content/uploads/2020/06/logo-2.png"
              className="mr-3 h-12"
              alt="Logo"
            />
          </Link>
          <nav>
            <ul className="flex flex-col gap-4 text-center text-xl font-semibold">
            <NavLink
              to="/"
              className={({ isActive }) =>`${
                isActive ? " bg-orange-500" : "bg-gray-600"
              } py-2 pr-4 pl-3 duration-200 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>` ${
                  isActive ? " bg-orange-500" : "bg-gray-600"
                } py-2 pr-4 pl-3 duration-200 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
              }
            >
              About
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>` ${isActive ? " bg-orange-500" : "bg-gray-600" }
                   py-2 pr-4 pl-3 duration-200 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
              }
            >
              Contact
            </NavLink>
            </ul>
          </nav>
        </div>

        <div className="flex-1 bg-emerald-800">
          <div className=" bg-teal-600 flex items-center h-14 justify-end pr-4">
            <button
              onClick={() => {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                if (!localStorage.getItem("accessToken") && !localStorage.removeItem("refreshToken")) {
                  navigate("/login");
                }
              }}
              className="bg-orange-500 p-2 rounded-md text-sm text-white hover:bg-orange-300"
            >
              Logout
            </button>
          </div>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
