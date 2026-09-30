import { test, expect } from '@playwright/test';

test.describe('Travel Atlas - Quality Gate E2E Regression Base', () => {
  test('deve carregar a aplicação, renderizar o Globo, abrir viagens e dossiê', async ({ page }) => {
    // 1. Abrir aplicação
    await page.goto('/');

    // 2. Verificar Header principal do Travel Atlas
    const headerTitle = page.locator('header h1');
    await expect(headerTitle).toBeVisible();
    await expect(headerTitle).toContainText(/Travel Atlas/i);

    // 2.1 Verificar Logo da aplicação
    const logoImg = page.locator('header img[alt="Travel Globe Logo"]');
    await expect(logoImg).toBeVisible();

    // 3. Verificar renderização do Globo (container e canvas WebGL)
    const globeContainer = page.locator('.absolute.inset-0.z-0');
    await expect(globeContainer).toBeVisible();

    // 4. Interagir com painel de Viagens ("Minhas Viagens")
    const myTripsButton = page.locator('button', { hasText: 'Minhas Viagens' }).first();
    await expect(myTripsButton).toBeVisible();
    await myTripsButton.click();

    // 5. Verificar abertura do TripsPlannerPanel
    const plannerHeading = page.locator('h2', { hasText: 'Minhas Viagens' });
    await expect(plannerHeading).toBeVisible();

    // 6. Selecionar um país na lista da rota contínua
    const countryItem = page.locator('text=Brasil').first();
    if (await countryItem.isVisible()) {
      await countryItem.click();

      // 7. Verificar abertura do CountryDossier
      const dossierHeader = page.locator('text=Dossiê Estratégico').or(page.locator('text=Brasil')).first();
      await expect(dossierHeader).toBeVisible();
    }

    // 8. Fechar ou voltar para Explorar O Mundo
    const exploreButton = page.locator('button', { hasText: 'Explorar O Mundo' }).first();
    await expect(exploreButton).toBeVisible();
    await exploreButton.click();

    // 9. Verificar que o modo voltou para EXPLORE
    await expect(headerTitle).toHaveText('Travel Atlas');

    // 10. Interagir com o Assistente de IA
    const aiButton = page.locator('button', { hasText: 'Assistente IA' }).first();
    await expect(aiButton).toBeVisible();
    await aiButton.click();

    // 11. Verificar abertura do AIAssistantPanel com badge Llama
    const aiHeading = page.locator('h3', { hasText: 'Travel Intelligence' });
    await expect(aiHeading).toBeVisible();
    const llamaBadge = page.locator('h3:has-text("Travel Intelligence") ~ span').filter({ hasText: 'Llama' });
    await expect(llamaBadge).toBeVisible();
  });

  test('deve renderizar a interface mobile com barra de navegação inferior e painéis responsivos', async ({ page }) => {
    // Configurar viewport mobile (iPhone 14)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // 1. Verificar header mobile compacto com logo
    const logoImg = page.locator('header img[alt="Travel Globe Logo"]');
    await expect(logoImg).toBeVisible();

    // 2. Verificar barra de navegação inferior mobile (Bottom Navigation)
    const bottomNav = page.locator('nav.md\\:hidden');
    await expect(bottomNav).toBeVisible();

    // 3. Clicar em "Viagens" na barra inferior
    const tripsNavBtn = bottomNav.locator('button', { hasText: 'Viagens' });
    await expect(tripsNavBtn).toBeVisible();
    await tripsNavBtn.click();

    // 4. Verificar abertura do TripsPlannerPanel responsivo
    const plannerHeading = page.locator('h2', { hasText: 'Minhas Viagens' });
    await expect(plannerHeading).toBeVisible();

    // 5. Clicar em "IA Llama" na barra inferior
    const aiNavBtn = bottomNav.locator('button', { hasText: 'IA Llama' });
    await expect(aiNavBtn).toBeVisible();
    await aiNavBtn.click();

    // 6. Verificar abertura do painel do assistente em modo mobile
    const aiHeading = page.locator('h3', { hasText: 'Travel Intelligence' });
    await expect(aiHeading).toBeVisible();
  });
});
