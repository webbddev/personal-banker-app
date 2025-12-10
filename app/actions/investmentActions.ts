'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { checkUser } from '@/lib/checkUser';

export async function createInvestment(data: any) {
  const user = await checkUser();
  if (!user) {
    return {
      success: false,
      error: 'User not authenticated. Please log in.',
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
        userId: user.clerkUserId,
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
export async function getAllInvestmentsSortedByExpiration() {
  const user = await checkUser();
  if (!user) {
    console.error('Get all investments error: User not authenticated');
    return [];
  }
  try {
    return await prisma.investment.findMany({
      where: { userId: user.clerkUserId },
      orderBy: { expirationDate: 'asc' },
    });
  } catch (error) {
    console.error('Get all investments error:', error);
    return [];
  }
}

export async function getInvestmentsByType() {
  const user = await checkUser();
  if (!user) {
    console.error('User not authenticated');
    return [];
  }

  try {
    const allInvestments = await prisma.investment.findMany({
      where: { userId: user.clerkUserId },
    });

    // Use Record<string, number> to type the accumulator
    const investmentsByType = allInvestments.reduce(
      (acc: Record<string, number>, investment) => {
        const type = investment.investmentType;
        acc[type] = (acc[type] || 0) + investment.investmentAmount;
        return acc;
      },
      {}
    );

    // Transform data for the chart
    const chartData = Object.entries(investmentsByType).map(
      ([investmentType, totalAmount]) => ({
        type: investmentType,
        value: totalAmount,
      })
    );

    return chartData;
  } catch (error) {
    console.error('Error getting investments by type:', error);
    return [];
  }
}

// export async function getInvestmentTotalsByCurrency() {
//   const user = await checkUser();
//   if (!user) return {};

//   const investments = await prisma.investment.findMany({
//     where: { userId: user.clerkUserId },
//     select: { investmentAmount: true, currency: true },
//   });

//   const totalsByCurrency: Record<string, number> = {};
//   investments.forEach((i) => {
//     if (!totalsByCurrency[i.currency]) {
//       totalsByCurrency[i.currency] = 0;
//     }
//     totalsByCurrency[i.currency] += i.investmentAmount;
//   });

//   return totalsByCurrency;
// }

export async function getInvestmentsByCurrency() {
  const user = await checkUser();
  if (!user) {
    console.error('User not authenticated');
    return {};
  }

  try {
    const allInvestments = await prisma.investment.findMany({
      where: { userId: user.clerkUserId },
    });

    const investmentsByCurrency = allInvestments.reduce(
      (acc: Record<string, number>, investment) => {
        const currency = investment.currency;
        acc[currency] = (acc[currency] || 0) + investment.investmentAmount;
        return acc;
      },
      {}
    );

    return investmentsByCurrency;
  } catch (error) {
    console.error('Error getting investments by currency:', error);
    return {};
  }
}

export async function getAllInvestments() {
  const user = await checkUser();
  if (!user) {
    console.error('Get all investments error: User not authenticated');
    return [];
  }
  try {
    return await prisma.investment.findMany({
      where: { userId: user.clerkUserId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Get all investments error:', error);
    return [];
  }
}

export async function getInvestmentById(id: string) {
  const user = await checkUser();
  if (!user) {
    console.error('Get investment by ID error: User not authenticated');
    return null;
  }
  try {
    const investment = await prisma.investment.findUnique({ where: { id } });
    if (!investment || investment.userId !== user.clerkUserId) {
      return null;
    }
    return investment;
  } catch (error) {
    console.error('Get investment by ID error:', error);
    return null;
  }
}

export async function updateInvestment(id: string, data: any) {
  const user = await checkUser();

  if (!user) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    const investmentToUpdate = await prisma.investment.findUnique({
      where: { id },
    });

    if (!investmentToUpdate || investmentToUpdate.userId !== user.clerkUserId) {
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
  const user = await checkUser();
  if (!user) {
    return { success: false, error: 'User not authenticated.' };
  }
  try {
    const id = formData.get('id') as string;
    const investmentToUpdate = await prisma.investment.findUnique({
      where: { id },
    });

    if (!investmentToUpdate || investmentToUpdate.userId !== user.clerkUserId) {
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
    const relatedData = formData.get('relatedData') as string;

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
        relatedData,
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
  const user = await checkUser();

  if (!user) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    const investmentToDelete = await prisma.investment.findUnique({
      where: { id },
    });

    if (!investmentToDelete || investmentToDelete.userId !== user.clerkUserId) {
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
  const user = await checkUser();

  if (!user) {
    return [];
  }

  try {
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    return await prisma.investment.findMany({
      where: {
        userId: user.clerkUserId,
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
  const user = await checkUser();

  if (!user) {
    return 0;
  }

  try {
    return await prisma.investment.count({
      where: { userId: user.clerkUserId },
    });
  } catch (error) {
    console.error('Count investments error:', error);
    return 0;
  }
}
