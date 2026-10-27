/* site-settings.js — همگام‌سازی تنظیمات پنل مدیریت با سایت
 * این اسکریپت تنظیمات را از /api/public-settings می‌خواند و روی همان
 * طراحی اصلی سایت اعمال می‌کند. اگر API در دسترس نباشد یا تنظیمی
 * ذخیره نشده باشد، سایت دقیقاً با ظاهر پیش‌فرض خودش نمایش داده می‌شود.
 */
(function () {
  'use strict';

  var STYLE_ID = 'site-theme-overrides';

  /* ---------- ابزارهای رنگ ---------- */
  function hexToRgb(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return null;
    var n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function shade(hex, factor) {
    var c = hexToRgb(hex);
    if (!c) return hex;
    function ch(v) {
      v = factor < 0 ? v * (1 + factor) : v + (255 - v) * factor;
      v = Math.max(0, Math.min(255, Math.round(v)));
      return ('0' + v.toString(16)).slice(-2);
    }
    return '#' + ch(c.r) + ch(c.g) + ch(c.b);
  }

  function rgba(hex, a) {
    var c = hexToRgb(hex);
    if (!c) return hex;
    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
  }

  /* ---------- اعمال رنگ اصلی سایت ---------- */
  function applyTheme(color) {
    var c = hexToRgb(color) ? color : '#378C3F';
    var dark = shade(c, -0.14);
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent =
      ':root{--sp-primary:' + c + ';--sp-primary-dark:' + dark + ';}' +
      '.bg-primary{background-color:' + c + '!important}' +
      '.btn-primary,.btn-primary.disabled,.btn-primary:disabled,fieldset[disabled] .btn-primary{background-color:' + c + '!important;border-color:' + c + '!important}' +
      '.btn-primary:hover,.btn-primary:focus,.btn-primary:active,.btn-primary.active,.show>.btn-primary.dropdown-toggle{background-color:' + dark + '!important;border-color:' + dark + '!important}' +
      '.btn-primary.btn-simple{color:' + c + '!important;border-color:' + c + '!important;background-color:transparent!important}' +
      '.btn-primary.btn-simple:hover,.btn-primary.btn-simple:focus,.btn-primary.btn-simple:active{color:' + dark + '!important;border-color:' + dark + '!important}' +
      '.btn-primary.btn-link{color:' + c + '!important;background-color:transparent!important}' +
      '.nav-pills.nav-pills-primary .nav-item .nav-link.active,.nav-pills.nav-pills-primary .nav-item .nav-link.active:focus,.nav-pills.nav-pills-primary .nav-item .nav-link.active:hover{background-color:' + c + '!important}' +
      '.progress-container.progress-primary .progress{background:' + rgba(c, 0.35) + '!important}' +
      '.progress-container.progress-primary .progress-bar{background:' + c + '!important}' +
      '.progress-container.progress-primary .progress-value,.progress-container.progress-primary .progress-badge{color:' + c + '!important}' +
      '.cc-profile-image a:before{border-color:' + rgba(c, 0.6) + '!important}' +
      '.text-primary{color:' + c + '!important}';
  }

  /* ---------- تبدیل مقدار شبکه اجتماعی به لینک ---------- */
  function socialLink(name, v) {
    var s = String(v || '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s) || /^mailto:/i.test(s) || /^tg:\/\//i.test(s)) return s;
    var user = s.replace(/^@/, '');
    switch (name) {
      case 'telegram': return 'https://t.me/' + user;
      case 'instagram': return 'https://www.instagram.com/' + user;
      case 'twitter': return 'https://twitter.com/' + user;
      case 'facebook': return 'https://www.facebook.com/' + user;
      case 'whatsapp': return 'https://wa.me/' + user.replace(/[^\d]/g, '');
      case 'linkedin': return 'https://www.linkedin.com/in/' + user;
      case 'youtube': return 'https://www.youtube.com/@' + user;
      case 'github': return 'https://github.com/' + user;
      default: return s;
    }
  }

  var SOCIAL_ICONS = {
    telegram: 'fa fa-telegram',
    instagram: 'fa fa-instagram',
    facebook: 'fa fa-facebook',
    twitter: 'fa fa-twitter',
    whatsapp: 'fa fa-whatsapp',
    linkedin: 'fa fa-linkedin',
    youtube: 'fa fa-youtube-play',
    github: 'fa fa-github',
  };

  var SOCIAL_TITLES = {
    telegram: 'تلگرام', instagram: 'اینستاگرام', facebook: 'فیسبوک',
    twitter: 'توییتر', whatsapp: 'واتساپ', linkedin: 'لینکدین',
    youtube: 'یوتیوب', github: 'گیت‌هاب',
  };

  /* ---------- اعمال لینک روی آیکون‌های موجود ---------- */
  function setIconHref(container, faClass, url) {
    if (!container || !url) return;
    var links = container.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      var icon = links[i].querySelector('i');
      if (icon && (' ' + icon.className + ' ').indexOf(' ' + faClass + ' ') > -1) {
        links[i].setAttribute('href', url);
        return;
      }
    }
  }

  function addExtraSocial(container, name, url, footer) {
    if (!container || !url) return;
    var a = document.createElement('a');
    if (footer) {
      a.className = 'cc-' + name + ' btn btn-link';
      a.innerHTML = '<i class="' + SOCIAL_ICONS[name].replace('fa ', 'fa fa-2x ') + '" aria-hidden="true"></i>';
    } else {
      a.className = 'btn btn-default btn-round btn-lg btn-icon';
      a.innerHTML = '<i class="' + SOCIAL_ICONS[name] + '"></i>';
    }
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.setAttribute('title', 'مرا در ' + SOCIAL_TITLES[name] + ' دنبال کنید');
    container.appendChild(a);
  }

  /* ---------- درج متن بعد از برچسب (بخش اطلاعات پایه و تماس) ---------- */
  function setAfterLabel(rootEl, labels, value, isRegex) {
    if (!rootEl || !value) return;
    var ps = rootEl.querySelectorAll('p, div');
    for (var i = 0; i < ps.length; i++) {
      var t = ps[i].textContent.trim();
      var hit = isRegex ? labels.test(t) : labels.indexOf(t) > -1;
      if (hit) {
        var next = ps[i].nextElementSibling;
        while (next && !/^(P)$/.test(next.tagName)) next = next.nextElementSibling;
        if (next) next.textContent = value;
        return;
      }
    }
  }

  function setText(sel, value) {
    if (!value) return;
    var el = document.querySelector(sel);
    if (el) el.textContent = value;
  }

  /* ---------- اعمال مهارت‌ها ---------- */
  function applySkills(raw) {
    var arr = raw;
    if (typeof arr === 'string') {
      try { arr = JSON.parse(arr); } catch (e) { return; }
    }
    if (!arr || !arr.length) return;
    var rows = document.querySelectorAll('#skill .progress-container');
    for (var i = 0; i < rows.length && i < arr.length; i++) {
      var sk = arr[i];
      if (!sk) continue;
      var badge = rows[i].querySelector('.progress-badge');
      var bar = rows[i].querySelector('.progress-bar');
      var val = rows[i].querySelector('.progress-value');
      if (badge && sk.name) badge.textContent = sk.name;
      var v = Math.max(0, Math.min(100, Number(sk.value) || 0));
      if (bar) {
        bar.style.width = v + '%';
        bar.setAttribute('aria-valuenow', String(v));
      }
      if (val) val.textContent = v + '%';
    }
  }

  /* ---------- اعمال کل تنظیمات روی صفحه ---------- */
  function applySettings(s) {
    if (!s || typeof s !== 'object') return;

    // ۱) تم رنگی
    if (s.primary_color) applyTheme(s.primary_color);
    if (s.background_color) document.body.style.backgroundColor = s.background_color;

    // ۲) عنوان و لوگو
    if (s.site_title) {
      document.title = s.site_title;
      var brand = document.querySelector('.navbar-brand');
      if (brand) {
        if (s.logo_image) {
          brand.innerHTML = '<img src="' + s.logo_image + '" alt="logo" style="height:34px;width:auto;max-height:40px;object-fit:contain;vertical-align:middle">';
          brand.removeAttribute('style');
        } else {
          brand.textContent = s.site_title;
        }
      }
      if (s.logo_image) {
        var fav = document.querySelector('link[rel="icon"]');
        if (!fav) {
          fav = document.createElement('link');
          fav.setAttribute('rel', 'icon');
          document.head.appendChild(fav);
        }
        fav.setAttribute('href', s.logo_image);
      }
    }

    // ۳) هدر پروفایل
    if (s.profile_name) setText('.profile-page .content-center .title', s.profile_name);
    if (s.tagline) setText('.profile-page .content-center .category', s.tagline);
    if (s.profile_image) {
      var img = document.querySelector('.cc-profile-image img');
      if (img) img.setAttribute('src', s.profile_image);
    }
    if (s.hero_image) {
      var hero = document.querySelector('.page-header-image');
      if (hero) hero.style.backgroundImage = 'url("' + s.hero_image + '")';
    }

    // ۴) متن‌های «درباره من»
    var aboutPs = document.querySelectorAll('#about .info123 p');
    if (aboutPs.length) {
      if (s.about_1 && aboutPs[0]) aboutPs[0].textContent = s.about_1;
      if (s.about_2 && aboutPs[1]) aboutPs[1].textContent = s.about_2;
    }

    // ۵) اطلاعات پایه
    var infoCard = document.querySelector('#about .card');
    if (infoCard) {
      setAfterLabel(infoCard, 'سن', s.age);
      setAfterLabel(infoCard, 'ایمیل', s.email);
      setAfterLabel(infoCard, 'تلفن', s.phone);
      setAfterLabel(infoCard, 'آدرس', s.address);
      setAfterLabel(infoCard, 'زبان', s.language);
    }

    // ۶) بخش اطلاعات تماس
    var contactCards = document.querySelectorAll('#contact .cc-contact-information .card-body');
    var contactInfo = null;
    for (var i = 0; i < contactCards.length; i++) {
      if (!contactCards[i].querySelector('form')) { contactInfo = contactCards[i]; break; }
    }
    if (contactInfo) {
      setAfterLabel(contactInfo, 'آدرس', s.address);
      setAfterLabel(contactInfo, 'تلفن', s.phone);
      setAfterLabel(contactInfo, 'ایمیل', s.email);
      if (s.telegram_account_1) {
        var t1 = s.telegram_account_1;
        if (!/^[\d]+\./.test(t1.trim())) t1 = '1. ' + t1.replace(/^@/, '@');
        setAfterLabel(contactInfo, 'اکانت های فعال در تلگرام', t1);
      }
      if (s.telegram_account_2) {
        var t2 = s.telegram_account_2;
        if (!/^[\d]+\./.test(t2.trim())) t2 = '2. ' + t2.replace(/^@/, '@');
        // بعد از «1. » جست‌وجو می‌کنیم
        var ps = contactInfo.querySelectorAll('p');
        for (var j = 0; j < ps.length; j++) {
          if (/^1[\.\)]/.test(ps[j].textContent.trim())) {
            var nx = ps[j].nextElementSibling;
            if (nx && nx.tagName === 'P') nx.textContent = t2;
            break;
          }
        }
      }
    }

    // ۷) شبکه‌های اجتماعی
    var social = {
      telegram: s.social_telegram, instagram: s.social_instagram,
      facebook: s.social_facebook, twitter: s.social_twitter,
      whatsapp: s.social_whatsapp, linkedin: s.social_linkedin,
      youtube: s.social_youtube, github: s.social_github,
    };
    var btnContainer = document.querySelector('.button-container');
    var footer = document.querySelector('.footer .container.text-center');
    Object.keys(social).forEach(function (name) {
      var url = socialLink(name, social[name]);
      if (!url) return;
      var faClass = { telegram: 'fa-telegram', instagram: 'fa-instagram', facebook: 'fa-facebook', twitter: 'fa-twitter' }[name];
      var handled = false;
      if (faClass) {
        if (btnContainer) setIconHref(btnContainer, faClass, url);
        if (footer) {
          var cls = { facebook: 'cc-facebook', twitter: 'cc-twitter', instagram: 'cc-instagram' }[name];
          if (cls) {
            var fl = footer.querySelectorAll('a.' + cls);
            if (fl.length) { fl[0].setAttribute('href', url); handled = true; }
          }
        }
      }
      // شبکه‌های جدید فقط در صورت پرشدن فیلد اضافه می‌شوند
      if (!handled) {
        addExtraSocial(btnContainer, name, url, false);
        addExtraSocial(footer, name, url, true);
      }
    });

    // ۸) مهارت‌ها
    applySkills(s.skills);

    // ۹) فوتر
    if (s.footer_name) setText('.footer .h4.title', s.footer_name);
    if (s.footer_text) {
      var cr = document.querySelector('.footer .text-muted p');
      if (cr) cr.textContent = s.footer_text;
    }
  }

  /* ---------- اتصال فرم تماس به API ---------- */
  function bindContactForm() {
    var form = document.querySelector('#contact form');
    if (!form || form.dataset.apiBound) return;
    form.dataset.apiBound = '1';
    form.addEventListener('submit', async function (e) {
      if (e.defaultPrevented) return; // اعتبارسنجی قبلی جلوی ارسال را گرفته
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var old = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'در حال ارسال…'; }
      try {
        var fd = new FormData(form);
        var res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fd.get('name'),
            subject: fd.get('Subject'),
            email: fd.get('_replyto'),
            message: fd.get('message'),
            website: fd.get('website'),
          }),
        });
        var d = null;
        try { d = await res.json(); } catch (err) { d = {}; }
        if (!res.ok) throw new Error(d.error || 'ارسال پیام ناموفق بود');
        form.reset();
        window.alert('پیام شما با موفقیت ارسال شد. ممنون!');
      } catch (err) {
        window.alert(err.message || 'خطا در ارسال پیام.');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = old; }
      }
    });
  }

  /* ---------- شروع ---------- */
  async function init() {
    try {
      var res = await fetch('/api/public-settings', {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) return;
      var data = await res.json();
      applySettings(data.settings || {});
      bindContactForm();
    } catch (e) {
      /* API آماده نیست؛ سایت با ظاهر پیش‌فرض نمایش داده می‌شود */
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
