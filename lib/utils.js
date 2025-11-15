import { interviewCovers, mappings } from "@/constants";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key];
};

// Cache for icon existence checks (in-memory cache)
const iconCache = new Map();

const checkIconExists = async (url) => {
  // Check cache first
  if (iconCache.has(url)) {
    return iconCache.get(url);
  }

  try {
    const response = await fetch(url, { 
      method: "HEAD",
      cache: "force-cache", // Use browser cache when available
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    const exists = response.ok;
    // Cache the result (positive for 1 hour, negative for 5 minutes)
    iconCache.set(url, exists);
    setTimeout(() => iconCache.delete(url), exists ? 3600000 : 300000);
    return exists;
  } catch {
    // Cache negative result for shorter time
    iconCache.set(url, false);
    setTimeout(() => iconCache.delete(url), 300000);
    return false;
  }
};

export const getTechLogos = async (techArray) => {
  // Handle undefined, null, or non-array inputs
  if (!techArray || !Array.isArray(techArray) || techArray.length === 0) {
    return [];
  }

  // Deduplicate tech stack
  const uniqueTechs = [...new Set(techArray.map(t => t.trim()))];

  const logoURLs = uniqueTechs.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: normalized 
        ? `${techIconBaseURL}/${normalized}/${normalized}-original.svg`
        : "/tech.svg",
    };
  });

  // Batch check icons in parallel with timeout
  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: url === "/tech.svg" ? url : (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

// Cache interview cover per interview ID to ensure consistency
const interviewCoverCache = new Map();

export const getRandomInterviewCover = (interviewId = null) => {
  // If interviewId provided, return consistent cover for that interview
  if (interviewId && interviewCoverCache.has(interviewId)) {
    return interviewCoverCache.get(interviewId);
  }

  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  const cover = `/covers${interviewCovers[randomIndex]}`;
  
  // Cache for this interview
  if (interviewId) {
    interviewCoverCache.set(interviewId, cover);
  }
  
  return cover;
};
