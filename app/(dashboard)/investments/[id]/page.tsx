import { getInvestmentById } from '@/app/actions/investmentActions';

export default async function SingleInvestment({
  params,
}: {
  params: { id: string };
}) {
  //   const investment = await prisma.investment.findUnique({
  //     where: { id: params.id },
  //   });
  const investment = await getInvestmentById(params.id);

  return <main>{investment?.organisationName}</main>;
}
