import React from 'react';
import { render } from '@testing-library/react';
import { Card, CardContent, CardDescription, CardHeader, CardAction } from '../card';

describe('ui/Card (snapshot)', () => {
	it('renders structure', () => {
		const { container } = render(
			<Card>
				<CardHeader>
					<CardDescription>Desc</CardDescription>
					<CardAction>Action</CardAction>
				</CardHeader>
				<CardContent>Content</CardContent>
			</Card>,
		);
		expect(container.firstChild).toMatchSnapshot();
	});
});


