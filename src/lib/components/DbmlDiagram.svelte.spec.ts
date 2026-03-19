import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DbmlDiagram from './DbmlDiagram.svelte';

const DBML_WITH_FIELD_NOTE = `
Table invites {
  id integer [pk]
  invitee_email varchar(255) [note: '招待対象のメールアドレス']
}
`;

describe('DbmlDiagram note tooltip', () => {
	it('shows the field name and type above the note content', async () => {
		render(DbmlDiagram, { dbml: DBML_WITH_FIELD_NOTE });

		await expect.element(page.getByText('invites')).toBeInTheDocument();

		await page.getByTestId('field-row-invites-invitee_email').hover();

		await expect.element(page.getByTestId('note-tooltip')).toBeInTheDocument();
		await expect.element(page.getByTestId('note-tooltip-field')).toHaveTextContent('invitee_email');
		await expect.element(page.getByTestId('note-tooltip-type')).toHaveTextContent('varchar(255)');
		await expect
			.element(page.getByTestId('note-tooltip-note-0'))
			.toHaveTextContent('招待対象のメールアドレス');
	});
});
