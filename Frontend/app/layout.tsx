import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "LeaseVault",
  description: "Role-based wallets (Customer/Vendor) with AA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
