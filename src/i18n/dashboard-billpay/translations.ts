import { registerTranslations } from '../../contexts/LanguageContext';

registerTranslations({
  en: {
    'dashboardBillPay.title': 'Bill Payments',
    'dashboardBillPay.subtitle': 'Submit payment requests for review and approval',

    'dashboardBillPay.actions.cancel': 'Cancel',
    'dashboardBillPay.actions.newRequest': 'New Payment Request',
    'dashboardBillPay.actions.submitting': 'Submitting...',
    'dashboardBillPay.actions.submit': 'Submit Payment Request',

    'dashboardBillPay.fields.billerName': 'Biller / Payee Name',
    'dashboardBillPay.fields.amountUsd': 'Amount (USD)',
    'dashboardBillPay.fields.paymentMethod': 'Payment Method',

    'dashboardBillPay.placeholders.billerName': 'e.g. Electric Company',
    'dashboardBillPay.placeholders.amount': '0.00',

    'dashboardBillPay.methods.crypto.title': 'Crypto Payment',
    'dashboardBillPay.methods.crypto.subtitle': 'Pay with cryptocurrency',
    'dashboardBillPay.methods.bank.title': 'Bank Payment',
    'dashboardBillPay.methods.bank.subtitle': 'Pay via bank account',
    'dashboardBillPay.methods.bank.short': 'Bank',

    'dashboardBillPay.pending.youHave': 'You have',
    'dashboardBillPay.pending.payment': 'pending payment',
    'dashboardBillPay.pending.payments': 'pending payments',
    'dashboardBillPay.pending.awaitingApproval': 'awaiting approval.',

    'dashboardBillPay.messages.paymentOf': 'Your payment of',
    'dashboardBillPay.messages.to': 'to',
    'dashboardBillPay.messages.submitted': 'has been submitted and is awaiting approval.',
    'dashboardBillPay.messages.submittedTitle': 'Payment Request Submitted',
    'dashboardBillPay.messages.failedTitle': 'Submission Failed',

    'dashboardBillPay.form.title': 'New Payment Request',
    'dashboardBillPay.form.subtitle': 'All requests require admin approval before processing',

    'dashboardBillPay.status.approved': 'Approved',
    'dashboardBillPay.status.pending': 'Pending',
    'dashboardBillPay.status.declined': 'Declined',

    'dashboardBillPay.history.title': 'Payment History',
    'dashboardBillPay.history.emptyTitle': 'No payment requests yet',
    'dashboardBillPay.history.emptySubtitle': 'Submit your first payment request above',
    'dashboardBillPay.history.cryptoPayment': 'Crypto Payment',
    'dashboardBillPay.history.bankPayment': 'Bank Payment',
  },

  fr: {
    'dashboardBillPay.title': 'Paiements de factures',
    'dashboardBillPay.subtitle': 'Soumettez des demandes de paiement pour examen et approbation',

    'dashboardBillPay.actions.cancel': 'Annuler',
    'dashboardBillPay.actions.newRequest': 'Nouvelle demande de paiement',
    'dashboardBillPay.actions.submitting': 'Envoi...',
    'dashboardBillPay.actions.submit': 'Soumettre la demande de paiement',

    'dashboardBillPay.fields.billerName': 'Nom du bénéficiaire / créancier',
    'dashboardBillPay.fields.amountUsd': 'Montant (USD)',
    'dashboardBillPay.fields.paymentMethod': 'Méthode de paiement',

    'dashboardBillPay.placeholders.billerName': 'ex. Compagnie d’électricité',
    'dashboardBillPay.placeholders.amount': '0.00',

    'dashboardBillPay.methods.crypto.title': 'Paiement crypto',
    'dashboardBillPay.methods.crypto.subtitle': 'Payer avec des cryptomonnaies',
    'dashboardBillPay.methods.bank.title': 'Paiement bancaire',
    'dashboardBillPay.methods.bank.subtitle': 'Payer via compte bancaire',
    'dashboardBillPay.methods.bank.short': 'Banque',

    'dashboardBillPay.pending.youHave': 'Vous avez',
    'dashboardBillPay.pending.payment': 'paiement en attente',
    'dashboardBillPay.pending.payments': 'paiements en attente',
    'dashboardBillPay.pending.awaitingApproval': 'en attente d’approbation.',

    'dashboardBillPay.messages.paymentOf': 'Votre paiement de',
    'dashboardBillPay.messages.to': 'à',
    'dashboardBillPay.messages.submitted': 'a été soumis et est en attente d’approbation.',
    'dashboardBillPay.messages.submittedTitle': 'Demande de paiement soumise',
    'dashboardBillPay.messages.failedTitle': 'Échec de l’envoi',

    'dashboardBillPay.form.title': 'Nouvelle demande de paiement',
    'dashboardBillPay.form.subtitle': 'Toutes les demandes nécessitent une approbation administrateur avant traitement',

    'dashboardBillPay.status.approved': 'Approuvé',
    'dashboardBillPay.status.pending': 'En attente',
    'dashboardBillPay.status.declined': 'Refusé',

    'dashboardBillPay.history.title': 'Historique des paiements',
    'dashboardBillPay.history.emptyTitle': 'Aucune demande de paiement pour le moment',
    'dashboardBillPay.history.emptySubtitle': 'Soumettez votre première demande de paiement ci-dessus',
    'dashboardBillPay.history.cryptoPayment': 'Paiement crypto',
    'dashboardBillPay.history.bankPayment': 'Paiement bancaire',
  },

  de: {
    'dashboardBillPay.title': 'Rechnungszahlungen',
    'dashboardBillPay.subtitle': 'Reichen Sie Zahlungsanfragen zur Prüfung und Genehmigung ein',

    'dashboardBillPay.actions.cancel': 'Abbrechen',
    'dashboardBillPay.actions.newRequest': 'Neue Zahlungsanfrage',
    'dashboardBillPay.actions.submitting': 'Wird gesendet...',
    'dashboardBillPay.actions.submit': 'Zahlungsanfrage senden',

    'dashboardBillPay.fields.billerName': 'Name des Zahlungsempfängers',
    'dashboardBillPay.fields.amountUsd': 'Betrag (USD)',
    'dashboardBillPay.fields.paymentMethod': 'Zahlungsmethode',

    'dashboardBillPay.placeholders.billerName': 'z. B. Stromversorger',
    'dashboardBillPay.placeholders.amount': '0.00',

    'dashboardBillPay.methods.crypto.title': 'Krypto-Zahlung',
    'dashboardBillPay.methods.crypto.subtitle': 'Mit Kryptowährung bezahlen',
    'dashboardBillPay.methods.bank.title': 'Bankzahlung',
    'dashboardBillPay.methods.bank.subtitle': 'Per Bankkonto bezahlen',
    'dashboardBillPay.methods.bank.short': 'Bank',

    'dashboardBillPay.pending.youHave': 'Sie haben',
    'dashboardBillPay.pending.payment': 'ausstehende Zahlung',
    'dashboardBillPay.pending.payments': 'ausstehende Zahlungen',
    'dashboardBillPay.pending.awaitingApproval': 'zur Genehmigung ausstehend.',

    'dashboardBillPay.messages.paymentOf': 'Ihre Zahlung über',
    'dashboardBillPay.messages.to': 'an',
    'dashboardBillPay.messages.submitted': 'wurde eingereicht und wartet auf Genehmigung.',
    'dashboardBillPay.messages.submittedTitle': 'Zahlungsanfrage eingereicht',
    'dashboardBillPay.messages.failedTitle': 'Einreichung fehlgeschlagen',

    'dashboardBillPay.form.title': 'Neue Zahlungsanfrage',
    'dashboardBillPay.form.subtitle': 'Alle Anfragen benötigen vor der Verarbeitung eine Genehmigung durch einen Administrator',

    'dashboardBillPay.status.approved': 'Genehmigt',
    'dashboardBillPay.status.pending': 'Ausstehend',
    'dashboardBillPay.status.declined': 'Abgelehnt',

    'dashboardBillPay.history.title': 'Zahlungsverlauf',
    'dashboardBillPay.history.emptyTitle': 'Noch keine Zahlungsanfragen',
    'dashboardBillPay.history.emptySubtitle': 'Reichen Sie oben Ihre erste Zahlungsanfrage ein',
    'dashboardBillPay.history.cryptoPayment': 'Krypto-Zahlung',
    'dashboardBillPay.history.bankPayment': 'Bankzahlung',
  },

  es: {
    'dashboardBillPay.title': 'Pago de facturas',
    'dashboardBillPay.subtitle': 'Envía solicitudes de pago para revisión y aprobación',

    'dashboardBillPay.actions.cancel': 'Cancelar',
    'dashboardBillPay.actions.newRequest': 'Nueva solicitud de pago',
    'dashboardBillPay.actions.submitting': 'Enviando...',
    'dashboardBillPay.actions.submit': 'Enviar solicitud de pago',

    'dashboardBillPay.fields.billerName': 'Nombre del beneficiario / proveedor',
    'dashboardBillPay.fields.amountUsd': 'Monto (USD)',
    'dashboardBillPay.fields.paymentMethod': 'Método de pago',

    'dashboardBillPay.placeholders.billerName': 'ej. Compañía eléctrica',
    'dashboardBillPay.placeholders.amount': '0.00',

    'dashboardBillPay.methods.crypto.title': 'Pago con cripto',
    'dashboardBillPay.methods.crypto.subtitle': 'Pagar con criptomoneda',
    'dashboardBillPay.methods.bank.title': 'Pago bancario',
    'dashboardBillPay.methods.bank.subtitle': 'Pagar mediante cuenta bancaria',
    'dashboardBillPay.methods.bank.short': 'Banco',

    'dashboardBillPay.pending.youHave': 'Tienes',
    'dashboardBillPay.pending.payment': 'pago pendiente',
    'dashboardBillPay.pending.payments': 'pagos pendientes',
    'dashboardBillPay.pending.awaitingApproval': 'en espera de aprobación.',

    'dashboardBillPay.messages.paymentOf': 'Tu pago de',
    'dashboardBillPay.messages.to': 'a',
    'dashboardBillPay.messages.submitted': 'ha sido enviado y está pendiente de aprobación.',
    'dashboardBillPay.messages.submittedTitle': 'Solicitud de pago enviada',
    'dashboardBillPay.messages.failedTitle': 'Error en el envío',

    'dashboardBillPay.form.title': 'Nueva solicitud de pago',
    'dashboardBillPay.form.subtitle': 'Todas las solicitudes requieren aprobación administrativa antes de procesarse',

    'dashboardBillPay.status.approved': 'Aprobado',
    'dashboardBillPay.status.pending': 'Pendiente',
    'dashboardBillPay.status.declined': 'Rechazado',

    'dashboardBillPay.history.title': 'Historial de pagos',
    'dashboardBillPay.history.emptyTitle': 'Aún no hay solicitudes de pago',
    'dashboardBillPay.history.emptySubtitle': 'Envía tu primera solicitud de pago arriba',
    'dashboardBillPay.history.cryptoPayment': 'Pago con cripto',
    'dashboardBillPay.history.bankPayment': 'Pago bancario',
  },

  it: {
    'dashboardBillPay.title': 'Pagamenti bollette',
    'dashboardBillPay.subtitle': 'Invia richieste di pagamento per revisione e approvazione',

    'dashboardBillPay.actions.cancel': 'Annulla',
    'dashboardBillPay.actions.newRequest': 'Nuova richiesta di pagamento',
    'dashboardBillPay.actions.submitting': 'Invio...',
    'dashboardBillPay.actions.submit': 'Invia richiesta di pagamento',

    'dashboardBillPay.fields.billerName': 'Nome beneficiario / fornitore',
    'dashboardBillPay.fields.amountUsd': 'Importo (USD)',
    'dashboardBillPay.fields.paymentMethod': 'Metodo di pagamento',

    'dashboardBillPay.placeholders.billerName': 'es. Compagnia elettrica',
    'dashboardBillPay.placeholders.amount': '0.00',

    'dashboardBillPay.methods.crypto.title': 'Pagamento crypto',
    'dashboardBillPay.methods.crypto.subtitle': 'Paga con criptovaluta',
    'dashboardBillPay.methods.bank.title': 'Pagamento bancario',
    'dashboardBillPay.methods.bank.subtitle': 'Paga tramite conto bancario',
    'dashboardBillPay.methods.bank.short': 'Banca',

    'dashboardBillPay.pending.youHave': 'Hai',
    'dashboardBillPay.pending.payment': 'pagamento in sospeso',
    'dashboardBillPay.pending.payments': 'pagamenti in sospeso',
    'dashboardBillPay.pending.awaitingApproval': 'in attesa di approvazione.',

    'dashboardBillPay.messages.paymentOf': 'Il tuo pagamento di',
    'dashboardBillPay.messages.to': 'a',
    'dashboardBillPay.messages.submitted': 'è stato inviato ed è in attesa di approvazione.',
    'dashboardBillPay.messages.submittedTitle': 'Richiesta di pagamento inviata',
    'dashboardBillPay.messages.failedTitle': 'Invio non riuscito',

    'dashboardBillPay.form.title': 'Nuova richiesta di pagamento',
    'dashboardBillPay.form.subtitle': 'Tutte le richieste richiedono l’approvazione dell’amministratore prima dell’elaborazione',

    'dashboardBillPay.status.approved': 'Approvato',
    'dashboardBillPay.status.pending': 'In sospeso',
    'dashboardBillPay.status.declined': 'Rifiutato',

    'dashboardBillPay.history.title': 'Cronologia pagamenti',
    'dashboardBillPay.history.emptyTitle': 'Nessuna richiesta di pagamento ancora',
    'dashboardBillPay.history.emptySubtitle': 'Invia sopra la tua prima richiesta di pagamento',
    'dashboardBillPay.history.cryptoPayment': 'Pagamento crypto',
    'dashboardBillPay.history.bankPayment': 'Pagamento bancario',
  },

  el: {
    'dashboardBillPay.title': 'Πληρωμές λογαριασμών',
    'dashboardBillPay.subtitle': 'Υποβάλετε αιτήματα πληρωμής για έλεγχο και έγκριση',

    'dashboardBillPay.actions.cancel': 'Ακύρωση',
    'dashboardBillPay.actions.newRequest': 'Νέο αίτημα πληρωμής',
    'dashboardBillPay.actions.submitting': 'Υποβολή...',
    'dashboardBillPay.actions.submit': 'Υποβολή αιτήματος πληρωμής',

    'dashboardBillPay.fields.billerName': 'Όνομα δικαιούχου / παρόχου',
    'dashboardBillPay.fields.amountUsd': 'Ποσό (USD)',
    'dashboardBillPay.fields.paymentMethod': 'Τρόπος πληρωμής',

    'dashboardBillPay.placeholders.billerName': 'π.χ. Εταιρεία ηλεκτρικού ρεύματος',
    'dashboardBillPay.placeholders.amount': '0.00',

    'dashboardBillPay.methods.crypto.title': 'Πληρωμή με crypto',
    'dashboardBillPay.methods.crypto.subtitle': 'Πληρωμή με κρυπτονόμισμα',
    'dashboardBillPay.methods.bank.title': 'Τραπεζική πληρωμή',
    'dashboardBillPay.methods.bank.subtitle': 'Πληρωμή μέσω τραπεζικού λογαριασμού',
    'dashboardBillPay.methods.bank.short': 'Τράπεζα',

    'dashboardBillPay.pending.youHave': 'Έχετε',
    'dashboardBillPay.pending.payment': 'εκκρεμή πληρωμή',
    'dashboardBillPay.pending.payments': 'εκκρεμείς πληρωμές',
    'dashboardBillPay.pending.awaitingApproval': 'που αναμένουν έγκριση.',

    'dashboardBillPay.messages.paymentOf': 'Η πληρωμή σας ύψους',
    'dashboardBillPay.messages.to': 'προς',
    'dashboardBillPay.messages.submitted': 'υποβλήθηκε και αναμένει έγκριση.',
    'dashboardBillPay.messages.submittedTitle': 'Το αίτημα πληρωμής υποβλήθηκε',
    'dashboardBillPay.messages.failedTitle': 'Η υποβολή απέτυχε',

    'dashboardBillPay.form.title': 'Νέο αίτημα πληρωμής',
    'dashboardBillPay.form.subtitle': 'Όλα τα αιτήματα απαιτούν έγκριση διαχειριστή πριν από την επεξεργασία',

    'dashboardBillPay.status.approved': 'Εγκρίθηκε',
    'dashboardBillPay.status.pending': 'Σε εκκρεμότητα',
    'dashboardBillPay.status.declined': 'Απορρίφθηκε',

    'dashboardBillPay.history.title': 'Ιστορικό πληρωμών',
    'dashboardBillPay.history.emptyTitle': 'Δεν υπάρχουν αιτήματα πληρωμής ακόμα',
    'dashboardBillPay.history.emptySubtitle': 'Υποβάλετε παραπάνω το πρώτο σας αίτημα πληρωμής',
    'dashboardBillPay.history.cryptoPayment': 'Πληρωμή με crypto',
    'dashboardBillPay.history.bankPayment': 'Τραπεζική πληρωμή',
  },
});