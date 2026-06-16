import { registerTranslations } from '../../contexts/LanguageContext';

registerTranslations({
  en: {
    'externalTransfer.title': 'External Bank Transfer',
    'externalTransfer.subtitle': 'Send funds to an external bank account',
    'externalTransfer.success': 'Transfer submitted. It will be processed shortly.',

    'externalTransfer.recipientSection': 'Recipient Details',
    'externalTransfer.available': 'Available:',
    'externalTransfer.optional': 'optional',
    'externalTransfer.optionalInternational': 'optional, for international',

    'externalTransfer.fields.sourceCurrency': 'Source Currency',
    'externalTransfer.fields.amount': 'Amount',
    'externalTransfer.fields.recipientName': 'Recipient Name',
    'externalTransfer.fields.bankName': 'Bank Name',
    'externalTransfer.fields.routingNumber': 'Routing Number',
    'externalTransfer.fields.accountNumber': 'Account Number',
    'externalTransfer.fields.swiftCode': 'SWIFT / BIC Code',
    'externalTransfer.fields.note': 'Note',

    'externalTransfer.placeholders.amount': '0.00',
    'externalTransfer.placeholders.recipientName': 'Full name of the recipient',
    'externalTransfer.placeholders.bankName': 'e.g., Chase, Bank of America',
    'externalTransfer.placeholders.routingNumber': '9-digit routing number',
    'externalTransfer.placeholders.accountNumber': 'Account number',
    'externalTransfer.placeholders.swiftCode': 'e.g., CHASUS33',
    'externalTransfer.placeholders.note': 'Payment reference or memo',

    'externalTransfer.actions.send': 'Send Transfer',

    'externalTransfer.errors.invalidAmount': 'Enter a valid amount',
    'externalTransfer.errors.recipientRequired': 'Recipient name is required',
    'externalTransfer.errors.bankRequired': 'Bank name is required',
    'externalTransfer.errors.routingRequired': 'Routing number is required',
    'externalTransfer.errors.accountRequired': 'Account number is required',
  },

  fr: {
    'externalTransfer.title': 'Virement bancaire externe',
    'externalTransfer.subtitle': 'Envoyez des fonds vers un compte bancaire externe',
    'externalTransfer.success': 'Virement envoyé. Il sera traité prochainement.',

    'externalTransfer.recipientSection': 'Détails du bénéficiaire',
    'externalTransfer.available': 'Disponible :',
    'externalTransfer.optional': 'optionnel',
    'externalTransfer.optionalInternational': 'optionnel, pour l’international',

    'externalTransfer.fields.sourceCurrency': 'Devise source',
    'externalTransfer.fields.amount': 'Montant',
    'externalTransfer.fields.recipientName': 'Nom du bénéficiaire',
    'externalTransfer.fields.bankName': 'Nom de la banque',
    'externalTransfer.fields.routingNumber': 'Numéro de routage',
    'externalTransfer.fields.accountNumber': 'Numéro de compte',
    'externalTransfer.fields.swiftCode': 'Code SWIFT / BIC',
    'externalTransfer.fields.note': 'Note',

    'externalTransfer.placeholders.amount': '0.00',
    'externalTransfer.placeholders.recipientName': 'Nom complet du bénéficiaire',
    'externalTransfer.placeholders.bankName': 'ex. Chase, Bank of America',
    'externalTransfer.placeholders.routingNumber': 'Numéro de routage à 9 chiffres',
    'externalTransfer.placeholders.accountNumber': 'Numéro de compte',
    'externalTransfer.placeholders.swiftCode': 'ex. CHASUS33',
    'externalTransfer.placeholders.note': 'Référence de paiement ou mémo',

    'externalTransfer.actions.send': 'Envoyer le virement',

    'externalTransfer.errors.invalidAmount': 'Entrez un montant valide',
    'externalTransfer.errors.recipientRequired': 'Le nom du bénéficiaire est requis',
    'externalTransfer.errors.bankRequired': 'Le nom de la banque est requis',
    'externalTransfer.errors.routingRequired': 'Le numéro de routage est requis',
    'externalTransfer.errors.accountRequired': 'Le numéro de compte est requis',
  },

  de: {
    'externalTransfer.title': 'Externe Banküberweisung',
    'externalTransfer.subtitle': 'Senden Sie Geld an ein externes Bankkonto',
    'externalTransfer.success': 'Überweisung eingereicht. Sie wird in Kürze bearbeitet.',

    'externalTransfer.recipientSection': 'Empfängerdaten',
    'externalTransfer.available': 'Verfügbar:',
    'externalTransfer.optional': 'optional',
    'externalTransfer.optionalInternational': 'optional, für international',

    'externalTransfer.fields.sourceCurrency': 'Quellwährung',
    'externalTransfer.fields.amount': 'Betrag',
    'externalTransfer.fields.recipientName': 'Empfängername',
    'externalTransfer.fields.bankName': 'Bankname',
    'externalTransfer.fields.routingNumber': 'Bankleitzahl',
    'externalTransfer.fields.accountNumber': 'Kontonummer',
    'externalTransfer.fields.swiftCode': 'SWIFT- / BIC-Code',
    'externalTransfer.fields.note': 'Notiz',

    'externalTransfer.placeholders.amount': '0.00',
    'externalTransfer.placeholders.recipientName': 'Vollständiger Name des Empfängers',
    'externalTransfer.placeholders.bankName': 'z. B. Chase, Bank of America',
    'externalTransfer.placeholders.routingNumber': '9-stellige Bankleitzahl',
    'externalTransfer.placeholders.accountNumber': 'Kontonummer',
    'externalTransfer.placeholders.swiftCode': 'z. B. CHASUS33',
    'externalTransfer.placeholders.note': 'Zahlungsreferenz oder Verwendungszweck',

    'externalTransfer.actions.send': 'Überweisung senden',

    'externalTransfer.errors.invalidAmount': 'Geben Sie einen gültigen Betrag ein',
    'externalTransfer.errors.recipientRequired': 'Empfängername ist erforderlich',
    'externalTransfer.errors.bankRequired': 'Bankname ist erforderlich',
    'externalTransfer.errors.routingRequired': 'Bankleitzahl ist erforderlich',
    'externalTransfer.errors.accountRequired': 'Kontonummer ist erforderlich',
  },

  es: {
    'externalTransfer.title': 'Transferencia bancaria externa',
    'externalTransfer.subtitle': 'Envía fondos a una cuenta bancaria externa',
    'externalTransfer.success': 'Transferencia enviada. Se procesará en breve.',

    'externalTransfer.recipientSection': 'Datos del destinatario',
    'externalTransfer.available': 'Disponible:',
    'externalTransfer.optional': 'opcional',
    'externalTransfer.optionalInternational': 'opcional, para transferencias internacionales',

    'externalTransfer.fields.sourceCurrency': 'Moneda de origen',
    'externalTransfer.fields.amount': 'Monto',
    'externalTransfer.fields.recipientName': 'Nombre del destinatario',
    'externalTransfer.fields.bankName': 'Nombre del banco',
    'externalTransfer.fields.routingNumber': 'Número de ruta',
    'externalTransfer.fields.accountNumber': 'Número de cuenta',
    'externalTransfer.fields.swiftCode': 'Código SWIFT / BIC',
    'externalTransfer.fields.note': 'Nota',

    'externalTransfer.placeholders.amount': '0.00',
    'externalTransfer.placeholders.recipientName': 'Nombre completo del destinatario',
    'externalTransfer.placeholders.bankName': 'ej., Chase, Bank of America',
    'externalTransfer.placeholders.routingNumber': 'Número de ruta de 9 dígitos',
    'externalTransfer.placeholders.accountNumber': 'Número de cuenta',
    'externalTransfer.placeholders.swiftCode': 'ej., CHASUS33',
    'externalTransfer.placeholders.note': 'Referencia de pago o memo',

    'externalTransfer.actions.send': 'Enviar transferencia',

    'externalTransfer.errors.invalidAmount': 'Ingresa un monto válido',
    'externalTransfer.errors.recipientRequired': 'El nombre del destinatario es obligatorio',
    'externalTransfer.errors.bankRequired': 'El nombre del banco es obligatorio',
    'externalTransfer.errors.routingRequired': 'El número de ruta es obligatorio',
    'externalTransfer.errors.accountRequired': 'El número de cuenta es obligatorio',
  },

  it: {
    'externalTransfer.title': 'Bonifico bancario esterno',
    'externalTransfer.subtitle': 'Invia fondi a un conto bancario esterno',
    'externalTransfer.success': 'Trasferimento inviato. Verrà elaborato a breve.',

    'externalTransfer.recipientSection': 'Dettagli del destinatario',
    'externalTransfer.available': 'Disponibile:',
    'externalTransfer.optional': 'opzionale',
    'externalTransfer.optionalInternational': 'opzionale, per operazioni internazionali',

    'externalTransfer.fields.sourceCurrency': 'Valuta di origine',
    'externalTransfer.fields.amount': 'Importo',
    'externalTransfer.fields.recipientName': 'Nome del destinatario',
    'externalTransfer.fields.bankName': 'Nome della banca',
    'externalTransfer.fields.routingNumber': 'Numero di instradamento',
    'externalTransfer.fields.accountNumber': 'Numero di conto',
    'externalTransfer.fields.swiftCode': 'Codice SWIFT / BIC',
    'externalTransfer.fields.note': 'Nota',

    'externalTransfer.placeholders.amount': '0.00',
    'externalTransfer.placeholders.recipientName': 'Nome completo del destinatario',
    'externalTransfer.placeholders.bankName': 'es. Chase, Bank of America',
    'externalTransfer.placeholders.routingNumber': 'Numero di instradamento a 9 cifre',
    'externalTransfer.placeholders.accountNumber': 'Numero di conto',
    'externalTransfer.placeholders.swiftCode': 'es. CHASUS33',
    'externalTransfer.placeholders.note': 'Riferimento pagamento o memo',

    'externalTransfer.actions.send': 'Invia trasferimento',

    'externalTransfer.errors.invalidAmount': 'Inserisci un importo valido',
    'externalTransfer.errors.recipientRequired': 'Il nome del destinatario è obbligatorio',
    'externalTransfer.errors.bankRequired': 'Il nome della banca è obbligatorio',
    'externalTransfer.errors.routingRequired': 'Il numero di instradamento è obbligatorio',
    'externalTransfer.errors.accountRequired': 'Il numero di conto è obbligatorio',
  },

  el: {
    'externalTransfer.title': 'Εξωτερική τραπεζική μεταφορά',
    'externalTransfer.subtitle': 'Στείλτε χρήματα σε εξωτερικό τραπεζικό λογαριασμό',
    'externalTransfer.success': 'Η μεταφορά υποβλήθηκε. Θα επεξεργαστεί σύντομα.',

    'externalTransfer.recipientSection': 'Στοιχεία παραλήπτη',
    'externalTransfer.available': 'Διαθέσιμο:',
    'externalTransfer.optional': 'προαιρετικό',
    'externalTransfer.optionalInternational': 'προαιρετικό, για διεθνείς μεταφορές',

    'externalTransfer.fields.sourceCurrency': 'Νόμισμα προέλευσης',
    'externalTransfer.fields.amount': 'Ποσό',
    'externalTransfer.fields.recipientName': 'Όνομα παραλήπτη',
    'externalTransfer.fields.bankName': 'Όνομα τράπεζας',
    'externalTransfer.fields.routingNumber': 'Αριθμός δρομολόγησης',
    'externalTransfer.fields.accountNumber': 'Αριθμός λογαριασμού',
    'externalTransfer.fields.swiftCode': 'Κωδικός SWIFT / BIC',
    'externalTransfer.fields.note': 'Σημείωση',

    'externalTransfer.placeholders.amount': '0.00',
    'externalTransfer.placeholders.recipientName': 'Πλήρες όνομα παραλήπτη',
    'externalTransfer.placeholders.bankName': 'π.χ. Chase, Bank of America',
    'externalTransfer.placeholders.routingNumber': '9ψήφιος αριθμός δρομολόγησης',
    'externalTransfer.placeholders.accountNumber': 'Αριθμός λογαριασμού',
    'externalTransfer.placeholders.swiftCode': 'π.χ. CHASUS33',
    'externalTransfer.placeholders.note': 'Αναφορά πληρωμής ή σημείωμα',

    'externalTransfer.actions.send': 'Αποστολή μεταφοράς',

    'externalTransfer.errors.invalidAmount': 'Εισαγάγετε έγκυρο ποσό',
    'externalTransfer.errors.recipientRequired': 'Το όνομα παραλήπτη είναι υποχρεωτικό',
    'externalTransfer.errors.bankRequired': 'Το όνομα τράπεζας είναι υποχρεωτικό',
    'externalTransfer.errors.routingRequired': 'Ο αριθμός δρομολόγησης είναι υποχρεωτικός',
    'externalTransfer.errors.accountRequired': 'Ο αριθμός λογαριασμού είναι υποχρεωτικός',
  },
});