/**
 * The abstract class for handling drag events in the gallery editor
 */
class SimpleGalleryDNDHandler {

    dragId;
    dragElement;

    dragEnterCallback;
    dragoverCallback;
    dragLeaveCallback;
    dropCallback;
    dragCallback;

    /**
     * @param {int} dragId The media id for the image being dragged.
     * @param {HTMLElement} dragElement The container div for the image being dragged.
     *
     * @returns {void}
     */
    constructor( dragId, dragElement ) {

        if ( this.constructor === SimpleGalleryDNDHandler ) {
            throw new Error( 'Cannot instantiate abstract class ' + this.constructor.name );
        }

        this.dragId = dragId;
        this.dragElement = dragElement;

        this.dragEnterCallback = this.onDragEnter.bind( this );
        document.addEventListener( 'dragenter', this.dragEnterCallback );
        this.dragoverCallback = this.onDragOver.bind( this );
        document.addEventListener( 'dragover', this.dragoverCallback );
        this.dragLeaveCallback = this.onDragLeave.bind( this );
        document.addEventListener( 'dragleave', this.dragLeaveCallback );
        this.dropCallback = this.onDrop.bind( this );
        document.addEventListener( 'drop', this.dropCallback );

        this.dragCallback = this.onDrag.bind( this );
        this.dragElement.addEventListener( 'drag', this.dragCallback );
        this.dragElement.addEventListener( 'dragend', this.onDragEnd.bind( this ), {once: true} );

    }

    /**
     * @param {DragEvent} event
     *
     * @returns {void}
     */
    onDragEnter( event ) {
        throw new Error( 'Abstract method must be implemented' );
    }

    /**
     * @param {DragEvent} event
     *
     * @returns {void}
     */
    onDragOver( event ) {

        const image_div = event.target.closest( '.simple-gallery-image-container' );

        if ( image_div === null || ! event.dataTransfer.types.includes( 'text/simple_gallery_img_id' ) ) {
            return;
        }

        event.preventDefault();

        event.dataTransfer.dropEffect = 'move';

    }

    /**
     * @param {DragEvent} event
     *
     * @returns {void}
     */
    onDragLeave( event ) {

        const image_div = event.target.closest( '.simple-gallery-image-container' );

        if ( image_div === null || ! event.dataTransfer.types.includes( 'text/simple_gallery_img_id' ) ) {
            return;
        }

        event.preventDefault();

        /** @type DOMRect */
        const dom_rect = image_div.getBoundingClientRect();
        if ( event.clientX < dom_rect.left || event.clientX > dom_rect.right || event.clientY < dom_rect.top || event.clientY > dom_rect.bottom ) {
            image_div.classList.remove( 'swap-target' );
        }

    }

    /**
     * @param {DragEvent} event
     *
     * @returns {void}
     */
    onDrop( event ) {
        throw new Error( 'Abstract method must be implemented' );
    }

    /**
     * @param {DragEvent} event
     *
     * @returns {void}
     */
    onDrag( event ) {

        // This case is most likely a side-effect of the dragend event
        if ( event.clientX === 0 && event.clientY === 0 ) {
            return;
        }

        // Scroll up or down when mouse is near the top or bottom of the page
        if ( event.clientY < 150 ) {
            window.scrollBy( {top: -50, behavior: 'smooth'} );
        }
        if ( ( event.clientY > ( document.documentElement.clientHeight - 150 ) ) ) {
            window.scrollBy( {top: 50, behavior: 'smooth'} );
        }

    };

    /**
     * @param {DragEvent} event
     *
     * @returns {void}
     */
    onDragEnd( event ) {

        document.removeEventListener( 'dragenter', this.dragEnterCallback );
        document.removeEventListener( 'dragover', this.dragoverCallback );
        document.removeEventListener( 'dragleave', this.dragLeaveCallback );
        document.removeEventListener( 'drop', this.dropCallback );

        this.dragElement.removeEventListener( 'drag', this.dragCallback );

    }

}