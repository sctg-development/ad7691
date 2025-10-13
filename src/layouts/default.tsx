import type React from "react";

import { Link } from "@heroui/link";
import { Trans, useTranslation } from "react-i18next";

import { Navbar } from "@/components/navbar";
import { siteConfig } from "@/config/site";
export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-3">
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href={siteConfig().links.sctg}
          title={t("site-homepage")}
        >
          <span className="text-default-600">
            <Trans ns="base">{t("powered-by")}</Trans>
          </span>
          <p className="text-primary">SCTG&nbsp;</p>
        </Link>
      </footer>
    </div>
  );
}
