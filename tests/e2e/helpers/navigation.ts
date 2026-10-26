import type { Page } from "@playwright/test";

export async function openCourseArea(page: Page, title: string) {
  const nav = page.getByRole("navigation", { name: "Navegación principal" });
  await nav.locator(".nav-sections").waitFor({ state: "visible" });
  const picker = nav.getByRole("combobox", { name: "Área del curso", exact: true });
  if (await picker.isVisible()) await picker.selectOption({ label: title });
  else {
    const button = nav.getByRole("button", { name: title, exact: true });
    if (await button.getAttribute("aria-expanded") !== "true") await button.click();
  }
}
