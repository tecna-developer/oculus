"use strict";
/* Бургер меню */
const navMenu = document.querySelector("#navMenu");
const menu = document.querySelector('.menu');

navMenu.addEventListener('click', ()=> {
    const opened = menu.classList.toggle("active");
    navMenu.setAttribute("aria-expanded", String(opened));
})


/* Переключение табов */

const btns = document.querySelector('.feature__tabs'),
     tabs = document.querySelectorAll('.tab__btn'),
     content = document.querySelectorAll(".features__tab__content-item");


    const selectTab = (tab) => {
        tabs.forEach(el => {
            const active = el === tab;
            el.classList.toggle('tab__btn--active', active);
            el.setAttribute('aria-selected', String(active));
            el.tabIndex = active ? 0 : -1;
        });

        content.forEach (item => {
            item.classList.add("hidden");
        })

        document.querySelector(`.tab-content-${tab.dataset.tab}`).classList.remove("hidden");
    };

    btns.addEventListener('click', (e) => {
        if (!e.target.classList.contains('tab__btn')) return;

        selectTab(e.target);
    });

    /* Стрелки переключают вкладки, Home/End — первая и последняя */
    btns.addEventListener('keydown', (e) => {
        const step = {ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1};
        const list = [...tabs];
        const current = list.indexOf(document.activeElement);
        if (current === -1) return;

        let next;
        if (e.key in step) next = (current + step[e.key] + list.length) % list.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = list.length - 1;
        else return;

        e.preventDefault();
        list[next].focus();
        selectTab(list[next]);
    });

/* Модалка с видео */

const videoModal = document.querySelector('#videoModal');
const videoModalTitle = videoModal.querySelector('.video-modal__title');

document.querySelectorAll('.video__btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (typeof videoModal.showModal !== 'function') return;

        const panel = btn.closest('.features__tab__content-item');
        videoModalTitle.textContent = panel.querySelector('.tab__content--title').textContent;
        videoModal.showModal();
    });
});

videoModal.querySelector('.video-modal__close').addEventListener('click', () => {
    videoModal.close();
});

/* Клик по затемнению: цель события — сам <dialog>, а не его содержимое,
   которое целиком лежит в .video-modal__inner */
videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) videoModal.close();
});

/* Кнопка GO в метаверс-блоке */

const metaverseInner = document.querySelector('.metaverse__inner');
const metaverseStatus = document.querySelector('.metaverse__status');
const metaverseBtn = document.querySelector('.metaverse__btn');

const METAVERSE_DONE_MS = 2000;

/* Запоминаем, что фокус был на кнопке: disabled = true сбрасывает фокус на
   <body>, а без этого флага фокус вернули бы на кнопку и после клика мышью —
   это было бы хуже исходной проблемы */
let metaverseBtnWasFocused = false;

metaverseBtn.addEventListener('click', () => {
    metaverseBtnWasFocused = document.activeElement === metaverseBtn;
    metaverseBtn.disabled = true;
    metaverseStatus.textContent = 'Entering the metaverse…';
    metaverseInner.classList.add('metaverse__inner--loading');
});

/* Полоса — псевдоэлемент .metaverse__status::after, поэтому animationend
   приходит на сам абзац. Слушаем его, а не общий таймер: в фоновой вкладке
   браузер придерживает таймеры, и состояние разошлось бы с картинкой */
metaverseStatus.addEventListener('animationend', (e) => {
    if (e.animationName !== 'metaverseProgress') return;

    metaverseInner.classList.remove('metaverse__inner--loading');
    metaverseStatus.textContent = 'Coming soon';

    setTimeout(() => {
        metaverseStatus.textContent = '';
        metaverseBtn.disabled = false;
        if (metaverseBtnWasFocused) metaverseBtn.focus();
    }, METAVERSE_DONE_MS);
});
