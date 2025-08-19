import React from 'react';
import { render } from '@testing-library/react';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';

describe('ui/Avatar (snapshot)', () => {
	it('renders image and fallback', () => {
		const { container } = render(
			<Avatar>
				<AvatarImage src="/avatar.png" alt="A" />
				<AvatarFallback>AB</AvatarFallback>
			</Avatar>,
		);
		expect(container.firstChild).toMatchSnapshot();
	});
});


