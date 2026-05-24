import { CharacterCreator } from "@/components/character/character-creator";

export default function CharacterCreatorPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">
          Character Creation
        </h1>
        <CharacterCreator />
      </div>
    </main>
  );
}
