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
    submit.click()
    assert page.locator('[aria-invalid="true"]').count() == 4
    values = {'name':'A','email':'invalid','subject':'Hi','message':'Hi'}
    for key,value in values.items(): page.locator(f'[name="{key}"]').fill(value)
    submit.click()
    assert page.locator('[aria-invalid="true"]').count() == 1
    page.locator('[name="email"]').fill('audit@example.com')
    requests = []
    def intercept(route):
        requests.append(route.request.post_data)
        route.fulfill(status=200, body='Submitted')
    page.route('http://127.0.0.1:8765/', intercept)
    submit.click()
    page.wait_for_function("document.querySelector('#formStatus').textContent.includes('Thank you')")
    assert len(requests) == 1 and 'message=Hi' in requests[0] and 'form-name=contact' in requests[0]
    for key,value in dict(values,email='audit@example.com',message='A normal message about a project opportunity.').items():
        page.locator(f'[name="{key}"]').fill(value)
    page.unroute('http://127.0.0.1:8765/')
    page.route('http://127.0.0.1:8765/', lambda route: route.fulfill(status=500))
    submit.click()
    page.wait_for_function("document.querySelector('#formStatus').textContent.includes('could not be confirmed')")
    assert page.locator('[name="message"]').input_value().startswith('A normal')
    assert submit.is_enabled()
    page.unroute('http://127.0.0.1:8765/')
    def delayed(route):
        page.wait_for_timeout(500)
        requests.append(route.request.post_data)
        route.fulfill(status=200)
    page.route('http://127.0.0.1:8765/', delayed)
    page.evaluate("document.querySelector('#contactForm').requestSubmit(); document.querySelector('#contactForm').requestSubmit()")
    page.wait_for_function("document.querySelector('#formStatus').textContent.includes('Thank you')")
    assert len(requests) == 2
    assert not errors, errors
    print(json.dumps({'cards':5,'viewports':[1440,390],'modal_links':'passed','focus_restore':'passed','validation':'passed','short_message':'passed','normal_message':'passed','success_and_failure':'passed (mock transport)','duplicate_prevention':'passed','browser_errors':errors}))
    browser.close()
