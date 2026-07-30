import { EditorialPageBody } from "@/components/EditorialPageBody";

/** Mantiene catálogo montado entre /, /libros, /regalos, etc. (no remontar en cada clic del menú). */
export default function EditorialShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <EditorialPageBody />
      {children}
    </>
  );
}
