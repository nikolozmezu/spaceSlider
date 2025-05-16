import Helper from './helper.js'


export default class Slider {
    #dataIndex = 0;
    #isDragging = false;
    #startX = 0;
    constructor(slider, settings) {

        // slider settings
        this.settings = {
            infinitySlides : false,
            autoplay: false,
            dragabble: false,
            progressbar: false,
            arrows: true,
            additionalSettings: false,
            ...settings 

        }
                

        if (slider) {
            this.slider = slider;
            this.slidesWrapper = slider.querySelector('.slides')
            this.init()
        } else {
            console.error('Error while setting new slider, element is null or undefined');
        }


    }


    init() {
        this.loadStructure();
        this.navAction()



        if(!this.settings.arrows && !this.settings.pagination) {
            this.settings.autoplay = true;
        }

        if(this.settings.autoplay) {
            this.playAuto();
            this.settings.infinitySlides = true
        }

        if(this.settings.draggable) {
            this.draggable();
            this.slider.classList.add('draggable')
        }

        if(this.settings.pagination) {
            this.pagination();
        }

        if(this.settings.progressbar) {
            this.progressbar();
        }
    






        this.#detectPrevNextSlides();



        // custom functionality if needed
        if(this.onLoad) {
            this.onLoad();
        }
        
    }


    navAction() {
        
        
        this.slider.querySelectorAll('.actionbtn').forEach(el => {
            el.addEventListener('click', btn => {
                let step = Number(btn.target.getAttribute('data-index'));


                this.#updateIndex(step);
                this.#updateNavigationButtons()
                this.#showSlide(this.#dataIndex);


            })
        })
    }


    loadStructure() {
        // necessary
        this.slider.style.display = 'block';
        this.slides = this.slider.querySelectorAll('.slide');
        if(this.slides.length === 0)  throw new Error('Element Class .slide Not Found');
        this.slides[0].classList.add('active')

        if(this.settings.arrows) {
            this.loadArrows();
        }
        this.slider.style.height = `${this.slides[0].firstChild.offsetHeight}px`;

        if(this.settings.additionalSettings) {
            this.slideSettings();

        }
                

    } 

    loadArrows() {
        
        this.arrowsDiv = Helper.create('div', 'navigation');
        this.leftArrow = Helper.create('button', ...['leftBtn', 'actionbtn']);
        this.rightArrow = Helper.create('button', ...['rightBtn', 'actionbtn']);
        this.arrows = [this.leftArrow, this.rightArrow];

        this.leftArrow.textContent = '<'
        this.rightArrow.textContent = '>'

        this.leftArrow.setAttribute('data-index', -1);
        this.rightArrow.setAttribute('data-index', 1);


        this.slider.prepend(this.arrowsDiv)
        this.arrowsDiv.append(this.leftArrow,this.rightArrow)

    }

    // actions
    playAuto() {
        if (this.intervalID) {
            clearInterval(this.intervalID); 
            this.intervalID = null; 
        }

        this.intervalID = setInterval(() => {
            this.#dataIndex += 1;


            this.#updateIndex();

            this.#showSlide(this.#dataIndex)
            this.#updatePagination();

        }, 2500)

        this.slider.addEventListener('mouseover', () => clearInterval(this.intervalID));

        this.slider.addEventListener('mouseleave', () => this.playAuto());
    }

