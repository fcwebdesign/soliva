import "./globals.css";
import { ViewTransitions } from "next-view-transitions";

import Nav from "@/components/Nav";

export const metadata = {
  title: "NextJS Page Transitions | Codegrid",
  description: "NextJS Page Transitions | Codegrid",
};

export default function RootLayout({ children }) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body>
          <Nav />
          {children}
        </body>
      </html>
    </ViewTransitions>
  );
}
