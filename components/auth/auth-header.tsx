import type { ReactNode } from "react";

export function AuthHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-7">
      <h1 className="text-[28px] font-extrabold leading-tight text-navy">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      {children}
    </div>
  );
}
