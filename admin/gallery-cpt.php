<?php

if ( ! defined( 'ABSPATH' ) ) {
	die( esc_html__( 'Access Denied', 'validate-user' ) );
}

if ( class_exists( 'SimpleGalleryCPT' ) ) {
	return;
}

class SimpleGalleryCPT {

	private static ?SimpleGalleryCPT $instance = null;

	/**
	 * Sets up hooks for the admin gallery editor.
	 */
	private function __construct() {

		add_action( 'admin_enqueue_scripts', [$this, 'enqueueAdminScripts'] );

		add_action( 'init', [$this, 'registerCPT'] );

		add_action( 'add_meta_boxes', [$this, 'createMetaBoxes'] );
		add_action( 'save_post', [$this, 'saveMedia'] );
        add_action( 'save_post', [$this, 'saveSettings'] );

	}

	/**
	 * Gets the singleton instance.
	 *
	 * @return SimpleGalleryCPT The singleton instance.
	 */
	public static function getInstance(): SimpleGalleryCPT {

		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;

	}

	public function enqueueAdminScripts( $hook ): void {

        global $post;

		if ( 'post.php' === $hook && 'simple_gallery' === $post->post_type ) {

            wp_register_script( 'simple_gallery_dnd_handler', SIMPLE_GALLERY_URL . 'admin/classes/class.drag-n-drop-handler.js', [], 0.01 );
			wp_register_script( 'simple_gallery_swap_dnd_handler', SIMPLE_GALLERY_URL . 'admin/classes/class.swap-drag-n-drop-handler.js', ['simple_gallery_dnd_handler'], 0.01 );
			wp_register_script( 'simple_gallery_insert_dnd_handler', SIMPLE_GALLERY_URL . 'admin/classes/class.insert-drag-n-drop-handler.js', ['simple_gallery_dnd_handler'], 0.01 );

            wp_register_script( 'simple_gallery_select_media', SIMPLE_GALLERY_URL . '/admin/select-images.js', [], '0.01' );
			wp_register_script( 'simple_gallery_drag-n-drop', SIMPLE_GALLERY_URL . '/admin/drag-n-drop.js', [], '0.01' );

			wp_enqueue_media();
			wp_enqueue_script( 'simple_gallery_select_media' );

			wp_enqueue_script( 'simple_gallery_swap_dnd_handler' );
			wp_enqueue_script( 'simple_gallery_insert_dnd_handler' );
            wp_enqueue_script( 'simple_gallery_drag-n-drop' );

			wp_register_style( 'simple_gallery_admin_styles', SIMPLE_GALLERY_URL . '/admin/admin.css', [], '0.01' );
			wp_enqueue_style( 'simple_gallery_admin_styles' );

		}

	}

	/**
	 * Registers the Gallery Custom Post Type
	 *
	 * @return void
	 */
	public function registerCPT(): void {

		register_post_type(
			'simple_gallery',
			[
				'public'             => true,
				'has_archive'        => true,
				'publicly_queryable' => false,
				'labels'             => [
					'name'          => esc_html__( 'Galleries', 'simple-gallery' ),
					'singular_name' => esc_html__( 'Gallery', 'simple-gallery' ),
					'edit_item'     => esc_html__( 'Edit Gallery', 'simple-gallery' ),
					'add_new_item'  => esc_html__( 'Create New Gallery', 'simple-gallery' ),
					'new_item'      => esc_html__( 'New Gallery', 'simple-gallery' ),
					'view_item'     => esc_html__( 'View Gallery', 'simple-gallery' )
				],
				'supports'           => ['title'],
				'capability_type'    => 'post',
				'map_meta_cap'       => true,
				'show_in_menu'       => true
			]
		);

	}

	/**
	 * Adds meta box(es) to the gallery editor.
	 *
	 * @return void
	 */
	public function createMetaBoxes(): void {

		add_meta_box(
			'simple_gallery_editor',
			'Gallery Editor',
			[$this, 'galleryEditorHTML'],
			'simple_gallery'
		);

        add_meta_box(
            'simple_gallery_editor_settings',
            'Gallery Editor Settings',
            [$this, 'galleryEditorSettingsHTML'],
            'simple_gallery',
            'side'
        );

		add_meta_box(
			'simple_gallery_settings',
			'Gallery Settings',
			[$this, 'gallerySettingsHTML'],
			'simple_gallery',
			'side'
		);

	}

