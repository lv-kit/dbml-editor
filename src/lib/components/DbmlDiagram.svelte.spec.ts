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

const DBML_WITH_LONG_FIELD_NOTE = `
Table invitations {
  very_long_invitee_email_column_name_example custom_really_long_type_name [note: '招待対象のメールアドレスをここに詳しく記載します。表示が2行に収まりつつ最後は省略されることを確認します。']
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

	it('truncates long header text and wraps long notes across two lines', async () => {
		render(DbmlDiagram, { dbml: DBML_WITH_LONG_FIELD_NOTE });

		await expect.element(page.getByText('invitations')).toBeInTheDocument();

		await page
			.getByTestId('field-row-invitations-very_long_invitee_email_column_name_example')
			.hover();

		await expect
			.element(page.getByTestId('note-tooltip-field'))
			.toHaveTextContent('very_long_invitee_e…');
		await expect
			.element(page.getByTestId('note-tooltip-type'))
			.toHaveTextContent('custom_really_l…');
		await expect
			.element(page.getByTestId('note-tooltip-note-0'))
			.toHaveTextContent('招待対象のメールアドレスをここに詳しく記載します。表');
		await expect
			.element(page.getByTestId('note-tooltip-note-1'))
			.toHaveTextContent('示が2行に収まりつつ最後は省略されることを確認しま…');
	});
});
