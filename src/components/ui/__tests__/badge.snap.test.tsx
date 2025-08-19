import React from 'react';
import { render } from '@testing-library/react';
import { Badge } from '../badge';

describe('ui/Badge (snapshot)', () => {
	it('renders variants', () => {
		const { container } = render(
			<div>
				<Badge>Default</Badge>
				<Badge variant="secondary">Secondary</Badge>
				<Badge variant="destructive">Destructive</Badge>
				<Badge variant="outline">Outline</Badge>
			</div>,
		);
		expect(container.firstChild).toMatchSnapshot();
	});
});


