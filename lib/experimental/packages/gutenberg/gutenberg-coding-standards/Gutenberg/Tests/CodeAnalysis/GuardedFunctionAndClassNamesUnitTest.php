<?php
/**
 * Unit test class for Gutenberg Coding Standard.
 *
 * @package gutenberg-coding-standards/gbc
 * @link    https://github.com/anton-vlasenko/Gutenberg-Coding-Standards
 * @license https://opensource.org/licenses/MIT MIT
 */

namespace GutenbergCS\Gutenberg\Tests\CodeAnalysis;

use PHP_CodeSniffer\Tests\Standards\AbstractSniffUnitTest;

final class GuardedFunctionAndClassNamesUnitTest extends AbstractSniffUnitTest {

	/**
	 * Returns the lines where errors should occur.
	 *
	 * @return array <int line number> => <int number of errors>
	 */
	public function getErrorList() {
		return array(
			17 => 1,
			25 => 1,
		);
	}

	/**
	 * Returns the lines where warnings should occur.
	 *
	 * @return array <int line number> => <int number of warnings>
	 */
	public function getWarningList() {
		return array();
	}
}
