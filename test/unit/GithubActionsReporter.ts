/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * External dependencies
 */
import type { AggregatedResult, TestResult } from '@jest/test-result';
import { BaseReporter, Context } from '@jest/reporters';

const newLine = /\n/g;
const encodedNewLine = '%0A';
const lineAndColumnInStackTrace = /^.*:([0-9]+):([0-9]+).*$/;

export default class GithubActionReporter extends BaseReporter {
	onRunComplete(
		_contexts?: Set< Context >,
		aggregatedResults?: AggregatedResult
	): void {
		const messages = getMessages( aggregatedResults?.testResults );

		for ( const message of messages ) {
			this.log( message );
		}
	}
}

function getMessages( results: Array< TestResult > | undefined ) {
	if ( ! results ) return [];

	return results.reduce(
		flatMap( ( { testFilePath, testResults } ) =>
			testResults
				.filter( ( r ) => r.status === 'failed' )
				.reduce(
					flatMap( ( r ) => r.failureMessages ),
					[]
				)
				.map( ( m ) => m.replace( newLine, encodedNewLine ) )
				.map( ( m ) => lineAndColumnInStackTrace.exec( m ) )
				.filter( ( m ): m is RegExpExecArray => m !== null )
				.map(
					( [ message, line, col ] ) =>
						`::error file=${ testFilePath },line=${ line },col=${ col }::${ message }`
				)
		),
		[]
	);
}

function flatMap< In, Out >( map: ( x: In ) => Array< Out > ) {
	return ( out: Array< Out >, entry: In ) => out.concat( ...map( entry ) );
}
