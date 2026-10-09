import {test,expect} from '@playwright/test';
test('real receipt correction, confirmation, dashboard and local OCR review',async({page})=>{
 const email=`browser-${Date.now()}@example.test`;
 await page.goto('/register');await page.getByLabel('Email address').fill(email);await page.getByLabel('Password',{exact:true}).fill('fictional-password-123');await page.getByRole('button',{name:'Create account'}).click();
 await expect(page.getByRole('heading',{name:'Your grocery overview'})).toBeVisible();
 await page.goto('/receipts/new');await page.getByLabel('Merchant',{exact:true}).fill('Fictional Browser Market');await page.getByLabel('Purchase date',{exact:true}).fill('2026-10-09');await page.getByLabel('Item 1',{exact:true}).fill('Fictional milk');await page.getByLabel('Line total 1 (CAD)',{exact:true}).fill('4.50');await page.getByLabel('Subtotal (CAD)',{exact:true}).fill('4.50');await page.getByLabel('Receipt total (CAD)',{exact:true}).fill('4.50');
 await page.getByRole('button',{name:'Save reviewed changes'}).click();await expect(page.getByRole('heading',{name:'Review your receipt'})).toBeVisible();
 await page.getByLabel('Item 1',{exact:true}).fill('Corrected fictional milk');await page.getByRole('button',{name:'Save reviewed changes'}).click();await expect(page.getByText('Reviewed changes saved.',{exact:false})).toBeVisible();
 await page.getByRole('button',{name:'Confirm verified purchase'}).click();await expect(page.getByRole('heading',{name:'Verified receipt'})).toBeVisible();
 await page.goto('/');await page.getByLabel('Reporting month').fill('2026-10');await expect(page.locator('.stat').first()).toHaveText('$4.50');
 await page.screenshot({path:'docs/screenshots/dashboard.png',fullPage:true});
 await page.goto('/upload');await page.getByLabel('Choose receipt image').setInputFiles('backend/fixtures/legible-fictional.png');await page.getByRole('button',{name:'Upload & extract'}).click();
 await expect(page.getByRole('button',{name:'Save reviewed changes'})).toBeVisible({timeout:110000});await expect(page.getByLabel('Merchant',{exact:true})).toHaveValue(/FICTIONAL/i);
 await page.getByLabel('Item 1',{exact:true}).fill('Corrected fictional apples');await page.screenshot({path:'docs/screenshots/review.png',fullPage:true});
 await page.getByRole('button',{name:'Save reviewed changes'}).click();await expect(page.getByText('Reviewed changes saved.',{exact:false})).toBeVisible();await page.getByRole('button',{name:'Confirm verified purchase'}).click();await expect(page.getByRole('heading',{name:'Verified receipt'})).toBeVisible();
 await page.getByRole('button',{name:'Sign out'}).click();await expect(page.getByRole('heading',{name:'Welcome back'})).toBeVisible();
});
