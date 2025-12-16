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

interface ThirtyDayReminderEmailProps {
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

const defaultBaseUrl = process.env.APP_BASE_URL
  ? process.env.APP_BASE_URL
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

export const ThirtyDayReminderEmail = ({
  userFirstName = 'Investor',
  investments = mockInvestments,
  appBaseUrl = defaultBaseUrl,
}: ThirtyDayReminderEmailProps) => {
  const base = appBaseUrl.replace(/\/$/, '');

  const imageUrl = `${base}/logo/colour-logo_no-background.png`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Your 30-day investment expiration reminder</Preview>
        <Container style={container}>
          {/* <Img
            src={imageUrl}
            width='240'
            alt='My Personal Banker'
            style={logo}
          /> */}
          <Img
            src={imageUrl}
            width='100%' // Set width to 100% of the container
            alt='My Personal Banker'
            // We will define a new style inline or use a modified logo style
            style={fullWidthLogo}
          />
          <Text style={paragraph}>Hi {userFirstName},</Text>
          {/* <Text style={paragraph}>
            Below you will find a list of your current holdings that will reach
            their{' '}
            <span style={timeframeStyle}>
              expiration date within the coming 30 days
            </span>{' '}
            from the date this reminder was sent, which was{' '}
            <span style={todayDateStyle}>
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            . Review these details promptly to ensure a seamless transition or
            reinvestment.
          </Text> */}
          <Text style={paragraph}>
            Below you will find a summary of your investments scheduled to{' '}
            <span style={timeframeStyle}>expire within the next 30 days</span>{' '}
            from the date this reminder was sent, which was{' '}
            <span style={todayDateStyle}>
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            .
          </Text>
          <Text style={paragraph}>
            Review these details promptly to ensure a seamless transition or
            reinvestment.
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
            <Button style={button} href={`${base}/investments`}>
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
};

export default ThirtyDayReminderEmail;

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

// const logo = {
//   margin: '0 auto',
//   display: 'block',
// };

const fullWidthLogo = {
  width: '100%', // Ensures it takes up the full width of the container
  height: 'auto', // Important for maintaining aspect ratio
  display: 'block', // Necessary for block-level behavior
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

const todayDateStyle = {
  fontWeight: 'bold',
  color: '#2b6cb0', 
  padding: '2px 4px',
  borderRadius: '3px',
};

const timeframeStyle = {
  fontWeight: 'bold',
  color: '#e53e3e', 
  backgroundColor: '#fee2e2',
  padding: '1px 3px',
  borderRadius: '3px',
};