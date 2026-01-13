export default function InputField({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-600">{label}</label>
      <input
        {...props}
        className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}
