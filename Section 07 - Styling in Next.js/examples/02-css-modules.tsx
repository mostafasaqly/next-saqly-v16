/* app/components/Card.module.css */
.card {
  border-radius: 12px;
  padding: 16px;
}

// app/components/Card.tsx
import styles from "./Card.module.css";

export default function Card({ children }: { children: React.ReactNode }) {
  return <div className={styles.card}>{children}</div>;
}
// styles.card compiles to a unique class name — no collisions across files
