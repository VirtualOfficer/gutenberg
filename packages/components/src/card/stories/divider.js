/**
 * Internal dependencies
 */
import { Card, CardBody } from '../';
import CardDivider from '../divider';
import { getCardStoryProps } from './_utils';

export default { title: 'Components/Card/Divider', component: CardDivider };

export const _default = () => {
	const props = getCardStoryProps();

	return (
		<Card { ...props }>
			<CardBody>...</CardBody>
			<CardDivider />
			<CardBody>...</CardBody>
		</Card>
	);
};