	public function galleryEditorHTML( $post ): void {

		// Get WordPress' media upload URL
		$upload_link = esc_url( get_upload_iframe_src( 'image', $post->ID ) );

		// See if there's a media id already saved as post meta
		$raw_json = get_post_meta( $post->ID, 'simple_gallery_image_ids', true );
        $image_ids = json_decode( $raw_json );

        if ( ! $image_ids || ! is_array( $image_ids ) ) {
	        $image_ids = [];
        }

        echo '<div class="simple-gallery-images-grid">';

        for ( $i = 0; $i < sizeof( $image_ids ); $i ++ ) {

            $image_ids[$i] = (int) $image_ids[$i];
            $image_id = $image_ids[$i];

            // Get the image src
            $image_src = wp_get_attachment_image_src( $image_id, 'full' );
            $image_alt = get_post_meta( $image_id, '_wp_attachment_image_alt', true );

            // For convenience, see if the array is valid
            $have_img = is_array( $image_src );
            ?>

                <?php if ( $have_img ) : ?>
                    <div class="simple-gallery-image-container">
                        <img src="<?php echo esc_attr( $image_src[0] ); ?>"
                             alt="<?php echo esc_attr( $image_alt ); ?>"
                             id="img-id-<?php echo esc_attr( $image_id ); ?>"
                             data-id="<?php echo esc_attr( $image_id ); ?>"
                             draggable="true" />
                        <button type="button" class="delete-image">&times;</button>
                    </div>
                <?php endif; ?>


        <?php }

        echo '</div>';

        ?>

        <!-- Your add & remove image links -->
        <p>
            <a id="simple-gallery-upload-images"
               href="<?php echo $upload_link ?>">
				<?php esc_html_e( 'Choose images' ) ?>
            </a><br>
            <a class="simple-gallery-remove-images<?php echo ( sizeof( $image_ids ) === 0 ) ? ' hidden' : '' ?>"
               href="#">
				<?php esc_html_e( 'Remove these images' ); ?>
            </a>
        </p>

        <!-- A hidden input to set and post the chosen image id -->
        <input id="simple_gallery_image_ids" name="simple_gallery_image_ids" type="hidden"
               value="<?php echo esc_attr( $raw_json ); ?>"/>

		<?php

	}

    public function saveMedia( $post_id ): void {

        if ( isset( $_POST['simple_gallery_image_ids'] ) ) {

	        $raw_json = sanitize_text_field( $_POST['simple_gallery_image_ids'] );
	        update_post_meta( $post_id, 'simple_gallery_image_ids', $raw_json );

        }

    }

    public function galleryEditorSettingsHTML( $post ): void {
        ?>

        <h4><?php esc_html_e( 'When dragging an image:', 'simple-gallery' ); ?></h4>
        <div class="simple-gallery-switch-container">
            <span class="simple-gallery-switch-text simple-gallery-switch-text-left"><?php esc_html_e( 'Insert and shift others over.', 'simple-gallery' ); ?></span>
            <span class="simple-gallery-switch">
                <input class="simple-gallery-checkbox" type="checkbox" name="gallery-editor-swap-images" id="gallery-editor-swap-images" <?php echo get_option( 'simple_gallery_swap_images', '0' ) === '1' ? ' checked="checked"' : ''; ?> />
                <label class="simple-gallery-toggle" for="gallery-editor-swap-images"></label>
            </span>
            <span class="simple-gallery-switch-text simple-gallery-switch-text-right"><?php esc_html_e( 'Swap with other image.', 'simple-gallery' ); ?></span>
        </div>

        <?php
    }

    public function gallerySettingsHTML( $post ): void {

        $preview_type = get_post_meta( $post->ID, 'simple_gallery_preview_type', true );
        if ( empty( $preview_type ) ) {
            $preview_type = 'number';
        }

        $preview_number = get_post_meta( $post->ID, 'simple_gallery_preview_number', true );
        if ( empty( $preview_number ) && $preview_number !== '0' ) {
            $preview_number = 7;
        }

        ?>

        <h4><?php esc_html_e( 'Type of preview:', 'simple-gallery' ); ?></h4>
        <div class="simple-gallery-switch-container">
            <span class="simple-gallery-switch-text simple-gallery-switch-text-left"><?php esc_html_e( 'Choose a number.', 'simple-gallery' ); ?></span>
            <span class="simple-gallery-switch">
                <input class="simple-gallery-checkbox" type="checkbox" name="simple-gallery-preview-type" id="simple-gallery-preview-type" value="all" <?php echo $preview_type === 'all' ? ' checked="checked"' : ''; ?> />
                <label class="simple-gallery-toggle" for="simple-gallery-preview-type"></label>
            </span>
            <span class="simple-gallery-switch-text simple-gallery-switch-text-right"><?php esc_html_e( 'Show all images.', 'simple-gallery' ); ?></span>
        </div>

        <label for="simple-gallery-preview-number"><?php esc_html_e( 'Number of preview images:', 'simple-gallery' ); ?></label>
        <input type="text" id="simple-gallery-preview-number" name="simple-gallery-preview-number" value="<?php echo $preview_number; ?>" />

        <?php
    }

    public function saveSettings( $post_id ): void {

        $swap_images = ( empty( $_POST['gallery-editor-swap-images'] ) ? '0' : '1' );
        update_option( 'simple_gallery_swap_images', $swap_images );

        $preview_type = ( empty( $_POST['simple-gallery-preview-type'] ) ? 'number' : 'all' );
        update_post_meta( $post_id, 'simple_gallery_preview_type', $preview_type );

        if ( isset( $_POST['simple-gallery-preview-number'] ) ) {
            update_post_meta( $post_id, 'simple_gallery_preview_number', $_POST['simple-gallery-preview-number'] );
        }

    }
}