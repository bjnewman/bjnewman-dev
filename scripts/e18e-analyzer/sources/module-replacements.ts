import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import type { Candidate } from "../types.ts";

const require = createRequire(import.meta.url);

interface ManifestEntry {
  type: "native" | "simple" | "documented" | "none";
  moduleName: string;
  replacement?: string;
  docPath?: string;
  nodeVersion?: string;
  mdnPath?: string;
  category: string;
}

interface Manifest {
  moduleReplacements: ManifestEntry[];
}

function loadManifest(name: string): Manifest {
  const path = require.resolve(`module-replacements/manifests/${name}.json`);
  return JSON.parse(readFileSync(path, "utf-8"));
}

function normalizeEntry(entry: ManifestEntry): Candidate | null {
  if (entry.type === "none") return null;

  let replacementType: Candidate["replacementType"];
  let replacement: string;

  switch (entry.type) {
    case "native":
      replacementType = "native";
      replacement = entry.replacement ?? "native built-in";
      break;
    case "simple":
      replacementType = "simple";
      replacement = entry.replacement ?? "inline expression";
      break;
    case "documented":
      replacementType = "documented";
      replacement = entry.docPath
        ? `See module-replacements docs: ${entry.docPath}`
        : "documented alternative";
      break;
    default:
      return null;
  }

  return {
    moduleName: entry.moduleName,
    source: "module-replacements",
    replacementType,
    replacement,
    docPath: entry.docPath,
    minNodeVersion: entry.nodeVersion,
  };
}

export async function getCandidates(): Promise<Candidate[]> {
  const manifests = ["native", "micro-utilities", "preferred"];
  const candidates: Candidate[] = [];

  for (const name of manifests) {
    const manifest = loadManifest(name);
    for (const entry of manifest.moduleReplacements) {
      const candidate = normalizeEntry(entry);
      if (candidate) candidates.push(candidate);
    }
  }

  return candidates;
}
