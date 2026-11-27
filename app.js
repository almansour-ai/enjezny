// دليل إنجزني: بحث وفلترة بالصنف، وبطاقات فيها اتصال وواتساب.
(function () {
    'use strict';

    var norm = function (s) {
        return (s || '').toLowerCase()
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .trim();
    };

    var CATS = [
        { id: 'all', label: 'الكل', kinds: null, icon: '<path d="M4 4h7v7H4z"/><path d="M13 4h7v7h-7z"/><path d="M4 13h7v7H4z"/><path d="M13 13h7v7h-7z"/>' },
        { id: 'craft', label: 'صنايعية', kinds: ['صنايعي'], icon: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>' },
        { id: 'shop', label: 'محلات مواد بناء', kinds: ['محل'], icon: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/>' },
        { id: 'contract', label: 'شركات مقاولات', kinds: ['شركة مقاولات', 'شركة خدمات أو مقاولات'], icon: '<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M9 10h.01M15 10h.01"/>' },
        { id: 'decor', label: 'شركات ديكور', kinds: ['شركة ديكور'], icon: '<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 15a2 2 0 0 1 2-2 2 2 0 0 1 2 2v1h10v-1a2 2 0 0 1 2-2 2 2 0 0 1 2 2v4H3z"/><path d="M5 19v2M19 19v2"/>' }
    ];

    var state = { query: '', trade: 'الكل', cat: 'all' };

    function catById(id) { return CATS.filter(function (c) { return c.id === id; })[0]; }

    function renderCats() {
        var box = document.getElementById('anj-cats');
        if (!box) return;
        box.innerHTML = '';
        CATS.forEach(function (c) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'anj-cat' + (state.cat === c.id ? ' is-active' : '');
            b.setAttribute('aria-pressed', state.cat === c.id ? 'true' : 'false');
            b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + c.icon + '</svg><span></span>';
            b.lastChild.textContent = c.label;
            b.addEventListener('click', function () {
                state.cat = c.id;
                state.trade = 'الكل';
                renderCats();
                renderChips();
                renderCards();
            });
            box.appendChild(b);
        });
    }

    function inCat(p) {
        var c = catById(state.cat);
        if (!c || !c.kinds) return true;
        return c.kinds.indexOf(p.kind || 'صنايعي') !== -1;
    }

    function renderChips() {
        var box = document.getElementById('anj-chips');
        box.innerHTML = '';
        var trades = ['الكل'].concat(PROVIDERS.filter(inCat).map(function (p) { return p.trade; })
            .filter(function (t, i, a) { return t && a.indexOf(t) === i; }));
        box.hidden = trades.length < 3;
        trades.forEach(function (t) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'anj-chip' + (state.trade === t ? ' is-active' : '');
            b.textContent = t;
            b.addEventListener('click', function () {
                state.trade = t;
                renderChips();
                renderCards();
            });
            box.appendChild(b);
        });
    }

    function filtered() {
        var q = norm(state.query);
        return PROVIDERS.filter(function (p) {
            var okTrade = state.trade === 'الكل' || p.trade === state.trade;
            var okQuery = q === '' || norm(p.name + ' ' + p.trade + ' ' + p.area).indexOf(q) !== -1;
            return inCat(p) && okTrade && okQuery;
        });
    }

    function renderCards() {
        var list = filtered();
        document.getElementById('anj-count').textContent = PROVIDERS.length ? list.length + ' من ' + PROVIDERS.length : '';
        var box = document.getElementById('anj-cards');
        box.innerHTML = '';
        var empty = document.getElementById('anj-empty');
        if (list.length === 0) {
            var c = catById(state.cat);
            empty.textContent = PROVIDERS.length === 0 || (c && c.kinds && !PROVIDERS.some(inCat))
                ? 'لسه مفيش ' + c.label + ' مسجلين. أول ما يسجلوا هتلاقيهم هنا، ولو إنت منهم سجّل من الفورم تحت.'
                : 'مفيش نتائج مطابقة. جرّب كلمة تانية، أو اختار «الكل» من الأصناف.';
            empty.hidden = false;
            return;
        }
        empty.hidden = true;
        list.forEach(function (p) {
            var card = document.createElement('div');
            card.className = 'anj-card';

            var top = document.createElement('div');
            var name = document.createElement('strong');
            name.textContent = p.name;
            var meta = document.createElement('span');
            meta.className = 'anj-card-meta';
            meta.textContent = p.trade + ' · ' + p.area;
            if (p.kind === 'شركة مقاولات' || p.kind === 'شركة ديكور') { meta.textContent = p.kind + ' · ' + p.trade + ' · ' + p.area; }
            top.appendChild(name);
            top.appendChild(meta);

            var phone = document.createElement('div');
            phone.className = 'anj-card-phone';
            phone.dir = 'ltr';
            phone.textContent = p.phoneDisplay;

            var actions = document.createElement('div');
            actions.className = 'anj-card-actions';

            var call = document.createElement('a');
            call.className = 'anj-btn';
            call.href = 'tel:+' + p.phone;
            call.textContent = 'اتصل';
            actions.appendChild(call);

            if (p.whatsapp) {
                var wa = document.createElement('a');
                wa.className = 'anj-btn anj-btn-wa';
                wa.href = 'https://wa.me/' + p.whatsapp;
                wa.target = '_blank';
                wa.rel = 'noopener';
                wa.textContent = 'واتساب';
                actions.appendChild(wa);
            }

            card.appendChild(top);
            card.appendChild(phone);
            card.appendChild(actions);
            box.appendChild(card);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var search = document.getElementById('anj-search');
        if (!search) return;
        if (PROVIDERS.length === 0) {
            search.hidden = true;
        }
        search.addEventListener('input', function () {
            state.query = search.value;
            renderCards();
        });
        renderCats();
        renderChips();
        renderCards();
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').catch(function () { /* التطبيق يفضل شغال من غير كاش */ });
        });
    }
})();
