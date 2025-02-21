"use strict";
/* Бургер меню */
const navMenu = document.querySelector("#navMenu");
const menu = document.querySelector('.menu');

navMenu.addEventListener('click', ()=> {
    menu.classList.toggle("active");
})


/* Переключение табов */

const btns = document.querySelector('.feature__tabs'),
     tabs = document.querySelectorAll('.tab__btn'),
     content = document.querySelectorAll(".features__tab__content-item");


    btns.addEventListener('click', (e) => {
        tabs.forEach(el => {
            el.classList.remove('tab__btn--active');
        });

        content.forEach (item => {
            item.classList.add("hidden");
        })

        if(e.target.classList.contains('tab__btn')){
            e.target.classList.add('tab__btn--active');
        };
       
        const data = e.target.getAttribute("data-");
        document.querySelector(`.tab-content-${data}`).classList.remove("hidden");
    });
