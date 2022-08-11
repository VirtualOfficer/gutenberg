<?php
/**
 * Footer: Footer with credit line and navigation.
 *
 * @package WordPress
 */

return array(
	'title'      => _x( 'Footer with credit line and navigation', 'Block pattern title' ),
	'blockTypes' => array( 'core/template-part/footer' ),
	'categories' => array( 'footer' ),
	'content'    => '<!-- wp:group {"align":"full","layout":{"inherit":true}} -->
					<div class="wp-block-group alignfull"><!-- wp:group {"align":"wide","style":{"spacing":{"padding":{"bottom":"2em","top":"4em"}}},"layout":{"type":"flex","justifyContent":"space-between"}} -->
					<div class="wp-block-group alignwide" style="padding-top:4em;padding-bottom:2em"><!-- wp:paragraph -->
					<p>Proudly powered by <a href="https://wordpress.org" data-type="URL" data-id="https://wordpress.org">WordPress</a></p>
					<!-- /wp:paragraph -->
					
					<!-- wp:navigation {"layout":{"type":"flex","setCascadingProperties":true,"justifyContent":"right"}} -->
					<!-- wp:page-list {"isNavigationChild":true,"showSubmenuIcon":true,"openSubmenusOnClick":false} /-->
					<!-- /wp:navigation --></div>
					<!-- /wp:group --></div>
					<!-- /wp:group -->',
);
