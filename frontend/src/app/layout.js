import "./globals.css";  // ✅ Corrected path
import Navbar from "./components/Navbar";  // ✅ Updated path

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <Navbar />
        <main className="container mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
