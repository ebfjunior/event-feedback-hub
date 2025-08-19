import React from 'react';
import { render } from '@testing-library/react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../tooltip';

describe('ui/Tooltip (snapshot)', () => {
	it('renders structure', () => {
		render(
			<Tooltip>
				<TooltipTrigger>Trigger</TooltipTrigger>
				<TooltipContent>Content</TooltipContent>
			</Tooltip>,
		);
		expect(document.body).toMatchSnapshot();
	});
});


