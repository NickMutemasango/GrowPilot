import type { Metadata } from "next";
import { InstructorProfileForm } from "@/components/instructor/InstructorProfileForm";
import { requireInstructor } from "@/lib/instructor/service";
import { getFileStorage } from "@/lib/instructor/store";

export const metadata: Metadata = { title: "Instructor Profile" };

export default async function InstructorProfilePage() {
  const { instructor } = await requireInstructor("/instructor/profile");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Instructor Profile</h1>
        <p className="mt-2 text-xl text-ink-muted">Students see this on your course pages.</p>
      </header>
      <InstructorProfileForm
        initial={{ fullName: instructor.name, title: instructor.title, bio: instructor.bio, expertise: [], photo: null }}
        uploadsAvailable={getFileStorage() !== null}
      />
    </div>
  );
}
