export type SiteConfig = typeof siteConfig;
import i18next from "../i18n";

export const siteConfig = () => ({
  needCookieConsent: false, // Set to false if you don't need cookie consent
  name: i18next.t("ad7691-simulator"),
  description: i18next.t(
    "ad7691-simulator-description",
  ),
  navItems: [
    {
      label: i18next.t("home"),
      href: "/",
    },
  ],
  navMenuItems: [
    {
      label: i18next.t("home"),
      href: "/",
    },
  ],
  links: {
    github: "https://github.com/sctg-development/ad7691",
    sctg: "https://www.sctg.eu.org",
  },
  ad7691: {
    vRef: 5,
    vdd: 4.9975,
  },
  ad8475: {
    plusVs: 5,
    minusVs: 0,
    gain: 0.8
  }
});
