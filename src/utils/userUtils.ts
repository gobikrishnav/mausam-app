/**
 * Utility functions for user profile name formatting and avatar resolution.
 */

export function deriveNameFromEmail(email?: string | null): string {
  if (!email || !email.includes('@')) return 'Citizen';
  const localPart = email.split('@')[0].trim();
  if (!localPart || localPart.toLowerCase() === 'citizen.guest' || localPart.toLowerCase() === 'user') {
    return 'Citizen';
  }
  // Convert dots, underscores, dashes to spaces (e.g. gobi.krishna -> Gobi Krishna)
  const cleaned = localPart.replace(/[._\-+0-9]+/g, ' ').trim();
  if (!cleaned) return 'Citizen';
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function getCleanDisplayName(
  user?: { fullName?: string; email?: string } | null,
  clerkUser?: { firstName?: string | null; fullName?: string | null; primaryEmailAddress?: { emailAddress?: string } | null } | null
): string {
  // 1. Clerk verified name
  if (clerkUser?.firstName) return clerkUser.firstName;
  if (clerkUser?.fullName) {
    const first = clerkUser.fullName.split(' ')[0];
    if (first && first.toLowerCase() !== 'rohit') return first;
  }

  // 2. User profile name (ignore legacy hardcoded 'Rohit')
  if (user?.fullName && !user.fullName.toLowerCase().includes('rohit')) {
    const first = user.fullName.split(' ')[0];
    if (first) return first;
  }

  // 3. Email from Clerk
  if (clerkUser?.primaryEmailAddress?.emailAddress) {
    return deriveNameFromEmail(clerkUser.primaryEmailAddress.emailAddress);
  }

  // 4. User profile email
  if (user?.email && !user.email.toLowerCase().includes('rohit')) {
    return deriveNameFromEmail(user.email);
  }

  return 'Citizen';
}

export function getInitials(name?: string | null): string {
  if (!name) return 'C';
  const clean = name.trim();
  if (!clean) return 'C';
  return clean.charAt(0).toUpperCase();
}
