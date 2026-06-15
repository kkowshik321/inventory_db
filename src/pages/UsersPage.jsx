function UsersPage() {
  const users = [
    { name: "John Doe", email: "john@inventory.com", role: "USER" },
    { name: "Maya Patel", email: "maya@inventory.com", role: "USER" },
    { name: "System Administrator", email: "admin@inventory.com", role: "ADMIN" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((user) => (
          <div key={user.email} className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="inline-block mt-4 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
              {user.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UsersPage;
