<?php
/**
 * Bootstraping the Gutenberg experiments page.
 *
 * @package gutenberg
 */

/**
 * The main entry point for the Gutenberg experiments page.
 *
 * @since 5.2.3
 *
 * @param string $page The page name the function is being called for, `'gutenberg_customizer'` for the Customizer.
 */
function the_gutenberg_experiments( $page = 'gutenberg_page_gutenberg-experiments' ) {
	?>
	<div
		id="experiments-editor"
		class="wrap"
	>
	<h1><?php echo __( 'Experiment settings', 'gutenberg' ); ?></h1>
	<?php settings_errors(); ?>
	<form method="post" action="options.php">
		<?php settings_fields( 'gutenberg-experiments' ); ?>
		<?php do_settings_sections( 'gutenberg-experiments' ); ?>           
		<?php submit_button(); ?>
	</form>
	</div>
	<?php
}

/**
 * Set up the experiments settings.
 *
 * @since 5.2.3
 */
function gutenberg_initialize_experiments_settings() {
	add_settings_section(
		'gutenberg_experiments_section',
		// The empty string ensures the render function won't output a h2.
		'',
		'gutenberg_display_experiment_section',
		'gutenberg-experiments'
	);
	add_settings_field(
		'gutenberg-widgets-screen',
		__( 'Enable Widgets Screen', 'gutenberg' ),
		'gutenberg_display_experiment_field',
		'gutenberg-experiments',
		'gutenberg_experiments_section',
		array(
			'label_for' => 'gutenberg-widgets-screen',
			'id'        => 'gutenberg-widgets-screen',
		)
	);
	add_settings_field(
		'gutenberg-legacy-widget-block',
		__( 'Enable Legacy Widget Block', 'gutenberg' ),
		'gutenberg_display_experiment_field',
		'gutenberg-experiments',
		'gutenberg_experiments_section',
		array(
			'label_for' => 'gutenberg-legacy-widget-block',
			'id'        => 'gutenberg-legacy-widget-block',
		)
	);
	register_setting(
		'gutenberg-experiments',
		'gutenberg-experiments'
	);
}

add_action( 'admin_init', 'gutenberg_initialize_experiments_settings' );

/**
 * Display a checkbox field for a Gutenberg experiment.
 *
 * @since 5.2.3
 *
 * @param array $args ( $label_for, $id ).
 */
function gutenberg_display_experiment_field( $args ) {
	$options = get_option( 'gutenberg-experiments' );
	$value   = isset( $options[ $args['id'] ] ) ? 1 : 0;
	?>
		<input type="checkbox" name="<?php echo 'gutenberg-experiments[' . $args['id'] . ']'; ?>" id="<?php echo $args['id']; ?>" value="1" <?php checked( 1, $value ); ?> />
	<?php
}

/**
 * Display the experiments section.
 *
 * @since 5.2.3
 */
function gutenberg_display_experiment_section() {

	$markup = '<p>' . __( 'Gutenberg has some experimental features you can turn on. Simply select each you would like to use.', 'gutenberg' ) . '</p>';
	echo $markup;

}
