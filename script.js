import Slider from '/lib/mySlider.js';

const slider = document.getElementById('slider');

const mySlider = new Slider(slider, {
    infinitySlides: false,
    autoplay: false,
    draggable: true,
    pagination: false,
    progressbar: false,
    arrows: true,
    additionalSettings: true,
});


const modalCloseBtn = document.querySelectorAll('.close-btn');
const modalOpenBtn = document.querySelectorAll('.open-btn');

modalCloseBtn.forEach(function(e) {
    e.addEventListener('click', function(el) {
        el.preventDefault();

        const parent = el.target.closest('.box');
        parent.classList.add('hidden-content');
    })
})

modalOpenBtn.forEach(function(e) {
    e.addEventListener('click', function(el) {
        el.preventDefault();

        const parent = el.target.closest('.box');
        parent.classList.remove('hidden-content');
    })
})