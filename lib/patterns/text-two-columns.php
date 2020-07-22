<?php
/**
 * Two columns of Text block pattern.
 *
 * @package gutenberg
 */

return array(
	'title'      => __( 'Two columns of text', 'gutenberg' ),
	'title'       => __( 'Two columns of text', 'gutenberg' ),
	'categories' => array( 'columns' ),
	'categories'  => array( 'columns' ),
	'content'    => "<!-- wp:group -->\n<div class=\"wp-block-group\"><div class=\"wp-block-group__inner-container\"><!-- wp:heading -->\n<h2><strong>" . __( 'CHAPTER 1. Loomings', 'gutenberg' ) . "</strong></h2>\n<!-- /wp:heading -->\n\n<!-- wp:columns -->\n<div class=\"wp-block-columns\"><!-- wp:column -->\n<div class=\"wp-block-column\"><!-- wp:paragraph -->\n<p>" . __( 'Call me Ishmael. Some years ago —never mind how long precisely— having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul.', 'gutenberg' ) . "</p>\n<!-- /wp:paragraph --></div>\n<!-- /wp:column -->\n\n<!-- wp:column -->\n<div class=\"wp-block-column\"><!-- wp:paragraph -->\n<p>" . __( 'Whenever I find myself pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can.', 'gutenberg' ) . "</p>\n<!-- /wp:paragraph --></div>\n<!-- /wp:column --></div>\n<!-- /wp:columns --></div></div>\n<!-- /wp:group -->",
	'content'     => "<!-- wp:group -->\n<div class=\"wp-block-group\"><div class=\"wp-block-group__inner-container\"><!-- wp:heading {\"style\":{\"typography\":{\"fontSize\":38},\"color\":{\"text\":\"#ba0c49\"}}} -->\n<h2 class=\"has-text-color\" style=\"font-size:38px;color:#ba0c49\">" . __( 'Which treats of the character and pursuits of the famous gentleman Don Quixote of La Mancha', 'gutenberg' ) . "</h2>\n<!-- /wp:heading -->\n\n<!-- wp:columns -->\n<div class=\"wp-block-columns\"><!-- wp:column -->\n<div class=\"wp-block-column\"><!-- wp:paragraph {\"textColor\":\"black\",\"style\":{\"typography\":{\"fontSize\":18}}} -->\n<p class=\"has-black-color has-text-color\" style=\"font-size:18px\">" . __( 'In a village of La Mancha, the name of which I have no desire to call to mind, there lived not long since one of those gentlemen that keep a lance in the lance-rack, an old buckler, a lean hack, and a greyhound for coursing. An olla of rather more beef than mutton, a salad on most nights, scraps on Saturdays, lentils on Fridays, and a pigeon or so extra on Sundays, made away with three-quarters of his income.', 'gutenberg' ) . "</p>\n<!-- /wp:paragraph --></div>\n<!-- /wp:column -->\n\n<!-- wp:column -->\n<div class=\"wp-block-column\"><!-- wp:paragraph {\"textColor\":\"black\",\"style\":{\"typography\":{\"fontSize\":18}}} -->\n<p class=\"has-black-color has-text-color\" style=\"font-size:18px\">" . __( 'The rest of it went in a doublet of fine cloth and velvet breeches and shoes to match for holidays, while on week-days he made a brave figure in his best homespun. He had in his house a housekeeper past forty, a niece under twenty, and a lad for the field and market-place, who used to saddle the hack as well as handle the bill-hook. The age of this gentleman of ours was bordering on fifty; he was of a hardy habit, spare, gaunt-featured, a very early riser and a great sportsman.', 'gutenberg' ) . "</p>\n<!-- /wp:paragraph --></div>\n<!-- /wp:column --></div>\n<!-- /wp:columns --></div></div>\n<!-- /wp:group -->",
	'description' => _x( 'Two columns of text preceded by a long heading.', 'Block pattern description', 'gutenberg' ),
);
