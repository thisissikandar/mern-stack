import Home from "./components/Home.jsx";
import Login from "./components/Login";
import About from "./components/About.jsx";
import Contact from "./components/Contact.jsx";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { AuthHome } from "./components/auth/AuthHome.jsx";
import { AuthLogin } from "./components/auth/AuthLogin.jsx";
import { PageNotFound } from "./components/PageNotFound.jsx";
import Layout from "./Layout.jsx";

const allPages = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthHome>
        <Layout />
      </AuthHome>
    ),
    errorElement: <PageNotFound/>,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <AuthLogin>
        <Login />
      </AuthLogin>
    ),
  },
]);

const App = () => {
  return (
    <>
      <RouterProvider router={allPages} />
    </>
  );
};

export default App;
