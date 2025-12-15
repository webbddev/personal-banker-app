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

interface DailyReminderEmailProps {
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
    expirationDate: '2024-08-15',
  },
];

// Priority: Passed Prop > Env Var > Vercel URL > Localhost
// This ensures that if you set APP_BASE_URL in Vercel, it always uses that.
const defaultBaseUrl = process.env.APP_BASE_URL
  ? process.env.APP_BASE_URL
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

export const DailyReminderEmail = ({
  userFirstName = 'Investor',
  investments = mockInvestments,
  appBaseUrl = defaultBaseUrl,
}: DailyReminderEmailProps) => {
  // Changed to explicit function block
  // FIX: Sanitize appBaseUrl (remove trailing slash) for safer URL construction.
  const base = appBaseUrl.replace(/\/$/, '');

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>
          Important: You have investments expiring in the next 30 days.
        </Preview>
        <Container style={container}>
          {/* FIX: Switching to PNG to resolve black background issue caused by email clients misinterpreting WEBP transparency.
              ACTION REQUIRED: Ensure a file named 'Colour-Logo_noBackground.png' is available at the public/logo path. */}
          <Img
            src={`${base}/logo/Colour-Logo_noBackground.png`}
            width='240'
            alt='My Personal Banker'
            style={logo}
          />
          <Text style={paragraph}>Hi {userFirstName},</Text>
          <Text style={paragraph}>
            The following investments in your portfolio are expiring within the
            next 30 days. Please review their details and take any necessary
            action.
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
            {/* FIX: Using 'base' for the button URL */}
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

DailyReminderEmail.PreviewProps = {
  userFirstName: 'Investor',
} as DailyReminderEmailProps;

export default DailyReminderEmail;

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
