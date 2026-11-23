import './globals.css';
import { Navigation } from '../components/Navigation';

export const metadata = {
  title: 'Autonomous AI Video Studio',
  description: 'Production Multi-Channel AI Video Generation & Clipping Studio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen bg-studio-950 text-slate-100">
        <Navigation />
        <main className="flex-1 flex flex-col overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
