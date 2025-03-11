import "./globals.css";  // ✅ Corrected path
import Navbar from "./components/Navbar";  // ✅ Updated path


export const metadata = {
  title: {
    default: "Privify",
    template: "%s | Privify",
  },
  description:
    "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="">
        {/* <Navbar /> */}
        <main className="">{children}</main>
      </body>
    </html>
  );
}
