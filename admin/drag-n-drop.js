addEventListener( 'DOMContentLoaded', () => {

    /** @type SimpleGalleryDNDHandler */
    let dndHandler;

    document.addEventListener( 'dragstart', function ( event ) {

        if ( event.target.tagName !== 'IMG' || ! event.target.parentElement.classList.contains( 'simple-gallery-image-container' ) ) {
            return;
        }

        const dragElem = event.target.parentElement;
        event.dataTransfer.setData( 'text/simple_gallery_img_id', event.target.getAttribute( 'data-id' ) );
        const dragId = parseInt( event.target.getAttribute( 'data-id' ) );

        // Create a handler object that will take care of the events
        if ( document.getElementById( 'gallery-editor-swap-images' ).checked ) {
            dndHandler = new SimpleGallerySwapDNDHandler( dragId, dragElem );
        }
        else {
            dndHandler = new SimpleGalleryInsertDNDHandler( dragId, dragElem );
        }

        // Free up the memory holding the drag handler once the drag is over
        dragElem.addEventListener( 'dragend', () => dndHandler = null, {once: true} );

    } );

} );