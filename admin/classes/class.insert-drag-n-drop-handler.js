class SimpleGalleryInsertDNDHandler extends SimpleGalleryDNDHandler {

    /** @type {Element} */
    #tempDiv;
    #oldJSON;
    #JSONField;

    /**
     * @param {int} dragId The media id for the image being dragged.
     * @param {HTMLElement} dragElement The container div for the image being dragged.
     *
     * @returns {void}
     */
    constructor( dragId, dragElement ) {

        super( dragId, dragElement );

        // A temporary div to store the original position of the image in case the drag is cancelled
        this.#tempDiv = document.createElement( 'div' );
        this.#tempDiv.classList.add( 'simple-gallery-temp-div' );
        dragElement.parentElement.insertBefore( this.#tempDiv, this.dragElement );

        // Save old index in JSON, in case we have to cancel the drag
        this.#JSONField = document.getElementById( 'simple_gallery_image_ids' );
        this.#oldJSON = this.#JSONField.value;

    }

    /**
     * @param {DragEvent} event
     *
     * @returns {void}
     */
    onDragEnter( event ) {

        /** @type {Element|null} */
        const image_div = event.target.closest( '.simple-gallery-image-container' );

        if ( image_div === null || ! event.dataTransfer.types.includes( 'text/simple_gallery_img_id' ) ) {
            return;
        }

        event.preventDefault();

        // Move and update, and keep track of the image that was moved aside
        this.#moveAndUpdate( image_div );

    }

    /**
     * @param {DragEvent} event
     *
     * @returns {void}
     */
    onDrop( event ) {

        const receiving_image_div = event.target.closest( '.simple-gallery-image-container' );

        if ( receiving_image_div === null || parseInt( event.dataTransfer.getData( 'text/simple_gallery_img_id' ) ) !== this.dragId ) {
            return;
        }

        event.preventDefault();

    }

    /**
     * @param {DragEvent} event
     *
     * @returns {void}
     */
    onDragEnd( event ) {

        super.onDragEnd( event );

        // If drag was cancelled, put the image back where it was and set the JSON back where it was.
        if ( event.dataTransfer.dropEffect !== 'move' ) {

            this.#tempDiv.parentElement.insertBefore( this.dragElement, this.#tempDiv );
            this.#JSONField.value = this.#oldJSON;

        }

        this.#tempDiv.parentElement.removeChild( this.#tempDiv );

    }

    /**
     * Inserts the dragged image div where the target is, and updates its JSON
     *
     * @param {Element} receiving_image_div
     */
    #moveAndUpdate( receiving_image_div ) {

        // Decide if we need to change anything
        const receiving_image = receiving_image_div.firstElementChild;
        const receiving_id    = parseInt( receiving_image.getAttribute( 'data-id' ) );

        if ( receiving_id === this.dragId ) {
            return;
        }

        // Decide if moving before or after receiving div
        let raw_json = this.#JSONField.value;
        let img_ids  = JSON.parse( raw_json );

        const drag_index    = img_ids.indexOf( this.dragId );
        let receiving_index = img_ids.indexOf( receiving_id );

        const insertAfter = receiving_index > drag_index;

        // Update JSON
        img_ids.splice( drag_index, 1 );

        // Shift receiving index if we removed dragId from before it
        if ( receiving_index > drag_index ) {
            receiving_index --;
        }

        if ( insertAfter ) {
            img_ids.splice( receiving_index + 1, 0, this.dragId );
        }
        else {
            img_ids.splice( receiving_index, 0, this.dragId );
        }

        raw_json = JSON.stringify( img_ids );
        this.#JSONField.value = raw_json;

        // Move the images around
        if ( insertAfter ) {
            receiving_image_div.after( this.dragElement );
        }
        else {
            receiving_image_div.before( this.dragElement );
        }

    }

}