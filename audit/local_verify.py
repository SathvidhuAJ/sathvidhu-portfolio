"""Local-only checks. All non-GET requests are intercepted; no messages leave the browser."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json

BASE = 'http://127.0.0.1:8765'
results = {}
with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context()
    posts = []
    def guard(route):
        if route.request.method not in ('GET', 'HEAD'):
            posts.append(route.request.url)
            route.abort()
        else:
            route.continue_()
    context.route('**/*', guard)
    page = context.new_page()
    errors, console_errors, failed_local, failed_requests = [], [], [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)
    page.on('response', lambda response: failed_local.append([response.status,response.url]) if response.url.startswith(BASE) and response.status >= 400 else None)
    page.on('requestfailed', lambda request: failed_requests.append({'url':request.url,'failure':request.failure}))
    page.goto(BASE)
    page.wait_for_selector('.project-card', state='attached')
    expected = ['Mini-Project', 'invoice-app', 'todo-app', 'Chatbot', 'Website']
    links = page.locator('.project-actions a').evaluate_all('(els)=>els.map(e=>({url:e.href,target:e.target,rel:e.rel}))')
    assert [link['url'] for link in links] == ['https://github.com/Sathvidhu/'+name for name in expected]
    assert all(link['target']=='_blank' and 'noopener' in link['rel'] for link in links)
    results['five_exact_repository_destinations'] = 'PASS (local hrefs; remote availability not tested)'
    for width in [320,390,768,1440,1920]:
        page.set_viewport_size({'width':width,'height':900})
        page.mouse.move(width//2,80)
        page.wait_for_timeout(1000)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
        assert page.locator('img').evaluate_all('(els)=>els.every(e=>e.complete && e.naturalWidth>0 && e.hasAttribute("alt"))')
    results['responsive_and_images'] = 'PASS: 320,390,768,1440,1920 CSS pixels'
    for anchor in page.locator('a[href^="#"]').all():
        assert page.locator(anchor.get_attribute('href')).count()==1
    for selector in ['#filters button','#techFilters button']:
        for button in page.locator(selector).all():
            button.click()
            assert page.locator('.project-card' if selector.startswith('#filters') else '.tech-card').count()>0
        page.locator(selector).first.click()
    page.locator('.view-project').first.click()
    page.wait_for_function("document.activeElement === document.querySelector('#modalClose')")
    page.keyboard.press('Shift+Tab')
    assert page.locator('#modalActions a').evaluate('(e)=>e===document.activeElement')
    page.keyboard.press('Tab')
    assert page.locator('#modalClose').evaluate('(e)=>e===document.activeElement')
    page.keyboard.press('Escape')
    assert page.locator('#modalBackdrop').evaluate('(e)=>e.inert')
    page.locator('[name="email"]').focus()
    page.keyboard.press('Escape')
    results['escape_when_closed'] = 'PASS' if page.locator('[name="email"]').evaluate('(e)=>e===document.activeElement') else 'FAIL: Escape restores stale modal focus'
    page.locator('#projectTrack').focus()
    page.keyboard.press('ArrowRight')
    page.wait_for_timeout(700)
    assert page.locator('#projectTrack').evaluate('(e)=>e.scrollLeft')>0
    page.keyboard.press('ArrowLeft')
    page.wait_for_timeout(700)
    results['carousel_keyboard_and_modal_tab_loop'] = 'PASS'
    track = page.locator('#projectTrack')
    track.scroll_into_view_if_needed()
    page.wait_for_timeout(700)
    bounds = track.bounding_box()
    page.mouse.move(bounds['x']+400,bounds['y']+100)
    page.mouse.down()
    page.mouse.move(bounds['x']+100,bounds['y']+100,steps=15)
    page.mouse.up()
    assert track.evaluate('(e)=>e.scrollLeft')>0
    results['carousel_mouse_drag'] = 'PASS'
    page.set_viewport_size({'width':390,'height':900})
    page.locator('#menuToggle').click()
    assert page.locator('#menuToggle').get_attribute('aria-expanded')=='true'
    page.locator('.nav-link[href="#about"]').click()
    assert page.locator('#menuToggle').get_attribute('aria-expanded')=='false'
    results['navigation_and_filters'] = 'PASS'
    page.goto(BASE+'/about.html')
    assert page.locator('h1').count()==1
    page.locator('#menuToggle').click()
    assert page.locator('#navLinks').evaluate('(e)=>e.classList.contains("open")')
    for anchor in page.locator('a[href^="/"]').all():
        url = anchor.get_attribute('href')
        assert page.request.get(BASE+url.split('#')[0]).status==200
    results['about_routing_and_mobile_menu'] = 'PASS'
    for filename in ['robots.txt','sitemap.xml','theme.css','app.js','projects.js','sathvidhu-logo.png']:
        assert page.request.get(BASE+'/'+filename).status==200
    page.emulate_media(reduced_motion='reduce')
    page.goto(BASE)
    assert page.locator('#particleCanvas').evaluate('(e)=>getComputedStyle(e).display')=='none'
    results['reduced_motion_css'] = 'PASS'
    page.evaluate('''() => {
      window.scrollOptions=[];
      Element.prototype.scrollIntoView=function(options){window.scrollOptions.push(options)};
      Element.prototype.scrollBy=function(options){window.scrollOptions.push(options)};
    }''')
    page.locator('.nav-link[href="#about"]').dispatch_event('click')
    page.locator('#nextProjectBtn').dispatch_event('click')
    assert page.evaluate('scrollOptions.length === 2 && scrollOptions.every(o=>o.behavior === "instant")')
    results['reduced_motion_js_scroll'] = 'PASS'
    from compose_checks import check_compose
    check_compose(page)
    results['compose_workflow']='PASS (handoffs intercepted, no submission)'
    assert not posts, posts
    assert not errors, errors
    assert not failed_local, failed_local
    results.update(browser_errors=errors,console_errors=console_errors,failed_requests=failed_requests,failed_local_responses=failed_local,real_form_requests=posts)
    browser.close()
Path('audit/local-results.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps(results,indent=2))
