import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { addFilter } from '@wordpress/hooks';
import {
	compose,
	createHigherOrderComponent,
} from '@wordpress/compose';
import {
	InspectorControls,
	withColors,
	__experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
	__experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
	useBlockProps,
} from '@wordpress/block-editor';

const stylesheet = new window.CSSStyleSheet();
document.adoptedStyleSheets.push( stylesheet );

const CSSPropertyMap = {
	text: 'color',
	background: 'background-color',
	gradient: 'background',
};

const colorSupports = window.blockSupportsExtended?.color || {};

Object.entries( colorSupports ).forEach( ( [ name, settings ] ) => {
	/**
	 * Modify block edit component for core/button to add UI for icon.
	 */
	const withPseudoContentColorUI = compose(
		withColors( {
			[ name ]: name,
		} ),
		createHigherOrderComponent( ( BlockEdit ) => {
			return ( props ) => {
				const {
					clientId,
					name: blockName,
					attributes,
					setAttributes,
					[ name ]: customColor,
					[ `set${ name.substring( 0, 1 ).toUpperCase() }${ name.substring( 1 ) }` ]: setCustomColor,
				} = props;

				const hasSupport = useSelect(
					( select ) => {
						const support = select( 'core/blocks' ).getBlockSupport(
							blockName,
							'color'
						);
						return support && support[ name ];
					},
					[ blockName ]
				);

				if ( ! hasSupport ) {
					return <BlockEdit { ...props } />;
				}

				const colorGradientSettings = useMultipleOriginColorsAndGradients();
				const colorValue =
					customColor?.color ||
					attributes?.style?.elements[ name ]?.color[ settings.property ] ||
					'';
				const defaultValue = settings.default || '';

				const blockProps = useBlockProps();
				const matches = blockProps.className.match( /wp-elements-(\d+)/ );
				const id =
					matches && matches[ 1 ] ? parseInt( matches[ 1 ], 10 ) : '';
				const [ ruleIndex, setRuleIndex ] = useState( null );

				// Manage stylesheet for our custom element color.
				useEffect( () => {
					const rule = sprintf( `${ settings.selector } { ${
						CSSPropertyMap[ settings.property ] || 'color'
					}: ${
						colorValue || defaultValue
					}; }`, `wp-elements-${ id }` );
					if ( ruleIndex !== null ) {
						stylesheet.deleteRule( ruleIndex );
						stylesheet.insertRule( rule, ruleIndex );
					} else {
						const newIndex = stylesheet.cssRules.length;
						stylesheet.insertRule( rule, newIndex );
						setRuleIndex( newIndex );
					}
				}, [ colorValue, defaultValue, id, ruleIndex, setRuleIndex ] );

				return (
					<>
						<BlockEdit { ...props } />
						<InspectorControls group="color">
							<ColorGradientSettingsDropdown
								settings={ [
									{
										label: settings.label,
										colorValue,
										onColorChange: ( value ) => {
											setCustomColor( value );
											setAttributes( {
												style: {
													...( attributes?.style || {} ),
													elements: {
														...( attributes?.style
															?.elements || {} ),
														[ name ]: {
															color: {
																[ settings.property ]: value,
															},
														},
													},
												},
											} );
										},
									},
								] }
								panelId={ clientId }
								hasColorsOrGradients={ false }
								disableCustomColors={ false }
								__experimentalIsRenderedInSidebar
								{ ...colorGradientSettings }
							/>
						</InspectorControls>
					</>
				);
			};
		}, 'withPseudoContentColorUI' )
	);

	wp.domReady( () => {
		addFilter(
			'editor.BlockEdit',
			`block-supports-extended/${ name }`,
			withPseudoContentColorUI
		);
	} );
} );
