<?php
/**
 * Plugin Name:       Block Supports Extended
 * Description:       Plugin for extending built in block supports
 * Requires at least: 6.3
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Human Made Limited
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       block-supports-extended
 *
 * @package           block-supports-ext
 */

namespace Block_Supports_Extended;

use WP_Block_Type_Registry;
use WP_HTML_Tag_Processor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Queue up the client side UI script.
 */
function enqueue_block_editor_assets() : void {
	global $block_supports_extended;

	$asset_data = include __DIR__ . '/build/index.asset.php';

	wp_enqueue_script(
		'block-supports-extended',
		plugins_url( 'build/index.js', __FILE__ ),
		$asset_data['dependencies'],
		$asset_data['version'],
		[
			'strategy' => 'async',
		]
	);

	wp_localize_script(
		'block-supports-extended',
		'blockSupportsExtended',
		(object) ( $block_supports_extended ?? [] )
	);
}

add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\\enqueue_block_editor_assets' );

/**
 * Register a new block supports subfeature.
 *
 * @param string $feature Primary feature name e.g. color, border, typography.
 * @param string $name Subfeature name.
 * @param array $args {
 *     Optional. An array of options. Default empty array.
 *
 *     @type string $label    A human readable label for the field.
 *     @type string $selector The CSS selector, use %s or %1$s for the generated block class name.
 *     @type string $default  A default value for the CSS property to use if none is set.
 *     @type string $property The CSS property being set, e.g. text, background or gradient for color sub features.
 *     @type array $blocks    A list of default blocks that support this sub feature.
 * }
 * @return void
 */
function register( string $feature, string $name, array $args = [] ) {
	global $block_supports_extended;

	if ( empty( $block_supports_extended ) ) {
		$block_supports_extended = [ $feature => [] ];
	}

	if ( ! isset( $block_supports_extended[ $feature ] ) ) {
		$block_supports_extended[ $feature ] = [];
	}

	$key = _to_camelcase( $name, true );

	$block_supports_extended[ $feature ][ $key ] = wp_parse_args( $args, [
		'name' => $name,
		'label' => $name,
		'selector' => '.%s',
		'default' => '',
		'property' => 'text',
		'blocks' => [],
	] );
}

/**
 * Add support for a custom feature to a block / blocks.
 *
 * @param string $feature The top level feature name.
 * @param string $name The subfeature property name.
 * @param array $blocks The blocks to add support to.
 * @return void
 */
function add_support( string $feature, string $name, array $blocks ) {
	global $block_supports_extended;

	$key = _to_camelcase( $name, true );

	if ( ! isset( $block_supports_extended[ $feature ][ $key ] ) ) {
		return;
	}

	$block_supports_extended[ $feature ][ $key ]['blocks'] = array_merge(
		$block_supports_extended[ $feature ][ $key ]['blocks'] ?? [],
		$blocks
	);

	$block_supports_extended[ $feature ][ $key ]['blocks'] = array_unique(
		$block_supports_extended[ $feature ][ $key ]['blocks']
	);
}

/**
 * Convert a string to camel case.
 *
 * @param string $str
 * @param boolean $lower_case_first
 * @return string
 */
function _to_camelcase( string $str, bool $lower_case_first = false ) : string {
	$camel_case = implode( '', array_map( function ( $part ) {
		return ucwords( $part );
	}, explode( '-', sanitize_title_with_dashes( $str ) ) ) );

	if ( $lower_case_first ) {
		$camel_case = lcfirst( $camel_case );
	}

	return $camel_case;
}

/**
 * Updates the block content with elements class names.
 *
 * @since 5.8.0
 * @access private
 *
 * @param string $block_content Rendered block content.
 * @param array  $block         Block object.
 * @return string Filtered block content.
 */
