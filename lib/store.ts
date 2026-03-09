import { supabase } from "./supabase";

export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  tags: string[];
  link?: string;
  image_url?: string;
  visible: boolean;
  order: number;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
  logo_text: string;
  logo_image_url?: string;
  cv_url: string;
  skills_tech: string[];
  skills_soft: string[];
  experience: { role: string; company: string; period: string; bullets: string[] }[];
  education: { degree: string; school: string; period: string; detail: string }[];
  stats: { label: string; value: string }[];
}

// ── Projects ──────────────────────────────────────────────────────────────────
export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects").select("*").order("order", { ascending: true });
  if (error) throw error;
  return data as Project[];
}
export async function createProject(p: Omit<Project, "id">): Promise<Project> {
  const { data, error } = await supabase.from("projects").insert(p).select().single();
  if (error) throw error;
  return data as Project;
}
export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase.from("projects").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data as Project;
}
export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}
export async function toggleProjectVisibility(id: string, visible: boolean): Promise<void> {
  const { error } = await supabase.from("projects").update({ visible }).eq("id", id);
  if (error) throw error;
}

// ── Site Config ───────────────────────────────────────────────────────────────
export async function fetchSiteConfig(): Promise<SiteConfig> {
  const { data, error } = await supabase.from("site_config").select("*").eq("id", 1).single();
  if (error) throw error;
  return data as SiteConfig;
}
export async function updateSiteConfig(updates: Partial<SiteConfig>): Promise<SiteConfig> {
  const { data, error } = await supabase.from("site_config").update(updates).eq("id", 1).select().single();
  if (error) throw error;
  return data as SiteConfig;
}

// ── Logo upload ───────────────────────────────────────────────────────────────
export async function uploadLogo(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const { error } = await supabase.storage.from("assets").upload(`logo/logo.${ext}`, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("assets").getPublicUrl(`logo/logo.${ext}`);
  return data.publicUrl;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<boolean> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return !error;
}
export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}
export async function isAuthenticated(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}