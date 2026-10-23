import { requireUser, isOrganizer } from "@/lib/auth";
import { ProfileForm } from "@/components/ProfileForms";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  return (
    <div className="container-page max-w-2xl py-12">
      <h1 className="text-3xl font-semibold">Your profile</h1>
      <div className="card mt-6 p-6">
        <ProfileForm user={user} organizer={isOrganizer(user)} />
      </div>
    </div>
  );
}
