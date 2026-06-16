import { registerTranslations } from '../../contexts/LanguageContext';

registerTranslations({
  en: {
    'externalCryptoTransfer.title': 'External Crypto Transfer',

    'externalCryptoTransfer.tabs.send': 'Send',
    'externalCryptoTransfer.tabs.receive': 'Receive',

    'externalCryptoTransfer.send.subtitle': 'Send crypto to an external wallet',
    'externalCryptoTransfer.receive.subtitle': 'Log an incoming crypto transfer',

    'externalCryptoTransfer.fields.selectCoin': 'Select Coin',
    'externalCryptoTransfer.fields.amount': 'Amount',
    'externalCryptoTransfer.fields.note': 'Note',

    'externalCryptoTransfer.optional': 'optional',
    'externalCryptoTransfer.available': 'Available:',

    'externalCryptoTransfer.placeholders.amount': '0.00',
    'externalCryptoTransfer.placeholders.sendNote': 'Payment reference or memo',
    'externalCryptoTransfer.placeholders.receiveNote': 'Transaction ID, reference, or memo',

    'externalCryptoTransfer.send.yourWallet': 'Your',
    'externalCryptoTransfer.send.wallet': 'Wallet',
    'externalCryptoTransfer.send.copyAddress': 'Copy address',
    'externalCryptoTransfer.send.copied': 'Copied',
    'externalCryptoTransfer.send.recipientAddress': 'Recipient Wallet Address',
    'externalCryptoTransfer.send.success': 'Transfer submitted (pending review)',
    'externalCryptoTransfer.send.action': 'Send',
    'externalCryptoTransfer.send.networkWarning1': 'Only send',
    'externalCryptoTransfer.send.networkWarning2': 'on the',
    'externalCryptoTransfer.send.networkWarning3': 'network. Sending to an incompatible network may result in loss of funds.',

    'externalCryptoTransfer.receive.senderAddress': 'Sender Wallet Address',
    'externalCryptoTransfer.receive.senderHelp': 'The wallet address the sender is transferring from',
    'externalCryptoTransfer.receive.amountHelp': 'The amount you expect to receive',
    'externalCryptoTransfer.receive.success': 'Receive request submitted (pending confirmation)',
    'externalCryptoTransfer.receive.action': 'Submit Receive Request',
    'externalCryptoTransfer.receive.networkWarning1': 'Ensure the sender is sending',
    'externalCryptoTransfer.receive.networkWarning2': 'on the',
    'externalCryptoTransfer.receive.networkWarning3': 'network. This receive request will be subject to confirmation.',

    'externalCryptoTransfer.errors.invalidAmount': 'Enter a valid amount',
    'externalCryptoTransfer.errors.recipientRequired': 'Recipient wallet address is required',
    'externalCryptoTransfer.errors.senderRequired': 'Sender wallet address is required',
    'externalCryptoTransfer.errors.invalidAddress': 'Enter a valid wallet address',
    'externalCryptoTransfer.errors.insufficient': 'Insufficient',
    'externalCryptoTransfer.errors.balance': 'balance',
  },

  fr: {
    'externalCryptoTransfer.title': 'Transfert crypto externe',

    'externalCryptoTransfer.tabs.send': 'Envoyer',
    'externalCryptoTransfer.tabs.receive': 'Recevoir',

    'externalCryptoTransfer.send.subtitle': 'Envoyer des cryptos vers un portefeuille externe',
    'externalCryptoTransfer.receive.subtitle': 'Enregistrer une réception crypto entrante',

    'externalCryptoTransfer.fields.selectCoin': 'Sélectionner la crypto',
    'externalCryptoTransfer.fields.amount': 'Montant',
    'externalCryptoTransfer.fields.note': 'Note',

    'externalCryptoTransfer.optional': 'optionnel',
    'externalCryptoTransfer.available': 'Disponible :',

    'externalCryptoTransfer.placeholders.amount': '0.00',
    'externalCryptoTransfer.placeholders.sendNote': 'Référence de paiement ou mémo',
    'externalCryptoTransfer.placeholders.receiveNote': 'ID de transaction, référence ou mémo',

    'externalCryptoTransfer.send.yourWallet': 'Votre portefeuille',
    'externalCryptoTransfer.send.wallet': '',
    'externalCryptoTransfer.send.copyAddress': 'Copier l’adresse',
    'externalCryptoTransfer.send.copied': 'Copié',
    'externalCryptoTransfer.send.recipientAddress': 'Adresse du portefeuille destinataire',
    'externalCryptoTransfer.send.success': 'Transfert soumis (en attente de vérification)',
    'externalCryptoTransfer.send.action': 'Envoyer',
    'externalCryptoTransfer.send.networkWarning1': 'N’envoyez que',
    'externalCryptoTransfer.send.networkWarning2': 'sur le réseau',
    'externalCryptoTransfer.send.networkWarning3': '. Un envoi sur un réseau incompatible peut entraîner une perte de fonds.',

    'externalCryptoTransfer.receive.senderAddress': 'Adresse du portefeuille expéditeur',
    'externalCryptoTransfer.receive.senderHelp': 'Adresse du portefeuille depuis lequel l’expéditeur effectue le transfert',
    'externalCryptoTransfer.receive.amountHelp': 'Le montant que vous prévoyez de recevoir',
    'externalCryptoTransfer.receive.success': 'Demande de réception soumise (en attente de confirmation)',
    'externalCryptoTransfer.receive.action': 'Soumettre la demande de réception',
    'externalCryptoTransfer.receive.networkWarning1': 'Assurez-vous que l’expéditeur envoie',
    'externalCryptoTransfer.receive.networkWarning2': 'sur le réseau',
    'externalCryptoTransfer.receive.networkWarning3': '. Cette demande de réception sera soumise à confirmation.',

    'externalCryptoTransfer.errors.invalidAmount': 'Entrez un montant valide',
    'externalCryptoTransfer.errors.recipientRequired': 'L’adresse du portefeuille destinataire est requise',
    'externalCryptoTransfer.errors.senderRequired': 'L’adresse du portefeuille expéditeur est requise',
    'externalCryptoTransfer.errors.invalidAddress': 'Entrez une adresse de portefeuille valide',
    'externalCryptoTransfer.errors.insufficient': 'Solde insuffisant de',
    'externalCryptoTransfer.errors.balance': '',
  },

  de: {
    'externalCryptoTransfer.title': 'Externer Krypto-Transfer',

    'externalCryptoTransfer.tabs.send': 'Senden',
    'externalCryptoTransfer.tabs.receive': 'Empfangen',

    'externalCryptoTransfer.send.subtitle': 'Krypto an ein externes Wallet senden',
    'externalCryptoTransfer.receive.subtitle': 'Einen eingehenden Krypto-Transfer erfassen',

    'externalCryptoTransfer.fields.selectCoin': 'Coin auswählen',
    'externalCryptoTransfer.fields.amount': 'Betrag',
    'externalCryptoTransfer.fields.note': 'Notiz',

    'externalCryptoTransfer.optional': 'optional',
    'externalCryptoTransfer.available': 'Verfügbar:',

    'externalCryptoTransfer.placeholders.amount': '0.00',
    'externalCryptoTransfer.placeholders.sendNote': 'Zahlungsreferenz oder Verwendungszweck',
    'externalCryptoTransfer.placeholders.receiveNote': 'Transaktions-ID, Referenz oder Notiz',

    'externalCryptoTransfer.send.yourWallet': 'Ihr',
    'externalCryptoTransfer.send.wallet': 'Wallet',
    'externalCryptoTransfer.send.copyAddress': 'Adresse kopieren',
    'externalCryptoTransfer.send.copied': 'Kopiert',
    'externalCryptoTransfer.send.recipientAddress': 'Empfänger-Wallet-Adresse',
    'externalCryptoTransfer.send.success': 'Transfer eingereicht (ausstehende Prüfung)',
    'externalCryptoTransfer.send.action': 'Senden',
    'externalCryptoTransfer.send.networkWarning1': 'Senden Sie nur',
    'externalCryptoTransfer.send.networkWarning2': 'über das',
    'externalCryptoTransfer.send.networkWarning3': 'Netzwerk. Das Senden an ein inkompatibles Netzwerk kann zum Verlust von Geldern führen.',

    'externalCryptoTransfer.receive.senderAddress': 'Absender-Wallet-Adresse',
    'externalCryptoTransfer.receive.senderHelp': 'Die Wallet-Adresse, von der der Absender überweist',
    'externalCryptoTransfer.receive.amountHelp': 'Der Betrag, den Sie voraussichtlich erhalten',
    'externalCryptoTransfer.receive.success': 'Empfangsanfrage eingereicht (ausstehende Bestätigung)',
    'externalCryptoTransfer.receive.action': 'Empfangsanfrage senden',
    'externalCryptoTransfer.receive.networkWarning1': 'Stellen Sie sicher, dass der Absender',
    'externalCryptoTransfer.receive.networkWarning2': 'über das',
    'externalCryptoTransfer.receive.networkWarning3': 'Netzwerk sendet. Diese Empfangsanfrage muss bestätigt werden.',

    'externalCryptoTransfer.errors.invalidAmount': 'Geben Sie einen gültigen Betrag ein',
    'externalCryptoTransfer.errors.recipientRequired': 'Empfänger-Wallet-Adresse ist erforderlich',
    'externalCryptoTransfer.errors.senderRequired': 'Absender-Wallet-Adresse ist erforderlich',
    'externalCryptoTransfer.errors.invalidAddress': 'Geben Sie eine gültige Wallet-Adresse ein',
    'externalCryptoTransfer.errors.insufficient': 'Unzureichendes',
    'externalCryptoTransfer.errors.balance': 'Guthaben',
  },

  es: {
    'externalCryptoTransfer.title': 'Transferencia cripto externa',

    'externalCryptoTransfer.tabs.send': 'Enviar',
    'externalCryptoTransfer.tabs.receive': 'Recibir',

    'externalCryptoTransfer.send.subtitle': 'Enviar cripto a una billetera externa',
    'externalCryptoTransfer.receive.subtitle': 'Registrar una transferencia cripto entrante',

    'externalCryptoTransfer.fields.selectCoin': 'Seleccionar moneda',
    'externalCryptoTransfer.fields.amount': 'Monto',
    'externalCryptoTransfer.fields.note': 'Nota',

    'externalCryptoTransfer.optional': 'opcional',
    'externalCryptoTransfer.available': 'Disponible:',

    'externalCryptoTransfer.placeholders.amount': '0.00',
    'externalCryptoTransfer.placeholders.sendNote': 'Referencia de pago o memo',
    'externalCryptoTransfer.placeholders.receiveNote': 'ID de transacción, referencia o memo',

    'externalCryptoTransfer.send.yourWallet': 'Tu',
    'externalCryptoTransfer.send.wallet': 'billetera',
    'externalCryptoTransfer.send.copyAddress': 'Copiar dirección',
    'externalCryptoTransfer.send.copied': 'Copiado',
    'externalCryptoTransfer.send.recipientAddress': 'Dirección de la billetera destinataria',
    'externalCryptoTransfer.send.success': 'Transferencia enviada (pendiente de revisión)',
    'externalCryptoTransfer.send.action': 'Enviar',
    'externalCryptoTransfer.send.networkWarning1': 'Envía solo',
    'externalCryptoTransfer.send.networkWarning2': 'en la red',
    'externalCryptoTransfer.send.networkWarning3': '. Enviar a una red incompatible puede causar pérdida de fondos.',

    'externalCryptoTransfer.receive.senderAddress': 'Dirección de la billetera remitente',
    'externalCryptoTransfer.receive.senderHelp': 'La dirección de la billetera desde la que el remitente transfiere',
    'externalCryptoTransfer.receive.amountHelp': 'La cantidad que esperas recibir',
    'externalCryptoTransfer.receive.success': 'Solicitud de recepción enviada (pendiente de confirmación)',
    'externalCryptoTransfer.receive.action': 'Enviar solicitud de recepción',
    'externalCryptoTransfer.receive.networkWarning1': 'Asegúrate de que el remitente esté enviando',
    'externalCryptoTransfer.receive.networkWarning2': 'en la red',
    'externalCryptoTransfer.receive.networkWarning3': '. Esta solicitud de recepción estará sujeta a confirmación.',

    'externalCryptoTransfer.errors.invalidAmount': 'Ingresa un monto válido',
    'externalCryptoTransfer.errors.recipientRequired': 'La dirección de la billetera destinataria es obligatoria',
    'externalCryptoTransfer.errors.senderRequired': 'La dirección de la billetera remitente es obligatoria',
    'externalCryptoTransfer.errors.invalidAddress': 'Ingresa una dirección de billetera válida',
    'externalCryptoTransfer.errors.insufficient': 'Saldo insuficiente de',
    'externalCryptoTransfer.errors.balance': '',
  },

  it: {
    'externalCryptoTransfer.title': 'Trasferimento crypto esterno',

    'externalCryptoTransfer.tabs.send': 'Invia',
    'externalCryptoTransfer.tabs.receive': 'Ricevi',

    'externalCryptoTransfer.send.subtitle': 'Invia crypto a un wallet esterno',
    'externalCryptoTransfer.receive.subtitle': 'Registra un trasferimento crypto in entrata',

    'externalCryptoTransfer.fields.selectCoin': 'Seleziona moneta',
    'externalCryptoTransfer.fields.amount': 'Importo',
    'externalCryptoTransfer.fields.note': 'Nota',

    'externalCryptoTransfer.optional': 'opzionale',
    'externalCryptoTransfer.available': 'Disponibile:',

    'externalCryptoTransfer.placeholders.amount': '0.00',
    'externalCryptoTransfer.placeholders.sendNote': 'Riferimento pagamento o memo',
    'externalCryptoTransfer.placeholders.receiveNote': 'ID transazione, riferimento o memo',

    'externalCryptoTransfer.send.yourWallet': 'Il tuo wallet',
    'externalCryptoTransfer.send.wallet': '',
    'externalCryptoTransfer.send.copyAddress': 'Copia indirizzo',
    'externalCryptoTransfer.send.copied': 'Copiato',
    'externalCryptoTransfer.send.recipientAddress': 'Indirizzo wallet destinatario',
    'externalCryptoTransfer.send.success': 'Trasferimento inviato (in attesa di revisione)',
    'externalCryptoTransfer.send.action': 'Invia',
    'externalCryptoTransfer.send.networkWarning1': 'Invia solo',
    'externalCryptoTransfer.send.networkWarning2': 'sulla rete',
    'externalCryptoTransfer.send.networkWarning3': '. L’invio su una rete incompatibile può causare perdita di fondi.',

    'externalCryptoTransfer.receive.senderAddress': 'Indirizzo wallet mittente',
    'externalCryptoTransfer.receive.senderHelp': 'L’indirizzo del wallet da cui il mittente sta trasferendo',
    'externalCryptoTransfer.receive.amountHelp': 'L’importo che ti aspetti di ricevere',
    'externalCryptoTransfer.receive.success': 'Richiesta di ricezione inviata (in attesa di conferma)',
    'externalCryptoTransfer.receive.action': 'Invia richiesta di ricezione',
    'externalCryptoTransfer.receive.networkWarning1': 'Assicurati che il mittente stia inviando',
    'externalCryptoTransfer.receive.networkWarning2': 'sulla rete',
    'externalCryptoTransfer.receive.networkWarning3': '. Questa richiesta di ricezione sarà soggetta a conferma.',

    'externalCryptoTransfer.errors.invalidAmount': 'Inserisci un importo valido',
    'externalCryptoTransfer.errors.recipientRequired': 'L’indirizzo del wallet destinatario è obbligatorio',
    'externalCryptoTransfer.errors.senderRequired': 'L’indirizzo del wallet mittente è obbligatorio',
    'externalCryptoTransfer.errors.invalidAddress': 'Inserisci un indirizzo wallet valido',
    'externalCryptoTransfer.errors.insufficient': 'Saldo insufficiente di',
    'externalCryptoTransfer.errors.balance': '',
  },

  el: {
    'externalCryptoTransfer.title': 'Εξωτερική crypto μεταφορά',

    'externalCryptoTransfer.tabs.send': 'Αποστολή',
    'externalCryptoTransfer.tabs.receive': 'Λήψη',

    'externalCryptoTransfer.send.subtitle': 'Στείλτε crypto σε εξωτερικό wallet',
    'externalCryptoTransfer.receive.subtitle': 'Καταχωρίστε εισερχόμενη crypto μεταφορά',

    'externalCryptoTransfer.fields.selectCoin': 'Επιλογή νομίσματος',
    'externalCryptoTransfer.fields.amount': 'Ποσό',
    'externalCryptoTransfer.fields.note': 'Σημείωση',

    'externalCryptoTransfer.optional': 'προαιρετικό',
    'externalCryptoTransfer.available': 'Διαθέσιμο:',

    'externalCryptoTransfer.placeholders.amount': '0.00',
    'externalCryptoTransfer.placeholders.sendNote': 'Αναφορά πληρωμής ή σημείωμα',
    'externalCryptoTransfer.placeholders.receiveNote': 'ID συναλλαγής, αναφορά ή σημείωμα',

    'externalCryptoTransfer.send.yourWallet': 'Το',
    'externalCryptoTransfer.send.wallet': 'wallet σας',
    'externalCryptoTransfer.send.copyAddress': 'Αντιγραφή διεύθυνσης',
    'externalCryptoTransfer.send.copied': 'Αντιγράφηκε',
    'externalCryptoTransfer.send.recipientAddress': 'Διεύθυνση wallet παραλήπτη',
    'externalCryptoTransfer.send.success': 'Η μεταφορά υποβλήθηκε (σε εκκρεμότητα ελέγχου)',
    'externalCryptoTransfer.send.action': 'Αποστολή',
    'externalCryptoTransfer.send.networkWarning1': 'Στείλτε μόνο',
    'externalCryptoTransfer.send.networkWarning2': 'στο δίκτυο',
    'externalCryptoTransfer.send.networkWarning3': '. Η αποστολή σε μη συμβατό δίκτυο μπορεί να οδηγήσει σε απώλεια χρημάτων.',

    'externalCryptoTransfer.receive.senderAddress': 'Διεύθυνση wallet αποστολέα',
    'externalCryptoTransfer.receive.senderHelp': 'Η διεύθυνση wallet από την οποία μεταφέρει ο αποστολέας',
    'externalCryptoTransfer.receive.amountHelp': 'Το ποσό που περιμένετε να λάβετε',
    'externalCryptoTransfer.receive.success': 'Η αίτηση λήψης υποβλήθηκε (σε εκκρεμότητα επιβεβαίωσης)',
    'externalCryptoTransfer.receive.action': 'Υποβολή αιτήματος λήψης',
    'externalCryptoTransfer.receive.networkWarning1': 'Βεβαιωθείτε ότι ο αποστολέας στέλνει',
    'externalCryptoTransfer.receive.networkWarning2': 'στο δίκτυο',
    'externalCryptoTransfer.receive.networkWarning3': '. Αυτό το αίτημα λήψης θα υπόκειται σε επιβεβαίωση.',

    'externalCryptoTransfer.errors.invalidAmount': 'Εισαγάγετε έγκυρο ποσό',
    'externalCryptoTransfer.errors.recipientRequired': 'Η διεύθυνση wallet παραλήπτη είναι υποχρεωτική',
    'externalCryptoTransfer.errors.senderRequired': 'Η διεύθυνση wallet αποστολέα είναι υποχρεωτική',
    'externalCryptoTransfer.errors.invalidAddress': 'Εισαγάγετε έγκυρη διεύθυνση wallet',
    'externalCryptoTransfer.errors.insufficient': 'Ανεπαρκές',
    'externalCryptoTransfer.errors.balance': 'υπόλοιπο',
  },
});