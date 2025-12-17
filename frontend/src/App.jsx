import React from "react";
import LoginForm from "./components/LoginForm";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CustomerDashboard from "./components/CustomerDashboard";
import LoginSignup from "./components/LoginForm";
import LandingPage from "./pages/LandingPage";
import ReceptionDashboard from "./components/ReceptionDashboard";
import AccountantPage from "./components/AccountantPage";
import AdminPage from "./components/AdminPage";

export default function App() {
  const pageRoute = createBrowserRouter([
    {
      path: "/customerdashboard",
      element: <CustomerDashboard />,
    },
    {
      path: "/receptiondashboard",
      element: <ReceptionDashboard />,
    },
    {
      path: "/createaccount",
      element: <LoginSignup />,
    },
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "/accountantdashboard",
      element: <AccountantPage />,
    },
    {
      path: "/adminpage",
      element: <AdminPage />,
    },
  ]);
  return (
    <div className="text-4xl">
      <RouterProvider router={pageRoute} />
    </div>
  );
}
