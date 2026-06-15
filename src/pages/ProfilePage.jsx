export default function ProfilePage() {

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  return (

    <div className="p-10">

      <div className="bg-white rounded-3xl p-8 shadow">

        <h1 className="text-4xl font-bold">

          {user.fullName}

        </h1>

        <p>{user.email}</p>

        <p>

          Role :
          {user.role?.roleName}
        </p>

      </div>

    </div>
  );
}