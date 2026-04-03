import { notFound } from "next/navigation";
import ContactCode from "@/templates/vscode/components/ContactCode";
import styles from "@vscode/styles/ContactPage.module.css";
import { contactItemsFromProfile } from "@/lib/contact-items";
import { getPortfolioByUsername } from "@/lib/get-portfolio";
import { ContactForm } from "./contact-form";

interface PageProps {
  params: Promise<{ username: string; templateSlug: string }>;
}

export default async function ContactPage({ params }: PageProps) {
  const { username, templateSlug } = await params;
  const data = await getPortfolioByUsername(username);
  if (!data || data.profile.activeTemplate !== templateSlug || templateSlug !== "vscode") {
    notFound();
  }
  const items = contactItemsFromProfile(data.profile);

  return (
    <div className={styles.container}>
      <div>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Social</h3>
        {items.length > 0 ? <ContactCode items={items} /> : <p style={{ color: "var(--text-color)" }}>No links yet.</p>}
      </div>
      <div>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Message</h3>
        <ContactForm username={data.profile.username} />
      </div>
    </div>
  );
}
