import React from 'react';
import { render } from '@testing-library/react';
import { SubmitFeedbackForm } from '../SubmitFeedbackForm';

vi.mock('@/lib/api', () => ({
	createFeedback: vi.fn(async (b) => ({
		id: 'f1',
		event_id: b.event_id,
		event_name: 'Event',
		rating: b.rating,
		text: b.text,
		created_at: new Date().toISOString(),
	})),
}));

describe('SubmitFeedbackForm (snapshot)', () => {
	it('renders', () => {
		const { container } = render(<SubmitFeedbackForm events={[{ id: 'e1', name: 'Event 1' }]} />);
		expect(container.firstChild).toMatchSnapshot();
	});
});


