import { getInvestmentById } from '@/app/actions/investmentActions';

export default async function SingleInvestment({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  
  const { id } = await params;
  const investment = await getInvestmentById(id);

  return <main>{investment?.organisationName}</main>;
}
