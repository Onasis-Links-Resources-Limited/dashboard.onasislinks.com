import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/dashboard/Products";
import ProductForm from "./pages/dashboard/ProductForm";
import ProductDetails from "./pages/dashboard/ProductDetails"; // <--- NEW IMPORT
import Categories from "./pages/dashboard/Categories";
import CategoryForm from "./pages/dashboard/CategoryForm";
import Quotes from "./pages/dashboard/Quotes";
import Users from "./pages/dashboard/Users";
import Analytics from "./pages/dashboard/Analytics";
import Settings from "./pages/dashboard/Settings";
import NotFound from "./pages/errors/NotFound";
import Unauthorized from "./pages/errors/Unauthorized";
import AuthLayout from "./components/layout/AuthLayout";
import QuoteDetail from "./pages/dashboard/QuoteDetail";
import CompanySettings from "./pages/dashboard/settings/CompanySettings";
import RolesSettings from "./pages/dashboard/settings/RolesSettings";
import NotificationSettings from "./pages/dashboard/settings/NotificationSettings";
import AppearanceSettings from "./pages/dashboard/settings/AppearanceSettings";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route element={<AuthLayout />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/products" element={<Products />} />
          <Route path="/dashboard/products/add" element={<ProductForm />} />
          <Route
            path="/dashboard/products/edit/:id"
            element={<ProductForm />}
          />
          <Route path="/dashboard/products/:id" element={<ProductDetails />} />{" "}
          {/* <--- NEW ROUTE */}
          <Route path="/dashboard/categories" element={<Categories />} />
          <Route path="/dashboard/categories/add" element={<CategoryForm />} />
          <Route path="/dashboard/quotes" element={<Quotes />} />
          <Route path="/dashboard/quotes/:id" element={<QuoteDetail />} />
          <Route path="/dashboard/users" element={<Users />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/settings" element={<Settings />}>
            <Route
              index
              element={<Navigate to="/dashboard/settings/company" replace />}
            />
            <Route path="company" element={<CompanySettings />} />
            <Route path="roles" element={<RolesSettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="appearance" element={<AppearanceSettings />} />
          </Route>
        </Route>
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
