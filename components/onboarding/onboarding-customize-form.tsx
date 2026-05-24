"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AvatarCustomizeLayout } from "@/components/avatar/avatar-customize-layout";
import { CharacterCreator } from "@/components/character/character-creator";
import { useToast } from "@/components/ui/toast-provider";
import {
  defaultAvatarCustomization,
  saveAvatarCustomization,
  type AvatarCustomization,
} from "@/lib/avatar-customization-storage";
import { routes } from "@/lib/routes";

export function OnboardingCustomizeForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [avatarName, setAvatarName] = useState(defaultAvatarCustomization.name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (customization: AvatarCustomization) => {
    setIsSubmitting(true);

    try {
      await saveAvatarCustomization(
        {
          ...customization,
          name: avatarName.trim() || customization.name,
        },
        { completeOnboarding: true },
      );
      toast("Avatar confirmed. Welcome to HaBit Pet!", "success");
      router.push(routes.avatar);
      router.refresh();
    } catch (saveError) {
      toast(
        saveError instanceof Error
          ? saveError.message
          : "Could not save your avatar.",
        "error",
      );
      throw saveError;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AvatarCustomizeLayout
      eyebrow="Step 2 of 2"
      title="Create your HaBit Pet"
      description="Customize your pet's look, give them a name, and confirm before entering the app."
    >
      <CharacterCreator
        initialCustomization={defaultAvatarCustomization}
        name={avatarName}
        onNameChange={setAvatarName}
        showNameField
        saveLabel={isSubmitting ? "Saving..." : "Confirm avatar"}
        isSaving={isSubmitting}
        onSave={handleSave}
      />
    </AvatarCustomizeLayout>
  );
}
