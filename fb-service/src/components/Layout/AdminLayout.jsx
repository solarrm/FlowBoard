import { Navigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const AdminLayout = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <aside style={{ width: "220px", padding: "20px", borderRight: "1px solid #ddd" }}>
                <h3>Admin Panel</h3>

                <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <Link to="/admin/users">Users</Link>
                    {/* <Link to="/admin/projects">Projects</Link> */}
                    {/* <Link to="/admin/faq">FAQ</Link> */}
                </nav>
            </aside>

            <main style={{ flex: 1, padding: "20px" }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
