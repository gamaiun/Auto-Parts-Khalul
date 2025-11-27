import "./globals.css";

export const metadata = {
  title: "Vehicle Info Bot",
  description: "Check Israeli vehicle information by plate number",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
