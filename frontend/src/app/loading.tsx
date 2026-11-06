import { Spinner } from "@/components/common/Spinner";

export default function Loading() {
  return (
    <div className="flex justify-center py-24">
      <Spinner className="h-6 w-6" />
    </div>
  );
}
