import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const checkUser = async () => {
  try {
    const authUser = await currentUser();
    if (!authUser) {
      return null;
    }

    const email =
      authUser.primaryEmailAddress?.emailAddress ??
      authUser.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      console.error('User does not have an email address.');
      return null;
    }

    const name = `${authUser.firstName ?? ''} ${
      authUser.lastName ?? ''
    }`.trim();

    const user = await prisma.user.upsert({
      where: { clerkUserId: authUser.id },
      update: {
        email,
        name: name || undefined,
        imageUrl: authUser.imageUrl,
      },
      create: {
        clerkUserId: authUser.id,
        email,
        name: name || undefined,
        imageUrl: authUser.imageUrl,
      },
    });

    return user;
  } catch (error) {
    console.error('Error checking or creating user:', error);
    return null;
  }
};
