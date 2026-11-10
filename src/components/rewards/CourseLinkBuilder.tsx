"use client";

import { useId, useState } from "react";
import { CopyLinkField } from "./CopyLinkField";

type CourseLinkBuilderProps = {
  siteUrl: string;
  code: string;
  courses: { slug: string; title: string }[];
};

/** Pick one course and get an affiliate link straight to its page. */
export function CourseLinkBuilder({ siteUrl, code, courses }: CourseLinkBuilderProps) {
  const selectId = useId();
  const [slug, setSlug] = useState(courses[0]?.slug ?? "");
  const course = courses.find((item) => item.slug === slug);
  if (!course) return null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor={selectId} className="text-base font-semibold text-ink">
          Choose a course
        </label>
        <select
          id={selectId}
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          className="mt-2 block min-h-12 w-full rounded-xl border-2 border-line bg-surface px-4 text-base text-ink"
        >
          {courses.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.title}
            </option>
          ))}
        </select>
      </div>
      <CopyLinkField
        link={`${siteUrl}/courses/${course.slug}?ref=${code}`}
        label={`Your link for ${course.title}`}
        copyLabel="Copy Course Link"
        shareText={`Take a look at "${course.title}" on GrowPilot Academy.`}
      />
    </div>
  );
}
