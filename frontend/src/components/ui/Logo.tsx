import Image from "next/image";
import Link from "next/link";

/** Logo officiel KamalPharMédis. */
export default function Logo({ withBaseline = false }: { withBaseline?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Image src="/brand/logo-icon.png" alt="KamalPharMédis" width={40} height={40} className="h-10 w-10" priority />
      <span className="flex flex-col leading-none">
        <span className="text-lg font-extrabold tracking-tight text-blue-deep">
          Kamal<span className="text-green-main">Phar</span>Médis
        </span>
        {withBaseline && (
          <span className="text-[11px] font-medium text-gray-500">Santé & bien-être</span>
        )}
      </span>
    </Link>
  );
}
