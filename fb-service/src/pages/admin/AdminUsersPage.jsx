import { useEffect, useState } from "react";
import adminService from "../../services/adminService";

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        setLoading(true);
        const data = await adminService.getUsers();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const changeRole = async (userId, role) => {
        await adminService.updateUserRole(userId, role);
        loadUsers();
    };

    const changeStatus = async (userId, isActive) => {
        await adminService.updateUserStatus(userId, isActive);
        loadUsers();
    };

    if (loading) {
        return <p className="text-gray-500">Загрузка...</p>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-2xl font-semibold">Users</h1>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3 text-left">Login</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Role</th>
                            <th className="px-4 py-3 text-left">Active</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map(user => (
                            <tr
                                key={user.userId}
                                className="border-t border-gray-200 dark:border-slate-800"
                            >
                                <td className="px-4 py-3">{user.login}</td>
                                <td className="px-4 py-3">{user.email}</td>
                                <td className="px-4 py-3">{user.userName}</td>

                                <td className="px-4 py-3">
                                    <select
                                        value={user.role}
                                        onChange={e =>
                                            changeRole(user.userId, e.target.value)
                                        }
                                        className="
                                            rounded-md border
                                            border-gray-300 dark:border-slate-700
                                            bg-white dark:bg-slate-900
                                            text-gray-900 dark:text-gray-100
                                            px-2 py-1
                                        "
                                    >
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </td>

                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={user.isActive}
                                        onChange={e =>
                                            changeStatus(user.userId, e.target.checked)
                                        }
                                        className="h-4 w-4 accent-blue-600"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsersPage;