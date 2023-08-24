<?php

if ( ! defined( 'ABSPATH' ) ) {
	die( esc_html__( 'Access Denied', 'validate-user' ) );
}

if ( class_exists( 'SimpleGalleryPublic' ) ) {
	return;
}

class SimpleGalleryPublic {

	private static ?SimpleGalleryPublic $instance = null;

	/**
	 * Sets up hooks for the frontend gallery.
	 */
	private function __construct() {

		add_shortcode( 'simple_gallery', [$this, 'galleryHTML'] );

		add_action( 'wp_enqueue_scripts', [$this, 'enqueueScripts'] );

	}

	/**
	 * Gets the singleton instance.
	 *
	 * @return SimpleGalleryPublic The singleton instance.
	 */
	public static function getInstance(): SimpleGalleryPublic {

		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;

	}

	public function enqueueScripts(): void {

        global $post;

        if ( ! $post || ! is_a( $post, 'WP_Post' ) || ! has_shortcode( $post->post_content, 'simple_gallery' ) ) {
            return;
        }

        wp_register_script( 'simple_gallery_modal_handler', SIMPLE_GALLERY_URL . '/public/classes/class.modal-handler.js' );
		wp_register_script( 'simple_gallery_public_script', SIMPLE_GALLERY_URL . '/public/public.js', ['simple_gallery_modal_handler'] );
		wp_enqueue_script( 'simple_gallery_public_script' );

		wp_register_style( 'simple_gallery_public_styles', SIMPLE_GALLERY_URL . '/public/public.css' );
		wp_enqueue_style( 'simple_gallery_public_styles' );

	}

	public function galleryHTML( $attrs ): string {

		if ( ! isset( $attrs['id'] ) ) {
			return '';
		}

        // Get image data to display
		$gallery_id = $attrs['id'];
		$img_ids    = json_decode( get_post_meta( $gallery_id, 'simple_gallery_image_ids', true ) );

        // Find out how many preview images to show
        $preview_type = get_post_meta( $attrs['id'], 'simple_gallery_preview_type', true );
        if ( empty( $preview_type ) || $preview_type === 'number' ) {

	        $preview_num = get_post_meta( $attrs['id'], 'simple_gallery_preview_number', true );
	        if ( empty( $preview_num ) && $preview_num !== '0' ) {
		        $preview_num = 7;
	        }

        }
        else {
	        $preview_num = sizeof( $img_ids );
        }

		ob_start(); ?>

        <!-- Container div -->
        <div class="simple-gallery">

            <!-- Images used to open the lightbox -->
            <div class="simple-gallery-frontend-grid">
                <?php foreach( $img_ids as $index => $img_id ) {
                    $img_src = esc_attr( wp_get_attachment_image_src( $img_id, 'full' )[0] );
                    $img_alt = esc_attr( get_post_meta( $img_id, '_wp_attachment_image_alt', true ) );
                    ?>

                    <div class="column">
                        <img class="simple-gallery-gallery-image open-slide hover-shadow" src="<?php echo $img_src; ?>" alt="<?php echo $img_alt; ?>" data-index="<?php echo $index + 1; ?>" />
                    </div>

                <?php } ?>
            </div>

            <!-- The model/lightbox -->
            <div class="simple-gallery-modal modal">
                <span class="close cursor">&times;</span>
                <div class="modal-content">

                    <!-- Slides -->
                    <div class="slides-container">
                        <?php
                        $count = sizeof( $img_ids );
                        foreach( $img_ids as $index => $img_id ) {
                            $img_src = esc_attr( wp_get_attachment_image_src( $img_id, 'full' )[0] );
                            $img_alt = esc_attr( get_post_meta( $img_id, '_wp_attachment_image_alt', true ) );
                            ?>
                            <div class="simple-gallery-slide">
                                <div class="numbertext"><?php echo $index + 1 . ' / ' . $count; ?></div>
                                <img src="<?php echo $img_src; ?>" alt="<?php echo $img_alt; ?>" draggable="false" />
                            </div>
                        <?php } ?>
                    </div>

                    <!-- Next/previous controls -->
                    <a class="prev">&#10094</a>
                    <a class="next">&#10095</a>

                    <!-- Caption text -->
                    <div class="caption-container">
                        <p class="simple-gallery-caption"></p>
                    </div>

                    <!-- Thumbnail image controls -->
                    <div class="preview-container" data-preview-num="<?php echo $preview_num; ?>">
                        <?php foreach( $img_ids as $index => $img_id ) {
                            $img_src = esc_attr( wp_get_attachment_image_src( $img_id, 'full' )[0] );
                            $img_alt = esc_attr( get_post_meta( $img_id, '_wp_attachment_image_alt', true ) );
                            ?>

                            <div class="preview-column">
                                <img class="demo open-slide" src="<?php echo $img_src; ?>" alt="<?php echo $img_alt; ?>" data-index="<?php echo $index + 1; ?>" />
                            </div>

                        <?php } ?>
                    </div>

                </div>
            </div>

        </div>

		<?php return ob_get_clean();

	}

}