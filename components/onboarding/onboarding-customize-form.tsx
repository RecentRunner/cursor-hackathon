"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CharacterCreator } from "@/components/character/character-creator";
import { useToast } from "@/components/ui/toast-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      toast("Avatar confirmed. Welcome to Habit Pet!", "success");
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
    <div className="min-h-svh bg-background">
      <main className="mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-4 py-10">
        <div className="mb-8 space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Step 2 of 2
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Create your Habit Pet
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Customize your pet&apos;s look, give them a name, and confirm before
            entering the app.
          </p>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Avatar customization</CardTitle>
            <CardDescription>
              Pick styles and colors for each layer. You can change these later
              from the Pet tab.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CharacterCreator
              initialCustomization={defaultAvatarCustomization}
              name={avatarName}
              onNameChange={setAvatarName}
              showNameField
              saveLabel={isSubmitting ? "Saving..." : "Confirm avatar"}
              isSaving={isSubmitting}
              onSave={handleSave}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
