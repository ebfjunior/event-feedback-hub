import React from 'react';
import { render } from '@testing-library/react';
import { Button } from '../button';

describe('ui/Button (snapshot)', () => {
	it('renders variants', () => {
		const { container } = render(
			<div>
				<Button>Default</Button>
				<Button variant="secondary">Secondary</Button>
				<Button size="sm">Small</Button>
			</div>,
		);
		expect(container.firstChild).toMatchSnapshot();
	});
});


