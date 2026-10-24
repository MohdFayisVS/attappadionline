export function requiresAdmin(method: string, path: string): boolean {
  const verb = method.toUpperCase();
  if (path.startsWith("/admin/") || path.startsWith("/debug")) return true;
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(verb)) return false;
  if (verb === "POST" && (path === "/lostfound" || path === "/citizen-reports")) return false;
  if (verb === "POST" && path.startsWith("/news/") && path.endsWith("/view") && path.split("/").length === 4) return false;
  return true;
}