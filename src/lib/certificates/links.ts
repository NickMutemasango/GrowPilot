/** Where a certificate is viewed. */
export function certificateHref(id: string): string {
  return `/dashboard/certificates/${encodeURIComponent(id)}`;
}
