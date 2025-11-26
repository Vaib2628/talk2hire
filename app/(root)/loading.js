import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200/20 border-t-primary-200 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image src="/logo.svg" alt="logo" width={24} height={24} className="animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-primary-100 text-base font-medium">Loading...</p>
      </div>
    </div>
  );
}