function render_elements_color_support( $block_content, $block ) {
	global $block_supports_extended;

	if ( ! $block_content ) {
		return $block_content;
	}

	if ( ! isset( $block_supports_extended['color'] ) ) {
		$block_supports_extended['color'] = [];
	}

	$block_type = WP_Block_Type_Registry::get_instance()->get_registered( $block['blockName'] );

	$color = null;

	foreach ( $block_supports_extended['color'] as $name => $settings ) {
		if ( ! block_has_support( $block_type, [ 'color', $name ] ) ) {
			continue;
		}

		$skip_serialization = wp_should_skip_block_supports_serialization( $block_type, 'color', $name );

		if ( $skip_serialization ) {
			continue;
		}

		if ( ! empty( $block['attrs'] ) ) {
			$property = $settings['property'] ?? 'text';
			$color = _wp_array_get( $block['attrs'], [ 'style', 'elements', $name, 'color', $property ], null );
		}
	}

	if ( null === $color ) {
		return $block_content;
	}

	// Like the layout hook this assumes the hook only applies to blocks with a single wrapper.
	// Add the class name to the first element, presuming it's the wrapper, if it exists.
	$tags = new WP_HTML_Tag_Processor( $block_content );
	if ( $tags->next_tag() ) {
		$tags->add_class( wp_get_elements_class_name( $block ) );
	}

	return $tags->get_updated_html();
}

add_filter( 'render_block', __NAMESPACE__ . '\\render_elements_color_support', 10, 2 );

/**
 * Renders the elements stylesheet.
 *
 * In the case of nested blocks we want the parent element styles to be rendered before their descendants.
 * This solves the issue of an element (e.g.: link color) being styled in both the parent and a descendant:
 * we want the descendant style to take priority, and this is done by loading it after, in DOM order.
 *
 * @since 6.0.0
 * @since 6.1.0 Implemented the style engine to generate CSS and classnames.
 * @access private
 *
 * @param string|null $pre_render The pre-rendered content. Default null.
 * @param array       $block      The block being rendered.
 * @return null
 */
function render_elements_support_styles( $pre_render, $block ) {
	global $block_supports_extended;

	if ( ! isset( $block_supports_extended['color'] ) ) {
		$block_supports_extended['color'] = [];
	}

	$block_type = WP_Block_Type_Registry::get_instance()->get_registered( $block['blockName'] );

	foreach ( $block_supports_extended as $feature => $properties ) {
		foreach ( $properties as $name => $settings ) {

			if ( ! block_has_support( $block_type, [ $feature, $name ] ) ) {
				continue;
			}

			$element_block_styles = isset( $block['attrs']['style']['elements'] ) ? $block['attrs']['style']['elements'] : null;
			$skip_serialization = wp_should_skip_block_supports_serialization( $block_type, $feature, $name );

			if ( $skip_serialization ) {
				continue;
			}

			$class_name = wp_get_elements_class_name( $block );
			$block_styles = isset( $element_block_styles[ $name ] ) ? $element_block_styles[ $name ] : null;

			wp_style_engine_get_styles(
				$block_styles,
				[
					// Make the selector extra specific to support having a default value in the main stylesheet.
					'selector' => sprintf( $settings['selector'], $class_name ),
					'context'  => 'block-supports',
				]
			);
		}
	}

	return $pre_render;
}

add_filter( 'pre_render_block', __NAMESPACE__ . '\\render_elements_support_styles', 10, 2 );

/**
 * Modify the block registration data to add support for custom features.
 *
 * @param array $metadata The block.json regstration metadata.
 * @return array
 */
function filter_metadata_registration( $metadata ) {
	global $block_supports_extended;

	if ( empty( $block_supports_extended ) ) {
		$block_supports_extended = [];
	}

	foreach ( $block_supports_extended as $feature => $properties ) {

		foreach ( $properties as $name => $settings ) {
			if ( ! in_array( $metadata['name'], $settings['blocks'] ?? [], true ) ) {
				continue;
			}

			if ( ! is_array( $metadata['supports'][ $feature ] ?? null ) ) {
				continue;
			}

			if ( ! isset( $metadata['supports'] ) ) {
				$metadata['supports'] = [ $feature => [] ];
			}

			if ( ! isset( $metadata['supports'][ $feature ] ) ) {
				$metadata['supports'][ $feature ] = [];
			}

			if ( ! is_array( $metadata['supports'][ $feature ] ) ) {
				$metadata['supports'][ $feature ] = [];
			}

			$metadata['supports'][ $feature ][ $name ] = true;
		}
	}

	return $metadata;
};

add_filter( 'block_type_metadata', __NAMESPACE__ . '\\filter_metadata_registration' );
