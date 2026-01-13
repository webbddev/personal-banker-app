'use server';

import { checkUser } from '@/lib/checkUser';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function getUserInfo() {
  try {
    // First check authentication
    const { userId } = await auth();
    if (!userId) {
      console.log('No userId found in auth');
      return null;
    }

    const user = await checkUser();
    if (!user) {
      console.log('checkUser returned null');
      return null;
    }

    // Get additional user info from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) {
      console.log('currentUser returned null');
      return {
        id: user.clerkUserId,
        email: '',
        name: 'Investment Portfolio User',
      };
    }

    console.log('Clerk user data:', {
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      username: clerkUser.username,
      email: clerkUser.emailAddresses?.[0]?.emailAddress,
    });

    // Construct full name from available data
    const firstName = clerkUser.firstName || '';
    const lastName = clerkUser.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    const result = {
      id: user.clerkUserId,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
      name:
        fullName ||
        clerkUser.username ||
        clerkUser.emailAddresses?.[0]?.emailAddress?.split('@')[0] ||
        'Investment Portfolio User',
    };

    console.log('Returning user info:', result);

    return result;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}
