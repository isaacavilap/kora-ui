export function Logo() {
  return (
    <svg aria-hidden width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="5" fill="var(--kora-accent)" />
      <path d="M6.5 5v10M13.5 5 6.5 10.5 13.5 15" stroke="var(--kora-accent-fg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const brand = { name: "Kora Coffee", logo: <Logo /> };

