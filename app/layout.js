import "./globals.css";
import Navigation from "./components/Navigation";
import { Rubik } from "next/font/google";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "חלול חלקי חילוף - Vehicle Info Bot",
  description: "Check Israeli vehicle information by plate number",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className={rubik.className} suppressHydrationWarning>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
