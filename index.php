<?php

/**
 * Plugin Name: Simple Gallery
 * Description: A simple gallery plugin for WordPress. I made it to grow my WordPress plugin development skills. Note that I don't currently have plans to maintain it, so use it at your own risk.
 * Plugin URI: https://github.com/B-rando1/simple-gallery
 * Author: Brandon Bosman
 * Author URI: https://github.com/B-rando1
 * Version: 0.1
 * Update URI: localhost:8888/wordpress
 * Requires at least: 5.9.0
 * Tested up to: 6.2.2
 * Requires PHP: 8.1
 * Text Domain: simple-gallery
 * Domain Path: /languages
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( esc_html__( 'Access Denied', 'simple-gallery' ) );
}

define( 'SIMPLE_GALLERY_PATH', plugin_dir_path( __FILE__ ) );
define( 'SIMPLE_GALLERY_URL', plugin_dir_url( __FILE__ ) );

require_once( SIMPLE_GALLERY_PATH . '/admin/gallery-cpt.php' );
require_once( SIMPLE_GALLERY_PATH . '/public/public.php' );

SimpleGalleryCPT::getInstance();
SimpleGalleryPublic::getInstance();