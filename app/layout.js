import "./globals.css";
import Navigation from "./components/Navigation";
import { Rubik } from "next/font/google";
import { Oswald } from "next/font/google";
import { Bebas_Neue } from "next/font/google";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
  variable: "--font-oswald",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-bebas",
});

export const metadata = {
  title: "חלול חלקי חילוף - Vehicle Info Bot",
  description: "Check Israeli vehicle information by plate number",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${oswald.variable} ${bebasNeue.variable}`}
    >
      <body className={rubik.className} suppressHydrationWarning>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
