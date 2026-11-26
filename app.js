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

    var state = { query: '', trade: 'الكل' };

    var trades = ['الكل'].concat(PROVIDERS.map(function (p) { return p.trade; })
        .filter(function (t, i, a) { return a.indexOf(t) === i; }));

    function renderChips() {
        var box = document.getElementById('anj-chips');
        box.innerHTML = '';
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
            return okTrade && okQuery;
        });
    }

    function renderCards() {
        var list = filtered();
        document.getElementById('anj-count').textContent = list.length + ' من ' + PROVIDERS.length;
        var box = document.getElementById('anj-cards');
        box.innerHTML = '';
        var empty = document.getElementById('anj-empty');
        if (list.length === 0) {
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
            // الدليل لسه فاضي: نخفي البحث والأصناف ونظهر ملحوظة ودية بدلها.
            search.hidden = true;
            document.getElementById('anj-chips').hidden = true;
            document.getElementById('anj-count').hidden = true;
            var empty = document.getElementById('anj-empty');
            empty.textContent = 'الدليل لسه فاضي. أول ما الصنايعية والمحلات يسجلوا، هتلاقيهم هنا.';
            empty.hidden = false;
            return;
        }
        search.addEventListener('input', function () {
            state.query = search.value;
            renderCards();
        });
        renderChips();
        renderCards();
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').catch(function () { /* التطبيق يفضل شغال من غير كاش */ });
        });
    }
})();
