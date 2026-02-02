import { Navigate, Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const AdminLayout = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user.role !== "admin") return <Navigate to="/" replace />;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
            <aside className="w-60 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-6">
                <h2 className="mb-8 text-lg font-semibold">
                    Admin Panel
                </h2>

                <nav className="flex flex-col gap-2">
                    <AdminLink to="/admin/users" label="Users" />
                    <AdminLink to="/admin/faq" label="FAQ" />
                </nav>
            </aside>

            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
};

const AdminLink = ({ to, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `
            px-3 py-2 rounded-md text-sm font-medium transition
            ${isActive
                ? "bg-blue-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"}
            `
        }
    >
        {label}
    </NavLink>
);

export default AdminLayout;