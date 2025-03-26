describe('Parcours utilisateur complet', () => {
  it('Inscrit, connecte un utilisateur, crée/modifie/supprime contenu et commentaire, puis modifie son profil', () => {
    const uniqueId = Date.now();
    const email = `cypress${uniqueId}@example.com`;
    const password = 'password';
    const title = `Titre Cypress ${uniqueId}`;
    const contentText = 'Ceci est un test Cypress';
    const commentText = 'Premier commentaire Cypress';
    const editedCommentText = 'Commentaire modifié Cypress';
    const newFirstName = 'JeanCyp';

    // ✅ Étape 1 : Inscription
    cy.visit('http://localhost:5173/register');
    cy.wait(1000);
    cy.get('input[placeholder="Email"]').type(email);
    cy.wait(1000);
    cy.get('input[placeholder="Prénom"]').type('JeanTest');
    cy.wait(1000);
    cy.get('input[placeholder="Nom"]').type('Dupont');
    cy.wait(1000);
    cy.get('input[placeholder="Mot de passe"]').type(password);
    cy.wait(1000);
    cy.get('form').submit();
    cy.url().should('eq', 'http://localhost:5173/login');
    cy.wait(1000);

    // ✅ Étape 2 : Connexion
    cy.get('input[placeholder="Email"]').type(email);
    cy.wait(1000);
    cy.get('input[placeholder="Mot de passe"]').type(password);
    cy.wait(1000);
    cy.get('form').submit();
    cy.url().should('eq', 'http://localhost:5173/');
    cy.contains('Contenus disponibles');
    cy.wait(1000);

    // ✅ Étape 3 : Création de contenu
    cy.contains('Créer un nouveau contenu').click();
    cy.wait(1000);
    cy.get('input[placeholder="Titre"]').type(title);
    cy.wait(1000);
    cy.get('textarea[placeholder="Contenu"]').type(contentText);
    cy.wait(1000);
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test.png', { force: true });
    cy.wait(1000);
    cy.get('input[placeholder="Meta Title"]').type('Meta Title');
    cy.wait(1000);
    cy.get('textarea[placeholder="Meta Description"]').type('Meta Description');
    cy.wait(1000);
    cy.get('input[placeholder="Tags (séparés par des virgules)"]').type('test,cypress');
    cy.wait(1000);
    cy.get('[data-cy="submit-content"]').click();
    cy.get('.modal-backdrop').should('not.exist');
    cy.wait(1000);
    cy.reload();
    cy.wait(1000);
    cy.contains(title).click();
    cy.wait(1000);

    // ✅ Étape 4 : Ajout d’un commentaire
    cy.get('textarea[placeholder="Votre commentaire"]').type(commentText);
    cy.wait(1000);
    cy.get('[data-cy="submit-comment"]').click();
    cy.wait(1000);
    cy.contains(commentText).should('exist');
    cy.wait(1000);

    // ✅ Étape 5 : Modification du commentaire
    cy.contains(commentText)
      .parents('.comment-card')
      .within(() => {
        cy.contains('✏️ Modifier').click();
      });
    cy.wait(1000);
    cy.get('.comment-card textarea').clear().type(editedCommentText);
    cy.wait(1000);
    cy.contains('Enregistrer').click();
    cy.contains(editedCommentText).should('exist');
    cy.wait(1000);

    // ✅ Étape 6 : Suppression du commentaire
    cy.contains(editedCommentText)
      .parents('.comment-card')
      .within(() => {
        cy.contains('🗑️').click();
      });
    cy.wait(1000);
    cy.contains(editedCommentText).should('not.exist');
    cy.wait(1000);

    // ✅ Étape 7 : Suppression du contenu
    cy.contains('🗑️ Supprimer').click();
    cy.on('window:confirm', () => true);
    cy.url().should('eq', 'http://localhost:5173/');
    cy.wait(1000);

    // ✅ Étape 8 : Modification du profil
    cy.visit('http://localhost:5173/profile');
    cy.wait(1000);
    cy.get('#firstName').clear().type(newFirstName);
    cy.wait(1000);
    cy.get('#lastName').clear().type('NomModif');
    cy.wait(1000);
    cy.get('form').submit();
    cy.wait(1000);

    // 🔁 Redirection vers la page d'accueil
    cy.visit('http://localhost:5173');
    cy.url().should('eq', 'http://localhost:5173/');
    cy.wait(1000);
  });
});
