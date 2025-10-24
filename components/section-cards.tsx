import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingUp, Briefcase, AlertTriangle, Zap } from 'lucide-react';
import { CurrencyTotals } from '@/utils/investment-calculations';
import { formatAmount } from '@/utils/currency-formatter';
import { Investment } from '@prisma/client';

interface SectionCardsProps {
  monthlyReturns: CurrencyTotals;
  totalMonthlyRevenue: number;
  totalInvestments: number;
  expiringIn7Days: Investment[];
  expiringIn30Days: Investment[];
}

export function SectionCards({
  monthlyReturns,
  totalMonthlyRevenue,
  totalInvestments,
  expiringIn7Days,
  expiringIn30Days,
}: SectionCardsProps) {
  const cardClassName =
    'relative overflow-hidden hover:shadow-lg transition-shadow duration-300';
  const hoverEffect =
    'absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-purple-600 dark:to-indigo-600 opacity-0 hover:opacity-10 transition-opacity duration-300';

  return (
    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
      {/* Card 1 - Monthly Revenue */}
      <Card className={cardClassName}>
        <div className={hoverEffect}></div>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Monthly Revenue</span>
            <TrendingUp className='h-6 w-6 text-green-500' />
          </CardTitle>
          <CardDescription>Total earnings this month</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-xs text-gray-500 uppercase'>
              Total (MDL Equivalent)
            </p>
            <p className='text-2xl font-bold'>
              {formatAmount(totalMonthlyRevenue, 'MDL')}
            </p>
          </div>
          <div className='space-y-2'>
            {Object.entries(monthlyReturns)
              .filter(([, amount]) => amount > 0)
              .map(([currency, amount]) => (
                <div
                  key={currency}
                  className='flex justify-between items-center'
                >
                  <span className='text-sm text-gray-400'>{`Returns in ${currency}`}</span>
                  <span className='text-sm font-medium text-green-400'>
                    +{formatAmount(amount, currency)}
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Card 2 - Investment Overview */}
      <Card className={cardClassName}>
        <div className={hoverEffect}></div>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Investment Overview</span>
            <Briefcase className='h-6 w-6 text-blue-500' />
          </CardTitle>
          <CardDescription>Current portfolio status</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-xs text-gray-500 uppercase'>Total Investments</p>
            <p className='text-2xl font-bold'>{totalInvestments}</p>
          </div>
          <div className='space-y-4'>
            {expiringIn7Days.length > 0 && (
              <div>
                <h3 className='text-sm font-semibold text-yellow-400 mb-2 flex justify-between items-center'>
                  <span>Investments Expiring in 7 Days</span>
                  <span className='text-sm font-medium'>
                    {expiringIn7Days.length}
                  </span>
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow className='border-b border-gray-800'>
                      <TableHead className='text-xs h-8 py-2'>
                        Organization
                      </TableHead>
                      <TableHead className='text-xs h-8 py-2'>Amount</TableHead>
                      <TableHead className='text-xs h-8 py-2'>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringIn7Days.map((investment) => (
                      <TableRow
                        key={investment.id}
                        className='border-b border-gray-800/50'
                      >
                        <TableCell className='text-xs font-medium py-2'>
                          {investment.organisationName}
                        </TableCell>
                        <TableCell className='text-xs py-2'>
                          {formatAmount(
                            investment.investmentAmount,
                            investment.currency
                          )}
                        </TableCell>
                        <TableCell className='text-xs text-muted-foreground py-2'>
                          {new Date(
                            investment.expirationDate
                          ).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {expiringIn30Days.length > 0 && (
              <div>
                <h3 className='text-sm font-semibold text-red-400 mb-2 flex justify-between items-center'>
                  <span>Investments Expiring in 30 Days</span>
                  <span className='text-sm font-medium'>
                    {expiringIn30Days.length}
                  </span>
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow className='border-b border-gray-800'>
                      <TableHead className='text-xs h-8 py-2'>
                        Organization
                      </TableHead>
                      <TableHead className='text-xs h-8 py-2'>Amount</TableHead>
                      <TableHead className='text-xs h-8 py-2'>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringIn30Days.map((investment) => (
                      <TableRow
                        key={investment.id}
                        className='border-b border-gray-800/50'
                      >
                        <TableCell className='text-xs font-medium py-2'>
                          {investment.organisationName}
                        </TableCell>
                        <TableCell className='text-xs py-2'>
                          {formatAmount(
                            investment.investmentAmount,
                            investment.currency
                          )}
                        </TableCell>
                        <TableCell className='text-xs text-muted-foreground py-2'>
                          {new Date(
                            investment.expirationDate
                          ).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Card 3 */}
      <Card className={cardClassName}>
        <div className={hoverEffect}></div>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Alerts & Notifications</span>
            <AlertTriangle className='h-6 w-6 text-yellow-500' />
          </CardTitle>
          <CardDescription>Actionable insights</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-center text-gray-500'>No new alerts</p>
        </CardContent>
      </Card>
      {/* Card 4 */}
      <Card className={cardClassName}>
        <div className={hoverEffect}></div>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Quick Actions</span>
            <Zap className='h-6 w-6 text-purple-500' />
          </CardTitle>
          <CardDescription>Shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-center text-gray-500'>No actions available</p>
        </CardContent>
      </Card>
    </div>
  );
}
