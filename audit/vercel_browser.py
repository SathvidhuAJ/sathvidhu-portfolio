"""Vercel build QA: localhost only, mocked fetch for form tests, no email delivery."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json

BASE='http://127.0.0.1:8766'
results={}
with sync_playwright() as p:
    browser=p.chromium.launch()
    context=browser.new_context()
    def safe_route(route):
        if route.request.method not in ('GET','HEAD') and not route.request.url.startswith(BASE+'/'):
            raise AssertionError('Unexpected external write request')
        route.continue_()
    context.route('**/*',safe_route)
    page=context.new_page()
    errors,failed_local,failed_external=[],[],[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('requestfailed',lambda r:failed_external.append(r.url) if not r.url.startswith(BASE) else None)
    page.on('response',lambda r:failed_local.append((r.status,r.url)) if r.url.startswith(BASE) and r.status>=400 else None)
    page.goto(BASE)
    assert page.locator('#contactForm').get_attribute('data-contact-provider')=='resend'
    assert page.locator('#contactForm').get_attribute('action')=='/api/contact'
    assert page.locator('[name="form-name"]').count()==0
    assert page.locator('.project-card').count()==5
    for path in ['/', '/about.html']:
        page.set_viewport_size({'width':390,'height':900})
        page.goto(BASE+path)
        toggle=page.locator('#menuToggle')
        links=page.locator('#navLinks')
        assert links.evaluate('(e)=>e.inert')
        toggle.focus()
        page.keyboard.press('Tab')
        assert not links.evaluate('(e)=>e.contains(document.activeElement)')
        toggle.focus()
        page.keyboard.press('Enter')
        page.wait_for_function("getComputedStyle(document.querySelector('#navLinks')).visibility === 'visible'")
        assert toggle.get_attribute('aria-expanded')=='true'
        page.keyboard.press('Tab')
        assert links.locator('a').first.evaluate('(e)=>e===document.activeElement')
        page.keyboard.press('Escape')
        assert toggle.evaluate('(e)=>e===document.activeElement')
        assert links.evaluate('(e)=>e.inert')
        page.keyboard.press('Enter')
        page.wait_for_function("getComputedStyle(document.querySelector('#navLinks')).visibility === 'visible'")
        page.keyboard.press('Tab')
        page.set_viewport_size({'width':1440,'height':900})
        page.wait_for_function("!document.querySelector('#navLinks').inert")
        assert links.locator('a').first.evaluate('(e)=>e===document.activeElement')
        page.set_viewport_size({'width':390,'height':900})
        page.wait_for_function("document.querySelector('#navLinks').inert")
        assert toggle.evaluate('(e)=>e===document.activeElement')
        toggle.click()
        links.locator('a').last.click()
        assert toggle.get_attribute('aria-expanded')=='false'
    results['both_pages_mobile_keyboard_escape_focus_resize']='PASS'
    page.goto(BASE)
    for path in ['/', '/about.html']:
        page.goto(BASE+path)
        page.keyboard.press('Tab')
        assert page.locator('.skip-link').evaluate('(e)=>e===document.activeElement')
        page.keyboard.press('Enter')
        assert page.locator('main').evaluate('(e)=>e===document.activeElement')
    page.goto(BASE)
    assert page.locator('a[href="/about.html"]').count()>=1
    assert page.locator('#projectFallback').is_hidden()
    for selector in ['#filters .filter', '#techFilters .filter-chip']:
        buttons=page.locator(selector)
        assert buttons.first.get_attribute('aria-pressed')=='true'
        buttons.nth(1).click()
        assert buttons.nth(1).get_attribute('aria-pressed')=='true'
        assert buttons.first.get_attribute('aria-pressed')=='false'
        assert page.locator(selector+'[aria-pressed="true"]').count()==1
        buttons.first.click()
    results['skip_links_about_link_filter_states']='PASS'
    for blocked in ['disabled', 'app.js', 'projects.js']:
        fallback_context=browser.new_context(java_script_enabled=blocked!='disabled')
        fallback_context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(BASE+'/') else route.abort())
        if blocked!='disabled': fallback_context.route('**/'+blocked, lambda route: route.abort())
        fallback_page=fallback_context.new_page()
        for width in [320,390,768,1440,1920]:
            fallback_page.set_viewport_size({'width':width,'height':900})
            fallback_page.goto(BASE)
            assert fallback_page.locator('#projectFallback').is_visible()
            assert fallback_page.locator('#projectFallback a').count()==5
            assert fallback_page.locator('.project-card').count()==0
            assert fallback_page.locator('.hero-copy').evaluate('(e)=>getComputedStyle(e).opacity')=='1'
            assert fallback_page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        if blocked=='disabled':
            fallback_page.set_viewport_size({'width':390,'height':900})
            for path in ['/', '/about.html']:
                fallback_page.goto(BASE+path)
                assert fallback_page.locator('#navLinks').evaluate('(e)=>getComputedStyle(e).visibility')=='hidden'
                fallback_page.locator('#menuToggle').focus()
                fallback_page.keyboard.press('Tab')
                assert not fallback_page.locator('#navLinks').evaluate('(e)=>e.contains(document.activeElement)')
                fallback_page.goto(BASE+path)
                fallback_page.keyboard.press('Tab')
                assert fallback_page.locator('.skip-link').evaluate('(e)=>e===document.activeElement')
                fallback_page.keyboard.press('Enter')
                assert fallback_page.locator('main').evaluate('(e)=>e===document.activeElement')
        fallback_context.close()
    results['javascript_disabled_and_missing_scripts_five_widths']='PASS'
    page.goto(BASE)
    # A stalled observer must not leave baseline content hidden indefinitely.
    stalled_context=browser.new_context()
    stalled_context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(BASE+'/') else route.abort())
    stalled_context.add_init_script("window.IntersectionObserver = class { observe(){} unobserve(){} disconnect(){} };")
    stalled_page=stalled_context.new_page()
    stalled_page.goto(BASE)
    assert stalled_page.locator('.reveal-pending').count()>0
    stalled_page.wait_for_function("document.querySelectorAll('.reveal-pending').length === 0")
    stalled_page.wait_for_function("getComputedStyle(document.querySelector('.hero-copy')).opacity === '1'")
    stalled_context.close()
    results['stalled_reveal_observer_deadline']='PASS'
    repos=['Mini-Project','invoice-app','todo-app','Chatbot','Website']
    for width in [390,1440]:
        page.set_viewport_size({'width':width,'height':900})
        page.mouse.move(width//2,50)
        page.wait_for_timeout(800)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        for i in range(5):
            trigger=page.locator('.view-project').nth(i)
            trigger.click()
            page.wait_for_function("document.activeElement===document.querySelector('#modalClose')")
            assert page.locator('#modalActions a').get_attribute('href')=='https://github.com/Sathvidhu/'+repos[i]
            assert page.locator('#modalCaseStudy section').count()>=3
            assert page.locator('#modalCaseStudy').inner_text().find('Local setup')>=0
            assert page.locator('.project-modal').evaluate('(e)=>e.scrollHeight>e.clientHeight')
            assert page.evaluate('document.body.style.overflow')=='hidden'
            page.locator('.project-modal').evaluate('(e)=>e.scrollTop=e.scrollHeight')
            assert page.locator('#modalClose').is_visible()
            box=page.locator('#modalClose').bounding_box()
            assert box and box['y']>=0 and box['y']<900
            page.locator('#modalClose').focus()
            page.keyboard.press('Shift+Tab')
            assert page.locator('#modalActions a').evaluate('(e)=>e===document.activeElement')
            page.keyboard.press('Tab')
            assert page.locator('#modalClose').evaluate('(e)=>e===document.activeElement')
            page.keyboard.press('Escape')
            assert trigger.evaluate('(e)=>e===document.activeElement')
        page.wait_for_timeout(400)
        page.screenshot(path=f'audit/vercel-{width}.png')
    results['five_case_studies_desktop_mobile_focus_scroll_close']='PASS'
    for width in [320,768,1920]:
        page.set_viewport_size({'width':width,'height':900})
        page.mouse.move(width//2,50)
        page.wait_for_timeout(1600)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), page.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth,items:[...document.querySelectorAll("body *")].filter(e=>e.getBoundingClientRect().right>innerWidth+1 && e.getBoundingClientRect().right<400).map(e=>({tag:e.tagName,id:e.id,cls:e.className,right:e.getBoundingClientRect().right}))})')
    results['five_responsive_widths']='PASS'
    assert page.locator('img').evaluate_all('(els)=>els.every(e=>e.complete && e.naturalWidth>0)')
    for link in page.locator('a[href^="#"]').all(): assert page.locator(link.get_attribute('href')).count()==1
    page.set_viewport_size({'width':390,'height':900})
    page.locator('#menuToggle').click()
    page.locator('.nav-link[href="#contact"]').click()
    assert page.locator('#menuToggle').get_attribute('aria-expanded')=='false'
    page.locator('.submit-btn').click()
    assert page.locator('[aria-invalid="true"]').count()==4
    for key,value in dict(name='Test',email='bad',subject='Hi',message='Hi').items(): page.locator(f'[name="{key}"]').fill(value)
    page.locator('.submit-btn').click()
    assert page.locator('[aria-invalid="true"]').count()==1
    page.locator('[name="email"]').fill('test@example.invalid')
    # In-process promises model provider behavior. No actual request leaves the page.
    page.evaluate('''() => {
      window.requests=[];
      window.fetch=(url,options)=>new Promise((resolve,reject)=>{
        window.requests.push({url,options});window.resolveMock=resolve;window.rejectMock=reject;
      });
    }''')
    submit="document.querySelector('#contactForm').requestSubmit()"
    page.evaluate(submit+';'+submit)
    assert page.locator('.submit-btn').is_disabled()
    assert page.locator('#contactForm').get_attribute('aria-busy')=='true'
    assert page.evaluate('requests.length')==1
    request=page.evaluate('requests[0]')
    assert request['url']==BASE+'/api/contact'
    assert request['options']['headers']['Content-Type']=='application/json'
    assert json.loads(request['options']['body'])['message']=='Hi'
    key=request['options']['headers']['Idempotency-Key']
    page.evaluate("resolveMock(new Response(JSON.stringify({ok:false}),{status:502}))")
    page.wait_for_function("document.querySelector('#formStatus').textContent.includes('could not be confirmed')")
    assert page.locator('[name="message"]').input_value()=='Hi'
    page.evaluate(submit)
    assert page.evaluate('requests[1].options.headers["Idempotency-Key"]')==key
    page.evaluate("resolveMock(new Response(JSON.stringify({ok:true}),{status:200}))")
    page.wait_for_function("document.querySelector('#formStatus').textContent.includes('accepted for delivery')")
    assert page.locator('[name="message"]').input_value()==''
    for code,needle in [(503,'currently unavailable'),(429,'Too many'),(400,'check your message'),(403,'from this address'),(504,'timed out'),(200,'could not be confirmed')]:
        for field,value in dict(name='Test',email='test@example.invalid',subject='Local test',message='A normal message for testing.').items(): page.locator(f'[name="{field}"]').fill(value)
        page.evaluate(submit)
        page.evaluate(f"resolveMock(new Response(JSON.stringify({{ok:false}}),{{status:{code}}}))")
        page.wait_for_function('(needle)=>document.querySelector("#formStatus").textContent.includes(needle)',arg=needle)
        assert page.locator('.submit-btn').is_enabled()
    page.evaluate(submit)
    page.evaluate("rejectMock(new DOMException('Mock timeout','TimeoutError'))")
    page.wait_for_function("document.querySelector('#formStatus').textContent.includes('timed out')")
    page.evaluate(submit)
    page.evaluate("rejectMock(new TypeError('Mock offline'))")
    page.wait_for_function("document.querySelector('#formStatus').textContent.includes('could not be confirmed')")
    results['frontend_validation_loading_duplicates_idempotency_success_errors']='PASS (fetch mocked)'
    page.goto(BASE+'/about.html')
    assert page.locator('h1').count()==1
    assert page.request.get(BASE+'/api/contact').status==405
    assert page.request.get(BASE+'/not-a-route').status==404
    response=page.request.post(BASE+'/api/contact',headers={'Origin':BASE,'Content-Type':'application/json','Idempotency-Key':'a4cc119d-1281-4cc8-ae28-ab28e2be31d8'},data=json.dumps(dict(name='Local',email='test@example.invalid',subject='Local routing test',message='Local only.')))
    assert response.status==503 and response.json()['ok']==False
    assert page.request.get(BASE+'/api/contact.js').status==404
    assert page.request.get(BASE+'/.env').status==404
    results['local_api_routing_disabled_config_no_source_or_env_exposure']='PASS'
    assert not errors,errors
    assert not failed_local,failed_local
    results.update(browser_errors=errors,failed_local_assets=failed_local,blocked_external_assets=sorted(set(failed_external)),real_emails_sent=0)
    browser.close()
Path('audit/vercel-results.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps(results,indent=2))
