import { Routes, Route, Navigate } from "react-router-dom";
// import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/dashboard/Products";
import Categories from "./pages/dashboard/Categories";
import Quotes from "./pages/dashboard/Quotes";
import QuoteDetail from "./pages/dashboard/QuoteDetail";
import Users from "./pages/dashboard/Users";
import Analytics from "./pages/dashboard/Analytics";
import Settings from "./pages/dashboard/Settings";
import NotFound from "./pages/errors/NotFound";
import Unauthorized from "./pages/errors/Unauthorized";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      {/* <Route element={<AuthLayout />}> */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/products" element={<Products />} />
        <Route path="/dashboard/categories" element={<Categories />} />
        <Route path="/dashboard/quotes" element={<Quotes />} />
        <Route path="/dashboard/quotes/:id" element={<QuoteDetail />} />
        <Route path="/dashboard/users" element={<Users />} />
        <Route path="/dashboard/analytics" element={<Analytics />} />
        <Route path="/dashboard/settings" element={<Settings />} />
      </Route>
      {/* </Route> */}

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
