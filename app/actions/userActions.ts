'use server';

import { checkUser } from '@/lib/checkUser';
import { currentUser } from '@clerk/nextjs/server';

export async function getUserInfo() {
  try {
    const user = await checkUser();
    if (!user) {
      return null;
    }

    // Get additional user info from Clerk
    const clerkUser = await currentUser();

    // Construct full name from available data
    const firstName = clerkUser?.firstName || '';
    const lastName = clerkUser?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return {
      id: user.clerkUserId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress || '',
      name: fullName || clerkUser?.username || 'Investment Portfolio User',
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}
