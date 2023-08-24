addEventListener( 'DOMContentLoaded', function () {

    // Make sure there are galleries
    /** @type {HTMLCollection} */
    const galleries = document.getElementsByClassName( 'simple-gallery' );

    if ( galleries.length === 0 ) {
        return;
    }

    const body = document.getElementsByTagName( 'body' ).item( 0 );

    const modalHandlers = [];

    for ( let gallery of galleries ) {
        modalHandlers.push( new SimpleGalleryModalHandler( gallery ) );
    }

    addEventListener( 'pointerup', function ( event ) {

        for ( let modalHandler of modalHandlers ) {
            modalHandler.resetMouse();
        }

    } );

    addEventListener( 'drag', function ( event ) {

        for ( let modalHandler of modalHandlers ) {
            modalHandler.resetMouse();
        }

    } );

    addEventListener( 'keydown', function ( event ) {

        for ( let modalHandler of modalHandlers ) {

            if ( modalHandler.active ) {

                modalHandler.onKeyPress( event );
                break;

            }

        }

    } );

} );