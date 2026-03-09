import { supabase } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface BlogPhoto {
  id: string;
  image_url: string;
  caption?: string;
  order: number;
  visible: boolean;
  created_at?: string;
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
  profile_image_url?: string;
  skills_tech: string[];
  skills_soft: string[];
  experience: { role: string; company: string; period: string; bullets: string[] }[];
  education: { degree: string; school: string; period: string; detail: string }[];
  stats: { label: string; value: string }[];
  hobbies: { icon: string; label: string }[];
  music: { title: string; artist: string; genre: string }[];
  movies: { title: string; year: string; genre: string }[];
  personal_quote: string;
  personal_quote_author: string;
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from("projects").select("*").order("order", { ascending: true });
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

// ─── Blog Photos ──────────────────────────────────────────────────────────────
export async function fetchBlogPhotos(): Promise<BlogPhoto[]> {
  const { data, error } = await supabase.from("blog_photos").select("*").order("order", { ascending: true });
  if (error) throw error;
  return data as BlogPhoto[];
}
export async function createBlogPhoto(p: Omit<BlogPhoto, "id" | "created_at">): Promise<BlogPhoto> {
  const { data, error } = await supabase.from("blog_photos").insert(p).select().single();
  if (error) throw error;
  return data as BlogPhoto;
}
export async function updateBlogPhoto(id: string, updates: Partial<BlogPhoto>): Promise<BlogPhoto> {
  const { data, error } = await supabase.from("blog_photos").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data as BlogPhoto;
}
export async function deleteBlogPhoto(id: string): Promise<void> {
  const { error } = await supabase.from("blog_photos").delete().eq("id", id);
  if (error) throw error;
}

// ─── Site Config ──────────────────────────────────────────────────────────────
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

// ─── File uploads ─────────────────────────────────────────────────────────────
export async function uploadFile(file: File, path: string): Promise<string> {
  const { error } = await supabase.storage.from("assets").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("assets").getPublicUrl(path);
  return data.publicUrl;
}
export async function uploadLogo(file: File): Promise<string> {
  return uploadFile(file, `logo/logo.${file.name.split(".").pop()}`);
}
export async function uploadProfileImage(file: File): Promise<string> {
  return uploadFile(file, `profile/profile.${file.name.split(".").pop()}`);
}
export async function uploadBlogPhoto(file: File): Promise<string> {
  const ts = Date.now();
  return uploadFile(file, `blog/${ts}-${file.name}`);
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
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