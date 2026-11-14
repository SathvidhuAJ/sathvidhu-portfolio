"""Local compose checks: intercept all handoffs, never open mail apps or Google."""
from urllib.parse import urlparse, parse_qs
from datetime import datetime, timezone, timedelta

def check_compose(page):
    start=datetime.now(timezone.utc)
    page.clock.install(time=start)
    page.clock.pause_at(start+timedelta(seconds=1))
    page.evaluate('''() => {
      window.composeHandoffs=[]; window.composePopups=[]; window.composeFetches=[];
      document.addEventListener('click', event => {
        const link=event.target.closest('a');
        if(link && (link.protocol==='mailto:' || link.hostname==='mail.google.com')) {
          event.preventDefault(); window.composeHandoffs.push(link.href);
        }
      }, true);
      window.composeMode='ok'; window.composeClosed=0; window.composeWindowCalls=[];
      window.open=(...args)=>{
        window.composeWindowCalls.push(args);
        if(window.composeMode==='blocked') return null;
        if(window.composeMode==='throw') throw new Error('Popup unavailable');
        const popup={opener:window,document:document.implementation.createHTMLDocument(''),location:{},close(){window.composeClosed++;}};
        popup.document.addEventListener('click',event=>{
          event.preventDefault();
          const link=event.target;
          window.composePopups.push({url:link.href,detached:popup.opener===null,policy:link.referrerPolicy,rel:link.rel});
        });
        if(window.composeMode==='navigation-failure') popup.document.body.appendChild=()=>{throw new Error('Navigation unavailable');};
        return popup;
      };
      window.fetch=(...args)=>{window.composeFetches.push(args);throw new Error('Unexpected fetch');};
    }''')
    buttons=page.locator('#contactForm .compose-button')
    assert buttons.all_text_contents()==['Open in Gmail']
    for width in [320,390,768,1440,1920]:
        page.set_viewport_size({'width':width,'height':900})
        boxes=[]
        for button in buttons.all():
            button.scroll_into_view_if_needed()
            page.mouse.move(0,0)
            page.keyboard.press('Tab')
            button.focus()
            style=button.evaluate('(e)=>{const s=getComputedStyle(e);return {bg:s.backgroundColor,color:s.color,outline:s.outlineStyle,width:s.outlineWidth};}')
            assert style['bg']=='rgb(255, 255, 255)' and style['color']=='rgb(17, 24, 39)'
            assert style['outline']=='solid' and style['width']=='3px'
            boxes.append(button.bounding_box())
        assert boxes[0]['width']>200
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.set_viewport_size({'width':390,'height':900})
    submit=page.locator('.submit-btn')
    submit.click()
    assert page.locator('[aria-invalid="true"]').count()==4
    assert not page.locator('#gmailNotice').is_visible()
    assert page.locator('[name="name"]').evaluate('(e)=>e===document.activeElement')
    values=dict(name='  Zo\u00eb  ',email='bad',subject='Hello &?=#',message='Hello \U0001f44b\nSecond line <script>literal</script>')
    for key,value in values.items(): page.locator(f'[name="{key}"]').fill(value)
    page.locator('#gmailCompose').click()
    assert page.locator('[aria-invalid="true"]').count()==1
    assert page.evaluate('composePopups.length')==0
    page.locator('[name="email"]').fill(' visitor@example.com ')
    submit.focus();page.keyboard.press('Enter')
    popup=page.evaluate('composePopups[0]')
    gmail=parse_qs(urlparse(popup['url']).query)
    assert gmail['to']==['sathvidhu@gmail.com']
    assert gmail['su']==[values['subject']]
    assert page.evaluate('composeWindowCalls[0]')==['about:blank','_blank']
    assert popup['detached'] and popup['policy']=='no-referrer'
    assert popup['rel']=='noopener noreferrer'
    assert page.locator('#draftDetails').get_attribute('open') is None
    assert not page.locator('#gmailDraftLink').is_visible()
    notice=page.locator('#gmailNotice')
    assert notice.get_attribute('role')=='status'
    assert notice.get_attribute('aria-live')=='polite'
    assert notice.get_attribute('aria-atomic')=='true'
    assert notice.is_visible() and 'Gmail draft requested!' in notice.inner_text()
    assert 'Review your message and press Send in Gmail.' in notice.inner_text()
    assert page.locator('#formStatus').inner_text()==''
    assert page.locator('#draftDetails').is_hidden()
    page.clock.run_for(4999)
    assert notice.is_visible()
    page.clock.run_for(1)
    assert not notice.is_visible()
    submit.click()
    page.clock.run_for(3000)
    submit.click()
    page.clock.run_for(2000)
    assert notice.is_visible() # prior timer would have expired here
    page.clock.run_for(2999)
    assert notice.is_visible()
    page.clock.run_for(1)
    assert not notice.is_visible()
    assert 'Name: Zo\u00eb\r\nEmail: visitor@example.com' in gmail['body'][0]
    assert values['message'].replace('\n','\r\n') in gmail['body'][0]
    assert page.locator('[name="name"]').input_value()==values['name']
    assert page.locator('[name="message"]').input_value()==values['message']
    assert page.locator('#emailCompose').count()==0
    assert page.locator('a[href="mailto:sathvidhu@gmail.com"]').first.is_visible()
    page.locator('#draftHelp').click()
    assert page.locator('#draftDetails summary').evaluate('(e)=>e===document.activeElement')
    page.evaluate("composeMode='blocked'")
    submit.click()
    assert not notice.is_visible()
    assert page.locator('#draftDetails').is_visible()
    assert 'could not open' in page.locator('#formStatus').inner_text()
    fallback=page.locator('#gmailDraftLink')
    assert fallback.is_visible() and fallback.get_attribute('href')==popup['url']
    assert fallback.get_attribute('rel')=='noopener noreferrer'
    fallback.click() # intercepted; no Google request
    assert values['message'] in page.locator('#manualDraft').input_value()
    assert page.locator('[name="message"]').input_value()==values['message']
    page.evaluate("composeMode='navigation-failure'")
    submit.click()
    assert not notice.is_visible() and page.evaluate('composeClosed')==1
    assert fallback.is_visible()
    page.evaluate("composeMode='ok'")
    page.locator('[name="subject"]').fill('Long draft')
    page.locator('[name="message"]').fill('\u4f60'*2600)
    before=page.evaluate('composePopups.length')
    page.locator('#gmailCompose').click()
    assert page.evaluate('composePopups.length')==before
    assert '\u4f60'*2600 in page.locator('#manualDraft').input_value()
    assert not notice.is_visible()
    assert page.evaluate('composeFetches.length')==0
    assert 'accepted for delivery' not in page.locator('#formStatus').inner_text()
    assert 'Message sent' not in page.locator('#formStatus').inner_text()