    draggable() {
        this.slides.forEach(el => el.setAttribute('draggable', false))
        this.slidesWrapper.style.cursor = 'grab'

        this.slidesWrapper.addEventListener('mousedown',  (el) => this.#handleDragStart(el));
        this.slidesWrapper.addEventListener('mousemove',  (el) => this.#handleDragging(el));
        this.slidesWrapper.addEventListener('mouseup'  ,  (el) => this.#handleDragEnd(el));

        // this.slidesWrapper.addEventListener('touchstart', (el) => this.#handleDragStart(el));
        // this.slidesWrapper.addEventListener('touchmove' , (el) => this.#handleDragging(el));
        // this.slidesWrapper.addEventListener('touchend'  , (el) => this.#handleDragEnd(el));

        this.slidesWrapper.addEventListener('touchstart', (el) => alert('touched start'));
        this.slidesWrapper.addEventListener('touchmove' , (el) => alert('touch move'));
        this.slidesWrapper.addEventListener('swiped-right'  , (el) => alert('swiped-right'));
       
    }

   
    pagination() {
        this.paginationDiv = Helper.create('div', 'pagination');
        this.slider.append(this.paginationDiv);
    
        this.slides.forEach((el, index) => {
            const bullet = Helper.create('span', 'bullet');
            bullet.setAttribute('data-index', index);
            if (el.classList.contains('active')) {
                bullet.classList.add('active');
            }
            this.paginationDiv.appendChild(bullet);
        });
    
        this.bullets = Array.from(this.paginationDiv.querySelectorAll('.bullet')); 
    
        this.paginationDiv.addEventListener('click', (e) => {

            if (e.target.classList.contains('bullet')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                if (!isNaN(index) && index !== this.#dataIndex) {
                    this.#dataIndex = index;
                    this.#showSlide(this.#dataIndex);
                    this.#updatePagination(this.#dataIndex);

                }
            }

        });
    }

    progressbar() {
        this.progressbar =  Helper.create('div', 'progressbar');
        this.progressbar.textContent = `${this.#dataIndex + 1}/${this.slides.length}`
        this.slider.prepend(this.progressbar);
    }

    slideSettings() {
        this.settingsWrapper = Helper.create('div', 'slider-settings-wrapper');
        this.settingsFullSize = Helper.create('a', 'slider-full-size');
        this.settingsFullSize.setAttribute('href', '#');

        this.settingsWrapper.append(this.settingsFullSize);
        this.slidesWrapper.append(this.settingsWrapper);

        this.loadLightBox();

        this.settingsFullSize.addEventListener('click', (e) => {
            e.preventDefault();
            this.#openFullSize();
        });

    }
    

    loadLightBox() {
        this.lightBox = Helper.create('div', 'lightbox');
        this.fullSizeCloseButton = Helper.create('a', 'full-size-close');
        this.fullSizeCloseButton.setAttribute('href', '#'); 
        this.fullSizeCloseButton.textContent = 'x';

        this.lightBox.append(this.fullSizeCloseButton);

        document.body.append(this.lightBox);

        this.fullSizeCloseButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.#closeFullSize();
        });
    }

    #openFullSize() {
        this.lightboxElement = Helper.create('img', 'lightbox-img');
        const activeSlideSrc = this.slides[this.#dataIndex].getElementsByTagName('img')[0].getAttribute('src');

        this.lightboxElement.setAttribute('src', activeSlideSrc);

        this.lightBox.append(this.lightboxElement);
        this.lightBox.classList.add('active');
    }

    #closeFullSize() {
        this.lightBox.classList.remove('active');
        this.lightboxElement.remove();
    }

