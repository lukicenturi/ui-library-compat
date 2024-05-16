describe('forms/Auto Completes', () => {
  beforeEach(() => {
    cy.visit('/auto-completes');
  });

  it('rendered properly', () => {
    cy.contains('h2[data-cy=auto-completes]', 'Auto Completes');
    cy.get('div[data-cy=auto-complete-0]').as('firstAutoComplete');

    cy.get('@firstAutoComplete').find('[data-id="activator"]').should('be.exist');
    cy.get('@firstAutoComplete').find('span[class*=_label_]').should('contain.text', 'Select');

    cy.get('div[role=menu]').should('not.exist');

    cy.get('@firstAutoComplete').find('[data-id="activator"]').click();

    cy.get('div[role=menu]').should('be.visible');
    cy.get('div[role=menu] button:first-child').click();

    cy.get('@firstAutoComplete').find('div[class*=_value_]').should('contain.text', 'Germany');
  });
});
