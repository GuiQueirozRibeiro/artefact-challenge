import "~/styles/globals.css";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Simple task management app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>
          <Toaster position="top-right" />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}