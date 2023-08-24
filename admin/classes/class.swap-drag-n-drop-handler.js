class SimpleGallerySwapDNDHandler extends SimpleGalleryDNDHandler {

    /**
     * @param {DragEvent} event
     *
     * @returns {void}
     */
    onDragEnter( event ) {

        const image_div = event.target.closest( '.simple-gallery-image-container' );

        if ( image_div === null || ! event.dataTransfer.types.includes( 'text/simple_gallery_img_id' ) ) {
            return;
        }

        event.preventDefault();

        image_div.classList.add( 'swap-target' );

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

        receiving_image_div.classList.remove( 'swap-target' );

        // Decide if we need to change anything
        const receiving_image = receiving_image_div.firstElementChild;
        const receiving_id    = parseInt( receiving_image.getAttribute( 'data-id' ) );

        if ( receiving_id === this.dragId ) {
            return;
        }

        // Update the JSON
        const JSONField = document.getElementById( 'simple_gallery_image_ids' );

        let raw_json = JSONField.value;
        let img_ids  = JSON.parse( raw_json );

        const drag_index    = img_ids.indexOf( this.dragId );
        let receiving_index = img_ids.indexOf( receiving_id );

        img_ids[drag_index] = receiving_id;
        img_ids[receiving_index] = this.dragId;

        raw_json = JSON.stringify( img_ids );
        JSONField.value = raw_json;

        // Move the images around
        const temp_elem = document.createElement( 'div' );
        this.dragElement.parentNode.insertBefore( temp_elem, this.dragElement );

        receiving_image_div.parentNode.insertBefore( this.dragElement, receiving_image_div );

        this.dragElement.parentNode.insertBefore( receiving_image_div, temp_elem );

        temp_elem.parentNode.removeChild( temp_elem );

    }

}