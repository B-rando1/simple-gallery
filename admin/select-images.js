addEventListener( 'DOMContentLoaded', () => {

    let /** @type wp.media.view.MediaFrame */
        frame,
        /** @type HTMLElement */
        meta_box         = document.getElementById( 'simple_gallery_editor' ),
        addImagesLink    = document.getElementById( 'simple-gallery-upload-images' ),
        deleteImagesLink = meta_box.getElementsByClassName( 'simple-gallery-remove-images' ).item( 0 ),
        imagesContainer  = meta_box.getElementsByClassName( 'simple-gallery-images-grid' ).item( 0 ),
        JSONField        = document.getElementById( 'simple_gallery_image_ids' );

    addImagesLink.addEventListener( 'click', function ( event ) {

        event.preventDefault();

        let ids;

        try {
            let raw_json = JSONField.value;
            ids          = JSON.parse( raw_json );
        }
        catch {
            ids = [];
        }

        // If the media frame already exists, reopen it.
        if ( undefined !== frame ) {

            let new_selections = ids.map( id => wp.media.attachment( id ) );
            let old_selections = frame.state().get( 'selection' );

            old_selections.reset( new_selections );
            frame.open();

            return;

        }

        // Create a new media frame.
        frame = wp.media( {
            title    : 'Select or Upload Images',
            button   : {
                text : 'Use these images',
            },
            library  : {
                type : 'image',
            },
            multiple : true,
        } );

        // When an image is selected in the media frame...
        frame.on( 'select', function () {

            // Get media attachment details from the frame state
            let attachments = frame.state().get( 'selection' ).toJSON();
            let to_do       = new Set( attachments.map( attachment => attachment.id ) );
            let values      = [];

            // Remove any old images
            let children = Array.from( imagesContainer.children );
            for ( let child of children ) {

                let id = parseInt( child.firstElementChild.getAttribute( 'data-id' ) );

                if ( to_do.has( id ) ) {

                    to_do.delete( id );
                    values.push( id );
                    continue;

                }

                imagesContainer.removeChild( child );

            }

            // Add any new images
            for ( let attachment of attachments ) {

                const id = attachment.id;

                if ( ! to_do.has( id ) ) {
                    continue;
                }

                // Send the attachment URLs to our custom images input field
                const container_div = document.createElement( 'div' );
                container_div.classList.add( 'simple-gallery-image-container' );

                const new_image = document.createElement( 'img' );
                new_image.src   = attachment.url;
                new_image.alt   = attachment.alt;
                new_image.id    = 'img-id-' + id;
                new_image.setAttribute( 'data-id', id );
                new_image.draggable = true;

                const delete_button = document.createElement( 'button' );
                delete_button.type  = 'button';
                delete_button.classList.add( 'delete-image' );
                delete_button.innerHTML = '&times;';

                container_div.appendChild( new_image );
                container_div.appendChild( delete_button );

                imagesContainer.appendChild( container_div );

                // Prepare the hidden JSON input to be updated
                values.push( id );
                to_do.delete( id );

            }

            // Update the JSON
            JSONField.value = JSON.stringify( values );

            // Unhide the remove image link
            deleteImagesLink.classList.remove( 'hidden' );

        } );

        // Open the modal
        frame.open();

        // Set current selections
        let new_selections = ids.map( id => wp.media.attachment( id ) );
        let old_selections = frame.state().get( 'selection' );

        old_selections.reset( new_selections );

    } );

    // Handle the remove images link
    deleteImagesLink.addEventListener( 'click', function ( event ) {

        event.preventDefault();

        // Clear out the preview images
        imagesContainer.textContent = '';

        // Hide the remove images link
        deleteImagesLink.classList.add( 'hidden' );

        // Empty the hidden JSON input field
        JSONField.value = '';

    } );

    // Handle deleting individual images
    document.addEventListener( 'click', function ( event ) {

        if ( ! event.target.classList.contains( 'delete-image' ) ) {
            return;
        }

        // Remove image id from hidden JSON input field
        const img    = event.target.previousElementSibling;
        const img_id = parseInt( img.getAttribute( 'data-id' ) );

        let raw_json  = JSONField.value;
        /** @type array */
        const img_ids = JSON.parse( raw_json );

        const index = img_ids.indexOf( img_id );
        img_ids.splice( index, 1 );

        raw_json = JSON.stringify( img_ids );

        JSONField.value = raw_json;

        // Remove parent element
        const parent = event.target.parentElement;
        parent.remove();

    } );

} );