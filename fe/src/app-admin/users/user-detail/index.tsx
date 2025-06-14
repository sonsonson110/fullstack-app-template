import { useParams } from "react-router";

export default function UserDetailPage() {
  const { userId } = useParams();
  return (
    <div>
      <h1>User Detail Page {userId}</h1>
      {/* User detail content goes here */}
    </div>
  );
}
