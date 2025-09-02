'use server';

import { PrismaClient } from '@/lib/generated/prisma';
import { revalidatePath } from 'next/cache';
import { currentUser } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Ensure there is a corresponding User row for the authenticated Clerk user
async function ensureDbUser() {
  const authUser = await currentUser();
  if (!authUser) {
    return null;
  }

  // An email is required to create a user in your database.
  // We prioritize the primary email from Clerk, falling back to the first available one.
  const email =
    authUser.primaryEmailAddress?.emailAddress ??
    authUser.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    console.error(
      'User does not have an email address, cannot create database entry.'
    );
    return null;
  }

  const name = `${authUser.firstName ?? ''} ${authUser.lastName ?? ''}`.trim();

  try {
    // Upsert the user: create if they don't exist, update if they do.
    // This keeps your user data in sync with Clerk.
    await prisma.user.upsert({
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

    return authUser;
  } catch (e) {
    console.error('Failed to ensure DB user exists:', e);
    return null;
  }
}

export async function createInvestment(data: any) {
  const authUser = await currentUser();
  if (!authUser) {
    return {
      success: false,
      error: 'User not authenticated. Please log in.',
    };
  }

  // Make sure the corresponding DB user exists to satisfy FK
  const ensured = await ensureDbUser();
  if (!ensured) {
    return {
      success: false,
      error: 'Could not ensure user exists in database.',
    };
  }

  try {
    const investment = await prisma.investment.create({
      data: {
        organisationName: data.organisationName,
        relatedData: data.relatedData,
        investmentType: data.investmentType,
        currency: data.currency,
        investmentAmount: data.investmentAmount,
        interestRate: data.interestRate,
        incomeTax: data.incomeTax,
        expirationDate: data.expirationDate,
        expirationStatus: data.expirationStatus,
        userId: authUser.id,
      },
    });
    revalidatePath('/investments');
    return { success: true, investment };
  } catch (error) {
    console.error('Create investment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getAllInvestments() {
  const user = await currentUser();
  if (!user) {
    console.error('Get all investments error: User not authenticated');
    return [];
  }
  try {
    return await prisma.investment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Get all investments error:', error);
    return [];
  }
}

export async function getInvestmentById(id: string) {
  const user = await currentUser();
  if (!user) {
    console.error('Get investment by ID error: User not authenticated');
    return null;
  }
  try {
    const investment = await prisma.investment.findUnique({ where: { id } });
    if (!investment || investment.userId !== user.id) {
      return null;
    }
    return investment;
  } catch (error) {
    console.error('Get investment by ID error:', error);
    return null;
  }
}

export async function updateInvestment(id: string, data: any) {
  const user = await currentUser();

  if (!user) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    const investmentToUpdate = await prisma.investment.findUnique({
      where: { id },
    });

    if (!investmentToUpdate || investmentToUpdate.userId !== user.id) {
      return {
        success: false,
        error: 'Investment not found or permission denied.',
      };
    }
    const investment = await prisma.investment.update({
      where: { id },
      data: {
        organisationName: data.organisationName,
        relatedData: data.relatedData,
        investmentType: data.investmentType,
        currency: data.currency,
        investmentAmount: data.investmentAmount,
        interestRate: data.interestRate,
        incomeTax: data.incomeTax,
        expirationDate: data.expirationDate,
        expirationStatus: data.expirationStatus,
        updatedAt: new Date(),
      },
    });
    revalidatePath('/investments');
    return { success: true, investment };
  } catch (error) {
    console.error('Update investment error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Primary function for form submissions with validation
export async function updateInvestmentAction(formData: FormData) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: 'User not authenticated.' };
  }
  try {
    const id = formData.get('id') as string;
    const investmentToUpdate = await prisma.investment.findUnique({
      where: { id },
    });

    if (!investmentToUpdate || investmentToUpdate.userId !== user.id) {
      return {
        success: false,
        error: 'Investment not found or permission denied.',
      };
    }
    const organisationName = formData.get('organisationName') as string;
    const investmentAmount = parseFloat(
      formData.get('investmentAmount') as string
    );
    const interestRate = parseFloat(formData.get('interestRate') as string);
    const incomeTax = parseFloat(formData.get('incomeTax') as string);
    const expirationDate = new Date(formData.get('expirationDate') as string);
    const currency = formData.get('currency') as string;
    const investmentType = formData.get('investmentType') as string;

    // Server-side validation
    if (!organisationName || organisationName.trim().length < 2) {
      return {
        success: false,
        error: 'Organisation name must be at least 2 characters',
      };
    }

    if (isNaN(investmentAmount) || investmentAmount <= 0) {
      return {
        success: false,
        error: 'Investment amount must be greater than 0',
      };
    }

    if (isNaN(interestRate) || interestRate < 0 || interestRate > 30) {
      return {
        success: false,
        error: 'Interest rate must be between 0 and 30%',
      };
    }

    if (isNaN(incomeTax) || incomeTax < 0 || incomeTax > 100) {
      return { success: false, error: 'Income tax must be between 0 and 100%' };
    }

    if (expirationDate <= new Date()) {
      return { success: false, error: 'Expiration date must be in the future' };
    }

    const investment = await prisma.investment.update({
      where: { id },
      data: {
        organisationName: organisationName.trim(),
        investmentAmount,
        interestRate,
        incomeTax,
        expirationDate,
        currency,
        investmentType,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/investments');
    revalidatePath(`/investments/edit/${id}`);

    return { success: true, investment };
  } catch (error) {
    console.error('Update investment error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update investment',
    };
  }
}

export async function deleteInvestment(id: string) {
  const user = await currentUser();

  if (!user) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    const investmentToDelete = await prisma.investment.findUnique({
      where: { id },
    });

    if (!investmentToDelete || investmentToDelete.userId !== user.id) {
      return {
        success: false,
        error: 'Investment not found or permission denied.',
      };
    }
    await prisma.investment.delete({ where: { id } });
    revalidatePath('/investments');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete investment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getInvestmentsExpiringSoon() {
  
  const user = await currentUser();

  if (!user) {
    return [];
  }

  try {
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    return await prisma.investment.findMany({
      where: {
        userId: user.id,
        expirationDate: {
          lt: threeMonthsFromNow,
        },
      },
      orderBy: { expirationDate: 'asc' },
    });
  } catch (error) {
    console.error('Get investments expiring soon error:', error);
    return [];
  }
}

export async function countAllInvestments() {
  const user = await currentUser();

  if (!user) {
    return 0;
  }

  try {
    return await prisma.investment.count({ where: { userId: user.id } });
  } catch (error) {
    console.error('Count investments error:', error);
    return 0;
  }
}
