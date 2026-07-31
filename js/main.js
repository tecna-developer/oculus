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