    #updateProgressBar() {
        this.progressbar.textContent = `${this.#dataIndex + 1}/${this.slides.length}`
    }


    #updatePagination(index = this.#dataIndex) {
        for(let bullet in this.bullets) {
            this.bullets[bullet].classList.remove('active');
            this.bullets[index].classList.add('active')
        }

        if(this.settings.progressbar) {
            this.#updateProgressBar();

        }
    }


    #handleDragStart(el) {
        this.#isDragging = true;
        this.#startX = el.type.startsWith('touch') ? el.touches[0].pageX : el.pageX;
        this.slidesWrapper.style.cursor = 'grabbing';
    }
    #handleDragEnd(e) {
        this.#isDragging = false;
        this.slidesWrapper.style.cursor = 'grab'
        const endX = e.type.startsWith('touch') ? e.changedTouches[0].pageX : e.pageX;
        const diffX = this.#startX - endX;

        if(Math.abs(diffX) > 30) {
            if(diffX > 0) {
                this.#dataIndex++;
            } else {
                this.#dataIndex--;
            }
            this.#updateIndex();

            this.#showSlide(this.#dataIndex)
            this.#updateNavigationButtons();
        }

        this.slides.forEach((slide) => {
            slide.style.visibility = 'hidden';
            slide.style.opacity = 0;
        })

        this.slides.forEach((slide) => {
            if(slide.classList.contains('active')) {
                slide.style.visibility = 'visible';
                slide.style.opacity = 1;
            }
        })
    }

    #handleDragging(e) {
        if(!this.#isDragging) return;
            const currentX = e.type.startsWith('touch') ? e.touches[0].pageX : e.pageX;
            const diffX = this.#startX - currentX;
            const opacityValue = Math.max(0.5, 0.8 - (Math.abs(diffX) / this.slider.offsetWidth)); 
            if (this.slides[this.#dataIndex]) {
                this.slides[this.#dataIndex].style.opacity = opacityValue;
            }
            if(Math.abs(diffX) > 70) {
                if(diffX > 0) {
                    this.slides.forEach(slide => {
                        if(slide.classList.contains('next')) {
                            slide.style.opacity = opacityValue;
                            slide.style.visibility = 'visible';
                        }
                    })
                } else {
                    this.slides.forEach(slide => {
                        if(slide.classList.contains('prev')) {
                            slide.style.opacity = opacityValue;
                            slide.style.visibility = 'visible';
                        }
                    })
                }
            }
    }

    #showSlide(index) {
        this.slides.forEach(e => {
            e.classList.remove('active')
            e.style = ''; // fix fade effect styling
        });
        this.slides[index].classList.add('active');
        if(this.settings.progressbar) {
            this.#updateProgressBar();

        }

    }

    #updateNavigationButtons() {
        if (!this.settings.infinitySlides && this.arrows) {
            this.arrows.forEach(el => el.classList.remove('disabled'));
            if (this.#dataIndex === 0) {
                this.leftArrow.classList.add('disabled');
            }
            if (this.#dataIndex === this.slides.length - 1) {
                this.rightArrow.classList.add('disabled');
            }
        }
        if(this.settings.pagination) {
            this.#updatePagination();
        }
        if(this.settings.progressbar) {
            this.#updateProgressBar();

        }

    }

    #updateIndex(step = 0) {

        this.#dataIndex += step;

        if(this.settings.infinitySlides) {

            if(this.#dataIndex > this.slides.length - 1) {
                this.#dataIndex = 0;
            } else if(this.#dataIndex < 0) {
                this.#dataIndex = this.slides.length - 1;
            }
        } else {

            if(this.#dataIndex > this.slides.length - 2) {
                this.#dataIndex = this.slides.length - 1;
            } else if(this.#dataIndex < 0) {
                this.#dataIndex = 0;
            } 

        }


        if(this.onIndexUpdate) {
            this.onIndexUpdate();
        }

        this.#onPriviteSlideUpdate();

    }


    #onPriviteSlideUpdate() {
        this.#detectPrevNextSlides();
    }

    #detectPrevNextSlides() {
        this.slides.forEach(e => {
            e.classList.remove('prev');
            e.classList.remove('next');
          });

        const prevIndex = this.#dataIndex - 1 < 0 ? this.slides.length - 1 : this.#dataIndex - 1;
        this.prevSlide = this.slides[prevIndex]
        this.prevSlide.classList.add('prev');

        const nextIndex = this.#dataIndex + 1 >= this.slides.length ? 0 : this.#dataIndex + 1;
        this.nextSlide = this.slides[nextIndex];
        this.nextSlide.classList.add('next');
    }


    // setters

    set onSlideUpdate(funct) {
        if(funct) this.onIndexUpdate = funct;
    }


    set onLoad(func) {
        if(func) func();
    }


}



