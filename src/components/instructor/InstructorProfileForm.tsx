"use client";

import { useState } from "react";
import { CircleCheck, Info, Plus, Save, X } from "lucide-react";
import { saveProfileAction } from "@/app/instructor/actions";
import { Button } from "@/components/ui/Button";
import type { InstructorProfile } from "@/types/instructor";
import { TextArea, TextField } from "./fields";
import { ThumbnailUpload } from "./uploads/ThumbnailUpload";

type InstructorProfileFormProps = {
  initial: InstructorProfile;
  uploadsAvailable: boolean;
};

/** The instructor's public profile, edited by the instructor. */
export function InstructorProfileForm({ initial, uploadsAvailable }: InstructorProfileFormProps) {
  return <ProfileForm initial={initial} uploadsAvailable={uploadsAvailable} />;
}

function ProfileForm({ initial, uploadsAvailable }: InstructorProfileFormProps) {
  const [profile, setProfile] = useState(initial);
  const [skill, setSkill] = useState("");
  const [nameError, setNameError] = useState<string>();
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const update = (changes: Partial<InstructorProfile>) => setProfile((current) => ({ ...current, ...changes }));

  const addSkill = () => {
    const value = skill.trim();
    if (!value || profile.expertise.includes(value) || profile.expertise.length >= 8) return;
    update({ expertise: [...profile.expertise, value] });
    setSkill("");
  };

  const save = async () => {
    if (!profile.fullName.trim()) {
      setNameError("Please enter your full name.");
      return;
    }
    setNameError(undefined);
    setSaving(true);
    try {
      const result = await saveProfileAction({ ...profile, photo: profile.photo && { ...profile.photo, url: profile.photo.uploaded ? profile.photo.url : null } });
      setNotice({ ok: result.ok, text: result.message });
    } catch {
      setNotice({ ok: false, text: "We couldn't save your profile. Please check your internet connection and try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-8">
      <ThumbnailUpload
        label="Profile picture"
        hint="A clear photo of your face helps students feel at ease."
        shape="round"
        value={profile.photo}
        onChange={(photo) => update({ photo })}
        uploadsAvailable={uploadsAvailable}
      />
      <TextField label="Full name" value={profile.fullName} onChange={(fullName) => update({ fullName })} error={nameError} maxLength={80} />
      <TextField label="Professional title" value={profile.title} onChange={(title) => update({ title })} placeholder="e.g. Digital skills tutor" maxLength={80} />
      <TextArea
        label="Short biography"
        value={profile.bio}
        onChange={(bio) => update({ bio })}
        rows={5}
        maxLength={600}
        hint="Describe how you teach and who you help. Only mention qualifications you can show if asked."
      />

      <fieldset className="min-w-0">
        <legend className="text-lg font-semibold text-ink">Areas of expertise</legend>
        <p className="text-base text-ink-muted">Up to 8 short topics, for example &ldquo;Microsoft Word&rdquo;.</p>
        {profile.expertise.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {profile.expertise.map((item) => (
              <li key={item} className="inline-flex items-center gap-1 rounded-full bg-secondary pr-0.5 pl-3 text-base font-semibold text-primary-strong">
                {item}
                <button
                  type="button"
                  aria-label={`Remove ${item}`}
                  onClick={() => update({ expertise: profile.expertise.filter((value) => value !== item) })}
                  className="inline-flex size-11 items-center justify-center rounded-full hover:bg-secondary-hover"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex gap-2">
          <input
            aria-label="New area of expertise"
            value={skill}
            maxLength={40}
            onChange={(event) => setSkill(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addSkill();
              }
            }}
            className="h-12 min-w-0 flex-1 rounded-xl border-2 border-line bg-surface px-4 text-lg text-ink focus:border-primary"
          />
          <Button variant="secondary" onClick={addSkill} disabled={profile.expertise.length >= 8}>
            <Plus aria-hidden="true" className="size-5" />
            Add
          </Button>
        </div>
      </fieldset>

      <div role="status" className="empty:hidden">
        {notice && (
          <p className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-base ${notice.ok ? "border-primary bg-secondary text-primary-strong" : "border-accent bg-accent/15 text-ink"}`}>
            {notice.ok ? <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" /> : <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0" />}
            {notice.text}
          </p>
        )}
      </div>
      <Button size="lg" className="w-full sm:w-auto sm:self-start" onClick={save} disabled={saving}>
        <Save aria-hidden="true" className="size-5" />
        Save Profile
      </Button>
    </div>
  );
}
