export function getMediaUrl(path?: string | null): string | null {
  const trimmedPath = path?.trim();
  if (!trimmedPath) return null;

  if (/^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(trimmedPath) || /^(?:data|blob):/i.test(trimmedPath)) {
    return trimmedPath;
  }

  const backendHost = import.meta.env.VITE_APP_BACKEND_HOST.replace(/\/+$/, '');
  const normalizedPath = trimmedPath
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^public\//, '');

  return `${backendHost}/${normalizedPath}`;
}
