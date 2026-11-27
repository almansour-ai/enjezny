// دليل إنجزني: بحث وفلترة بالصنف، وبطاقات فيها اتصال وواتساب وتقييمات وأعمال سابقة.
(function () {
    'use strict';

    var norm = function (s) {
        return (s || '').toLowerCase()
            .replace(/[أإآ]/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            .trim();
    };

    var REVIEW_FORM_URL = 'https://tally.so/r/WJzlAk';
    var ALL_REVIEWS = (typeof REVIEWS !== 'undefined' && Array.isArray(REVIEWS)) ? REVIEWS : [];

    var CATS = [
        { id: 'all', label: 'الكل', kinds: null, icon: '<path d="M4 4h7v7H4z"/><path d="M13 4h7v7h-7z"/><path d="M4 13h7v7H4z"/><path d="M13 13h7v7h-7z"/>' },
        { id: 'craft', label: 'صنايعية', kinds: ['صنايعي'], icon: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>' },
        { id: 'shop', label: 'محلات مواد بناء', kinds: ['محل'], icon: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v8h14v-8"/>' },
        { id: 'contract', label: 'شركات مقاولات', kinds: ['شركة مقاولات', 'شركة خدمات أو مقاولات'], icon: '<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M9 10h.01M15 10h.01"/>' },
        { id: 'decor', label: 'شركات ديكور', kinds: ['شركة ديكور'], icon: '<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 15a2 2 0 0 1 2-2 2 2 0 0 1 2 2v1h10v-1a2 2 0 0 1 2-2 2 2 0 0 1 2 2v4H3z"/><path d="M5 19v2M19 19v2"/>' }
    ];

    var state = { query: '', trade: 'الكل', cat: 'all' };

    function catById(id) { return CATS.filter(function (c) { return c.id === id; })[0]; }

    function reviewsFor(id) {
        return ALL_REVIEWS.filter(function (r) { return r.p === id; });
    }

    function starsText(n) {
        n = Math.round(n);
        var s = '';
        for (var i = 1; i <= 5; i++) s += i <= n ? '★' : '☆';
        return s;
    }

    function fmtDate(iso) {
        try { return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }); }
        catch (e) { return ''; }
    }

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
        box.style.display = trades.length < 3 ? 'none' : '';
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
            empty.textContent = c && c.kinds && !PROVIDERS.some(inCat)
                ? 'لسه مفيش ' + c.label + ' مسجلين. أول ما يسجلوا هتلاقيهم هنا، ولو إنت منهم سجّل من الفورم تحت.'
                : PROVIDERS.length === 0 ? 'الدليل لسه فاضي. أول ما الصنايعية والمحلات والشركات يسجلوا، هتلاقيهم هنا.'
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

            var revs = reviewsFor(p.id);
            var rate = document.createElement('div');
            rate.className = 'anj-rate';
            if (revs.length) {
                var avg = revs.reduce(function (s, r) { return s + (r.s || 0); }, 0) / revs.length;
                var st = document.createElement('span');
                st.className = 'stars';
                st.textContent = starsText(avg);
                rate.appendChild(st);
                var rt = document.createElement('span');
                rt.textContent = (Math.round(avg * 10) / 10) + ' من 5 · ' + revs.length + (revs.length === 1 ? ' تقييم' : ' تقييمات');
                rate.appendChild(rt);
            }
            var rl = document.createElement('a');
            rl.className = 'anj-rate-link';
            rl.href = REVIEW_FORM_URL + '?provider=' + encodeURIComponent(p.id);
            rl.target = '_blank';
            rl.rel = 'noopener';
            rl.textContent = revs.length ? 'قيّمه إنت كمان' : 'قيّمه';
            rate.appendChild(rl);

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

                if (p.quote) {
                    var qb = document.createElement('a');
                    qb.className = 'anj-btn anj-btn-quote';
                    qb.href = 'https://wa.me/' + p.whatsapp + '?text=' + encodeURIComponent('السلام عليكم، شفتكم على دليل أنجزني وحابب أطلب مقايسة من فضلكم');
                    qb.target = '_blank';
                    qb.rel = 'noopener';
                    qb.textContent = 'اطلب مقايسة';
                    actions.appendChild(qb);
                }
            }

            card.appendChild(top);
            card.appendChild(phone);
            card.appendChild(rate);
            card.appendChild(actions);

            if (p.products && p.products.length) {
                var pd = document.createElement('details');
                pd.className = 'anj-details';
                var ps = document.createElement('summary');
                ps.textContent = 'المنتجات اللي بيبيعها (' + p.products.length + ')';
                pd.appendChild(ps);
                var ul = document.createElement('ul');
                ul.className = 'anj-prod-list';
                p.products.forEach(function (prod) {
                    var li = document.createElement('li');
                    li.textContent = prod;
                    ul.appendChild(li);
                });
                pd.appendChild(ul);
                card.appendChild(pd);
            }

            if (p.works && p.works.length) {
                var w = document.createElement('div');
                w.className = 'anj-works';
                var wl = document.createElement('div');
                wl.className = 'anj-works-label';
                wl.textContent = 'من شغله';
                w.appendChild(wl);
                var grid = document.createElement('div');
                grid.className = 'anj-works-grid';
                p.works.forEach(function (src) {
                    var a = document.createElement('a');
                    a.href = src;
                    a.target = '_blank';
                    a.rel = 'noopener';
                    var img = document.createElement('img');
                    img.src = src;
                    img.alt = 'صورة من شغل ' + p.name;
                    img.loading = 'lazy';
                    a.appendChild(img);
                    grid.appendChild(a);
                });
                w.appendChild(grid);
                card.appendChild(w);
            }

            if (revs.length) {
                var rd = document.createElement('details');
                rd.className = 'anj-details';
                var rs = document.createElement('summary');
                rs.textContent = 'آراء الناس (' + revs.length + ')';
                rd.appendChild(rs);
                revs.slice().sort(function (a, b) { return (a.d || '') < (b.d || '') ? 1 : -1; }).forEach(function (r) {
                    var item = document.createElement('div');
                    item.className = 'anj-rev';
                    var head = document.createElement('div');
                    var rst = document.createElement('span');
                    rst.className = 'stars';
                    rst.textContent = starsText(r.s || 0);
                    head.appendChild(rst);
                    var who = document.createElement('span');
                    who.className = 'anj-rev-who';
                    who.textContent = r.n || 'زبون';
                    head.appendChild(who);
                    if (r.d) {
                        var when = document.createElement('span');
                        when.className = 'anj-rev-when';
                        when.textContent = fmtDate(r.d);
                        head.appendChild(when);
                    }
                    item.appendChild(head);
                    if (r.c) {
                        var body = document.createElement('div');
                        body.textContent = r.c;
                        item.appendChild(body);
                    }
                    rd.appendChild(item);
                });
                card.appendChild(rd);
            }

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
