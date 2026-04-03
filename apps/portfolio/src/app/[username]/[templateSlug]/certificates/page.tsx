import { notFound } from "next/navigation";
import CertificateCard from "@/templates/vscode/components/CertificateCard";
import styles from "@vscode/styles/CertificatesPage.module.css";
import { getPortfolioByUsername } from "@/lib/get-portfolio";

interface PageProps {
  params: Promise<{ username: string; templateSlug: string }>;
}

export default async function CertificatesPage({ params }: PageProps) {
  const { username, templateSlug } = await params;
  const data = await getPortfolioByUsername(username);
  if (!data || data.profile.activeTemplate !== templateSlug || templateSlug !== "vscode") {
    notFound();
  }
  const certificates = data.certificates as Array<{
    id: string;
    name: string;
    image: string | null;
    description: string | null;
    url: string | null;
  }>;

  return (
    <>
      <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Certificates</h3>
      <div className={styles.container}>
        {certificates.map((c) => (
          <CertificateCard key={c.id} certificate={c} />
        ))}
      </div>
    </>
  );
}
