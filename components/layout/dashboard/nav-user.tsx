import { auth } from "@/features/auth/auth";

import { NavUserDropdown } from "./nav-user-dropdown";

export async function NavUser() {
  const session = await auth();
  const user = session?.user;

  return <NavUserDropdown user={user} />;
}
