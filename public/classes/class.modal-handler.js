class SimpleGalleryModalHandler {

    // HTML elements
    /** @type {HTMLElement} */
    #body;
    /** @type {HTMLElement} */
    #gallery;
    /** @type {HTMLElement} */
    #modal;
    /** @type {HTMLCollectionOf<HTMLElement>} */
    #slides;
    /** @type {HTMLElement} */
    #previewContainer;
    /** @type {HTMLCollectionOf<HTMLElement>} */
    #previews;
    /** @type {HTMLElement} */
    #captionArea;

    // States & stuff
    active;
    #slideIndex;
    #offset;

    // Stats or something
    #previewNum;
    #previewNumHalf;

    // For pointer events
    #startX;
    #threshHold;
    #onlyOnce;
    #startTarget;
    #startSlide;
    #pointerMoveCallback;
    #pointerUpCallback;

    constructor( gallery ) {

        // Assign HTML Elements
        this.#gallery = gallery;
        this.#body = document.getElementsByTagName( 'body' ).item( 0 );
        this.#modal = gallery.getElementsByClassName( 'simple-gallery-modal' ).item( 0 );
        this.#slides = this.#modal.getElementsByClassName( 'simple-gallery-slide' );
        this.#previewContainer = this.#modal.getElementsByClassName( 'preview-container' ).item( 0 );
        this.#previews = this.#previewContainer.getElementsByClassName( 'demo' );
        this.#captionArea = this.#modal.getElementsByClassName( 'simple-gallery-caption' ).item( 0 );

        // Setup states
        this.active = false;
        this.#slideIndex = 1;
        this.#offset = 0;

        // Setup styling for modal window
        const wpAdminBar = document.getElementById( 'wpadminbar' );
        if ( wpAdminBar !== null ) {

            this.#modal.style.top = wpAdminBar.offsetHeight.toString() + 'px';
            this.#modal.style.height = 'calc( 100vh - ' + wpAdminBar.offsetHeight + 'px )';

        }

        // Setup styling for preview images
        this.#previewNum = parseInt( this.#previewContainer.getAttribute( 'data-preview-num' ) );
        const previewDivs = this.#previewContainer.children;

        this.#previewNumHalf = Math.floor( this.#previewNum / 2 );

        if ( this.#previewNum !== 0 ) {
            for ( let previewDiv of previewDivs ) {
                previewDiv.style.width = 'calc( 100% / ' + this.#previewNum + ' )';
            }
        }
        else {
            for ( let previewDiv of previewDivs ) {
                previewDiv.style.width = '0';
                previewDiv.style.height = '0';
            }
        }

        // Setup event handlers
        this.#gallery.getElementsByClassName( 'simple-gallery-frontend-grid' )
            .item( 0 ).addEventListener( 'pointerdown', this.onPointerDownGallery.bind( this ) );
        this.#modal.addEventListener( 'pointerdown', this.onPointerDownModal.bind( this ) );

    }

    // Event handlers
    /**
     * Handles the pointerdown event for the gallery, setting up other event listeners as needed.
     *
     * @param {PointerEvent} event
     */
    onPointerDownGallery( event ) {

        if ( event.pointerType === 'mouse' && event.button !== 0 ) {
            return;
        }

        // Check for a button press when the pointer is released.
        this.#startTarget = event.target;

        this.#pointerUpCallback = this.checkClick.bind( this );
        this.#gallery.addEventListener( 'pointerup', this.#pointerUpCallback, {once: true} );

    }

    /**
     * Handles the pointerdown event for the modal, setting up other event listeners as needed.
     *
     * @param {PointerEvent} event
     */
    onPointerDownModal( event ) {

        if ( event.pointerType === 'mouse' && event.button !== 0 ) {
            return;
        }

        // Check for a button press when the pointer is released.
        this.#startTarget = event.target;

        this.#pointerUpCallback = this.checkClick.bind( this );
        this.#gallery.addEventListener( 'pointerup', this.#pointerUpCallback, {once: true} );

        // If clicking a button, don't check for swiping
        const classes = event.target.classList;
        if ( classes.contains( 'close' ) || classes.contains( 'simple-gallery-modal' ) || classes.contains( 'prev' ) || classes.contains( 'next' ) ) {
            return;
        }

        // Start listening for swiping the gallery
        this.#startX = event.pageX;
        this.#startSlide = this.#slideIndex;

        const slideWidth = this.#modal.getElementsByClassName( 'slides-container' ).item( 0 ).offsetWidth;
        if ( event.target.closest( '.preview-container' ) !== null ) {
            this.#threshHold = slideWidth / this.#previewNum;
            this.#onlyOnce = false;
        }
        else {
            this.#threshHold = slideWidth / 4;
            this.#onlyOnce = true;
        }
        if ( isNaN( this.#threshHold ) || this.#threshHold === 0 ) {
            this.#threshHold = window.innerWidth / 4;
        }

        this.#pointerMoveCallback = this.swipeSlides.bind( this );
        addEventListener( 'pointermove', this.#pointerMoveCallback );

    }

    /**
     * Handles a pointermove event, if there was a pointerdown event on the slides.
     *
     * @param {PointerEvent} event
     */
    swipeSlides( event ) {

        const dragDistance = Math.abs( event.pageX - this.#startX );
        const dragSign = -Math.sign( event.pageX - this.#startX );

        let slideDiff = dragSign * Math.round( dragDistance / this.#threshHold );
        if ( this.#onlyOnce ) {
            slideDiff = Math.sign( slideDiff );
        }

        this.showSlide( this.#startSlide + slideDiff );

    }

    /**
     * Handles a pointerup event, if there was a pointerdown event on a button or the like.
     *
     * @param {PointerEvent} event
     */
    checkClick( event ) {

        if ( ! event.target.isSameNode( this.#startTarget ) ) {
            return;
        }

        const classes = event.target.classList;

        if ( classes.contains( 'close' ) || classes.contains( 'simple-gallery-modal' ) ) {

            this.closeModal();
            return;

        }

        if ( classes.contains( 'simple-gallery-gallery-image' ) ) {
            this.openModal();
        }
        else if ( classes.contains( 'prev' ) ) {
            this.showSlide( this.#slideIndex - 1 );
        }
        else if ( classes.contains( 'next' ) ) {
            this.showSlide( this.#slideIndex + 1 );
        }

        if ( classes.contains( 'open-slide' ) ) {
            this.showSlide( parseInt( event.target.getAttribute( 'data-index' ) ) );
        }

    }

    /**
     * Handles a key press event, passed from public.js if the modal is active.
     *
     * @param {KeyboardEvent} event
     */
    onKeyPress( event ) {

        if ( event.key === 'Escape' || event.key === 'Esc' ) {
            this.closeModal();
        }

        if ( event.key === 'ArrowLeft' || event.key === 'Left' ) {
            this.showSlide( this.#slideIndex - 1 );
        }

        if ( event.key === 'ArrowRight' || event.key === 'Right' ) {
            this.showSlide( this.#slideIndex + 1 );
        }

    }

    // Auxiliary functions
    /**
     * Opens the lightbox modal.
     */
    openModal() {

        this.#modal.style.display = 'block';
        this.#body.style.overflow = 'hidden';
        this.active = true;

    }

    /**
     * Closes the lightbox modal.
     */
    closeModal() {

        this.#modal.style.display = 'none';
        this.#body.style.overflow = 'auto';
        this.active = false;

    }

    /**
     * Sets the gallery lightbox to the given image index.
     *
     * @param {int} index The 1-indexed slide index to show.
     */
    showSlide( index ) {

        this.#slideIndex = index % this.#slides.length;
        if ( this.#slideIndex < 1 ) {
            this.#slideIndex += this.#slides.length;
        }

        // Rotate previews around if you're on the edge
        let targetOffset = 0;

        if ( this.#slideIndex <= this.#previewNumHalf ) {
            targetOffset = this.#previewNumHalf - this.#slideIndex + 1 ;
        }
        else if ( this.#slides.length - this.#slideIndex < this.#previewNumHalf ) {
            targetOffset = -this.#previewNumHalf + ( this.#slides.length - this.#slideIndex );
        }

        if ( targetOffset !== this.#offset ) {
            this.rotateTo( targetOffset );
        }

        // Hide slides
        for ( let slide of this.#slides ) {
            slide.style.display = 'none';
        }

        // Update which previews are visible
        for ( let preview of this.#previews ) {
            preview.classList.remove( 'active' );
            preview.style.display = 'none';
        }

        let previewIndex = this.#slideIndex + this.#offset;
        if ( previewIndex < 0 ) {
            previewIndex += this.#slides.length;
        }

        for ( let i = 0; i < this.#previewNum; i ++ ) {

            let newIndex = ( previewIndex - 1 + i - this.#previewNumHalf ) % this.#previews.length;
            if ( newIndex < 0 ) {
                newIndex += this.#previews.length;
            }
            this.#previews[newIndex].style.display = 'block';

        }

        // Show the slide that should be visible
        this.#slides[this.#slideIndex - 1].style.display = 'block';
        this.#previews[previewIndex - 1].classList.add( 'active' );

        let caption = this.#previews[previewIndex - 1].alt;
        this.#captionArea.innerHTML = caption;
        if ( caption === '' ) {
            this.#captionArea.style.display = 'none';
        }
        else {
            this.#captionArea.style.display = 'block';
        }

    }

    /**
     * Rotates the preview images around.
     *
     * @param {int} newOffset
     */
    rotateTo( newOffset ) {

        if ( newOffset - this.#offset > 0 ) {

            // Take from the back and add to the front
            for ( let i = 0; i < newOffset - this.#offset; i ++ ) {
                this.#previewContainer.prepend( this.#previewContainer.lastElementChild );
            }

        }
        else if ( this.#offset - newOffset > 0 ) {

            // Take from the front and add to the back
            for ( let i = 0; i < this.#offset - newOffset; i ++ ) {
                this.#previewContainer.append( this.#previewContainer.firstElementChild );
            }

        }

        this.#offset = newOffset;

    }

    /**
     * Removes any mouse event handlers that might be temporarily attached
     */
    resetMouse() {

        this.#gallery.removeEventListener( 'pointerup', this.#pointerUpCallback );
        removeEventListener( 'pointermove', this.#pointerMoveCallback );

    }
}