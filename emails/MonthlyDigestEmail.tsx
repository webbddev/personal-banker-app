import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface MonthlyDigestEmailProps {
  userFirstName?: string;
  investments?: {
    id: string;
    name: string;
    interestRate: number;
    formattedValue: string;
    expirationDate: string;
  }[];
  appBaseUrl?: string;
}

const mockInvestments = [
  {
    id: '1',
    name: 'Tech Innovations Inc.',
    interestRate: 7.5,
    formattedValue: '$15,000.00',
    expirationDate: '2024-12-31',
  },
  {
    id: '2',
    name: 'Green Energy Fund',
    interestRate: 6.8,
    formattedValue: '$10,000.00',
    expirationDate: '2025-01-20',
  },
  {
    id: '3',
    name: 'Real Estate Trust',
    interestRate: 5.2,
    formattedValue: '$25,000.00',
    expirationDate: '2025-02-15',
  },
];

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const MonthlyDigestEmail = ({
  userFirstName = 'Investor',
  investments = mockInvestments,
  appBaseUrl = baseUrl,
}: MonthlyDigestEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>
        Your Monthly Investment Digest for{' '}
        {new Date().toLocaleString('default', { month: 'long' })}
      </Preview>
      <Container style={container}>
        <Img
          src={`${baseUrl}/logo/Colour-Logo_noBackground.webp`}
          width='240'
          alt='My Personal Banker'
          style={logo}
        />
        <Text style={paragraph}>Hi {userFirstName},</Text>
        <Text style={paragraph}>
          Here is your monthly investment digest. Below you'll find a summary of
          your current investments that are expiring in{' '}
          {new Date().toLocaleString('default', { month: 'long' })} and their
          details.
        </Text>
        <Section style={listSection}>
          {investments.map((investment) => (
            <Container key={investment.id} style={investmentBox}>
              <Text style={investmentName}>{investment.name}</Text>
              <Text style={investmentValue}>
                {investment.formattedValue} &mdash;{' '}
                {investment.interestRate.toFixed(2)}% Rate
              </Text>
              <Text style={investmentDetails}>
                Expires on:{' '}
                <span style={expirationDate}>
                  {investment.expirationDate}
                </span>
              </Text>
            </Container>
          ))}
        </Section>
        <Section style={btnContainer}>
          <Button style={button} href={`${baseUrl}/investments`}>
            View All Investments
          </Button>
        </Section>
        <Text style={paragraph}>
          Best,
          <br />
          The My Personal Banker team
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          © {new Date().getFullYear()} My Personal Banker Inc. All Rights
          Reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

MonthlyDigestEmail.PreviewProps = {
  userFirstName: 'Investor',
} as MonthlyDigestEmailProps;

export default MonthlyDigestEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const logo = {
  margin: '0 auto',
  display: 'block',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#1a202c',
};

const listSection = {
  margin: '32px 0',
};

const investmentBox = {
  border: '1px solid #e2e8f0',
  borderRadius: '3px',
  padding: '2px 16px',
  marginBottom: '10px',
  backgroundColor: '#f7fcfc',
};

const investmentName = {
  fontWeight: 'bold',
  fontSize: '16px',
  marginBottom: '4px',
};

const investmentDetails = {
  color: '#718096',
  fontSize: '15px',
  marginBottom: '3px',
};

const expirationDate = {
  fontWeight: 'bold',
};

const investmentValue = {
  fontSize: '15px',
  color: '#40C1AC',
};

const btnContainer = {
  textAlign: 'center' as const,
  margin: '32px 0 0 0',
};

const button = {
  backgroundColor: '#40C1AC',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
};

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '24px',
};
