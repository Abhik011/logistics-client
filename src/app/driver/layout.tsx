export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 max-w-md mx-auto shadow-lg">
      {children}
    </div>
  );
}