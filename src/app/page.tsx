"use client"

import { UserButton } from "@/features/auth/components/user-button";



export default function Home() {

  return (
   
      <div className="flex items-center gap-x-2">
        <UserButton />
      </div>
  );
}
