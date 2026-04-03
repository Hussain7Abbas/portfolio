import { notFound } from "next/navigation";
import ThemeInfo from "@/templates/vscode/components/ThemeInfo";
import styles from "@vscode/styles/SettingsPage.module.css";
import { getPortfolioByUsername } from "@/lib/get-portfolio";

interface PageProps {
  params: Promise<{ username: string; templateSlug: string }>;
}

const themes = [
  { name: "GitHub Dark", icon: "/github-dark.png", publisher: "GitHub", theme: "github-dark" },
  { name: "Dracula", icon: "/dracula.png", publisher: "Dracula Theme", theme: "dracula" },
  { name: "Ayu Dark", icon: "/ayu.png", publisher: "teabyii", theme: "ayu-dark" },
  { name: "Ayu Mirage", icon: "/ayu.png", publisher: "teabyii", theme: "ayu-mirage" },
  { name: "Nord", icon: "/nord.png", publisher: "arcticicestudio", theme: "nord" },
  { name: "Night Owl", icon: "/night-owl.png", publisher: "sarah.drasner", theme: "night-owl" },
];

export default async function PortfolioSettingsPage({ params }: PageProps) {
  const { username, templateSlug } = await params;
  const data = await getPortfolioByUsername(username);
  if (!data || data.profile.activeTemplate !== templateSlug || templateSlug !== "vscode") {
    notFound();
  }

  return (
    <>
      <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Color theme (preview)</h2>
      <div className={styles.container}>
        {themes.map((t) => (
          <ThemeInfo
            key={t.theme}
            name={t.name}
            icon={t.icon}
            publisher={t.publisher}
            theme={t.theme}
          />
        ))}
      </div>
    </>
  );
}
