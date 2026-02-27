export default function StatusBadge({ status }: any) {
  const styles: any = {
    CREATED: "bg-blue-100 text-blue-700",
    PLANNED: "bg-indigo-100 text-indigo-700",
    DISPATCHED: "bg-yellow-100 text-yellow-700",
    IN_TRANSIT: "bg-orange-100 text-orange-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <span
      className={`px-3 py-1 text-xs rounded-full font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}