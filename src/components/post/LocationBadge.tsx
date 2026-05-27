type Props = {
  locationName: string | null;
};

export default function LocationBadge({ locationName }: Props) {
  if (!locationName) return null;

  return (
    <div className="px-3 pt-2">
      <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
        <span>📍</span>
        <span>{locationName}</span>
      </span>
    </div>
  );
}
