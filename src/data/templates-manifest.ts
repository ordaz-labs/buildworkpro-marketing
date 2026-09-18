// Aggregates the per-slug manifests written by scripts/templates/build.mjs.
export type ManifestFile = { file: string; bytes: number; pages?: number; sheets?: string[] };
export type ManifestPreview = {
  file: string;
  webp: string;
  width: number;
  height: number;
  landscape: boolean;
};
export type ManifestEntry = {
  slug: string;
  name: string;
  basename: string;
  files: Partial<Record<'pdf' | 'example' | 'xlsx' | 'docx', ManifestFile>>;
  previews: ManifestPreview[];
};

const modules = import.meta.glob<{ default: ManifestEntry }>('./templates-manifest/*.json', {
  eager: true,
});

export const manifest: Record<string, ManifestEntry> = Object.fromEntries(
  Object.values(modules).map((m) => [m.default.slug, m.default])
);
