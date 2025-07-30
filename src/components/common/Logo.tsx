import Image from "next/image";

export function Logo() {
  return (
    <div className="h-8 w-8 rounded-lg flex gap-1 items-center justify-center">
      <Image src="/eksu-logo.png" alt="Logo" width={32} height={32} className="object-contain" />
    </div>
  )
}