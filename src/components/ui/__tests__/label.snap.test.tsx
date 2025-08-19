import React from 'react';
import { render } from '@testing-library/react';
import { Label } from '../label';

describe('ui/Label (snapshot)', () => {
	it('renders', () => {
		const { container } = render(<Label htmlFor="x">Label</Label>);
		expect(container.firstChild).toMatchSnapshot();
	});
});


