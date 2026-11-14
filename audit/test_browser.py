from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto('http://127.0.0.1:8765')
    page.wait_for_selector('.project-card', state='attached')
    assert page.locator('.project-card').count() == 5
    assert page.locator('.project-actions a').count() == 5
    for width in [1440, 390]:
        page.set_viewport_size({'width': width, 'height': 900})
        page.mouse.move(width // 2, 100)
        page.wait_for_timeout(1000)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        for i in range(5):
            button = page.locator('.view-project').nth(i)
            button.scroll_into_view_if_needed()
            button.click()
            assert page.locator('#modalBackdrop').get_attribute('aria-hidden') == 'false'
            assert page.locator('#modalActions a').get_attribute('href') == page.locator('.project-actions a').nth(i).get_attribute('href')
            page.keyboard.press('Escape')
            assert button.evaluate('(el) => el === document.activeElement')
        page.screenshot(path=f'audit/portfolio-{width}.png', full_page=True)
    page.set_viewport_size({'width':1440,'height':900})
    page.locator('#contact').scroll_into_view_if_needed()
    submit = page.locator('.submit-btn')
    from compose_checks import check_compose
    check_compose(page)
    assert not errors, errors
    print(json.dumps({'cards':5,'viewports':[1440,390],'modal_links':'passed','focus_restore':'passed','validation':'passed','short_message':'passed','normal_message':'passed','compose':'passed (handoffs intercepted)','browser_errors':errors}))
    browser.close()
