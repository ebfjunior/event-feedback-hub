import React from 'react';
import { render } from '@testing-library/react';
import { BulletList } from '../BulletList';

describe('BulletList (snapshot)', () => {
	it('renders with items', () => {
		const { container } = render(<BulletList items={['a', 'b', 'c']} />);
		expect(container.firstChild).toMatchSnapshot();
	});

	it('renders placeholder when empty', () => {
		const { container } = render(<BulletList items={[]} />);
		expect(container.firstChild).toMatchSnapshot();
	});
});


