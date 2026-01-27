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
        return <p>Загрузка...</p>;
    }

    return (
        <div>
            <h2>Users</h2>

            <table border="1" cellPadding="6" cellSpacing="0" width="100%">
                <thead>
                    <tr>
                        <th>Login</th>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Active</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map(user => (
                        <tr key={user.userId}>
                            <td>{user.login}</td>
                            <td>{user.email}</td>
                            <td>{user.userName}</td>

                            <td>
                                <select
                                    value={user.role}
                                    onChange={e => changeRole(user.userId, e.target.value)}
                                >
                                    <option value="user">user</option>
                                    <option value="manager">manager</option>
                                    <option value="admin">admin</option>
                                </select>
                            </td>

                            <td>
                                <input
                                    type="checkbox"
                                    checked={user.isActive}
                                    onChange={e => changeStatus(user.userId, e.target.checked)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUsersPage;
