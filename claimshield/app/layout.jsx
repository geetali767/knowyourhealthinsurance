import './globals.css';

export const metadata = {
  title: 'ClaimShield — Hospital Insurance Trap Decoder',
  description: 'Emergency hospital admission helper for Indian families. Decode room rent caps, co-pay and consumables traps in 10 seconds.',
};
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#020617' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
