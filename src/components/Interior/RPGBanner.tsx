type Props = {
  children: React.ReactNode;
};

export function RPGBanner({ children }: Props) {
  return <h1 className="rpg-banner">{children}</h1>;
}
