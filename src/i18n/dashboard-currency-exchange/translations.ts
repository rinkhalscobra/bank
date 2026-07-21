import { registerTranslations } from '../../contexts/LanguageContext';

registerTranslations({
  en: {
    'dashboardCurrencyExchange.title': 'Currency Exchange',
    'dashboardCurrencyExchange.subtitle': 'Exchange fiat and crypto at live market rates',
    'dashboardCurrencyExchange.updated': 'Updated',

    'dashboardCurrencyExchange.actions.refresh': 'Refresh',
    'dashboardCurrencyExchange.actions.processing': 'Processing...',
    'dashboardCurrencyExchange.actions.exchange': 'Exchange',
    'dashboardCurrencyExchange.actions.swap': 'Swap',
    'dashboardCurrencyExchange.actions.max': 'MAX',

    'dashboardCurrencyExchange.fields.from': 'From',
    'dashboardCurrencyExchange.fields.to': 'To',
    'dashboardCurrencyExchange.fields.amount': 'Amount',

    'dashboardCurrencyExchange.placeholders.selectCurrency': 'Select currency',
    'dashboardCurrencyExchange.placeholders.selectToken': 'Select token',
    'dashboardCurrencyExchange.placeholders.amount': '0.00',

    'dashboardCurrencyExchange.balance': 'Balance',
    'dashboardCurrencyExchange.insufficient': 'Insufficient',

    'dashboardCurrencyExchange.summary.youSend': 'You Send',
    'dashboardCurrencyExchange.summary.youReceive': 'You Receive',
    'dashboardCurrencyExchange.summary.rate': 'Rate',
    'dashboardCurrencyExchange.summary.price': 'Price',
    'dashboardCurrencyExchange.summary.value': 'Value',

    'dashboardCurrencyExchange.messages.exchanged': 'Exchanged',
    'dashboardCurrencyExchange.messages.swapped': 'Swapped',
    'dashboardCurrencyExchange.messages.to': 'to',

    'dashboardCurrencyExchange.fiat.title': 'Fiat Exchange',
    'dashboardCurrencyExchange.fiat.liveRatesSource': 'Live rates via Frankfurter API',
    'dashboardCurrencyExchange.fiat.liveRates': 'Live Rates',

    'dashboardCurrencyExchange.crypto.title': 'Crypto Exchange',
    'dashboardCurrencyExchange.crypto.livePricesSource': 'Live prices via CoinGecko',
    'dashboardCurrencyExchange.crypto.livePrices': 'Live Prices',

    'dashboardCurrencyExchange.cross.title': 'Fiat ↔ Crypto Exchange',
    'dashboardCurrencyExchange.cross.liveRatesSource': 'Live fiat rates and crypto prices',
    'dashboardCurrencyExchange.cross.direction': 'Direction',
    'dashboardCurrencyExchange.cross.fiatToCrypto': 'Fiat to Crypto',
    'dashboardCurrencyExchange.cross.cryptoToFiat': 'Crypto to Fiat',
    'dashboardCurrencyExchange.cross.reverse': 'Reverse exchange direction',
    'dashboardCurrencyExchange.cross.convert': 'Convert',

    'dashboardCurrencyExchange.currencies.usd': 'US Dollar',
    'dashboardCurrencyExchange.currencies.eur': 'Euro',
    'dashboardCurrencyExchange.currencies.cad': 'Canadian Dollar',
    'dashboardCurrencyExchange.currencies.chf': 'Swiss Franc',

    'dashboardCurrencyExchange.time.secondsAgo': 's ago',
    'dashboardCurrencyExchange.time.minutesAgo': 'm ago',
  },

  fr: {
    'dashboardCurrencyExchange.title': 'Change de devises',
    'dashboardCurrencyExchange.subtitle': 'Échangez des devises fiat et crypto aux taux du marché en direct',
    'dashboardCurrencyExchange.updated': 'Mis à jour',

    'dashboardCurrencyExchange.actions.refresh': 'Actualiser',
    'dashboardCurrencyExchange.actions.processing': 'Traitement...',
    'dashboardCurrencyExchange.actions.exchange': 'Échanger',
    'dashboardCurrencyExchange.actions.swap': 'Convertir',
    'dashboardCurrencyExchange.actions.max': 'MAX',

    'dashboardCurrencyExchange.fields.from': 'De',
    'dashboardCurrencyExchange.fields.to': 'Vers',
    'dashboardCurrencyExchange.fields.amount': 'Montant',

    'dashboardCurrencyExchange.placeholders.selectCurrency': 'Sélectionner une devise',
    'dashboardCurrencyExchange.placeholders.selectToken': 'Sélectionner un token',
    'dashboardCurrencyExchange.placeholders.amount': '0.00',

    'dashboardCurrencyExchange.balance': 'Solde',
    'dashboardCurrencyExchange.insufficient': 'Insuffisant',

    'dashboardCurrencyExchange.summary.youSend': 'Vous envoyez',
    'dashboardCurrencyExchange.summary.youReceive': 'Vous recevez',
    'dashboardCurrencyExchange.summary.rate': 'Taux',
    'dashboardCurrencyExchange.summary.price': 'Prix',
    'dashboardCurrencyExchange.summary.value': 'Valeur',

    'dashboardCurrencyExchange.messages.exchanged': 'Échangé',
    'dashboardCurrencyExchange.messages.swapped': 'Converti',
    'dashboardCurrencyExchange.messages.to': 'en',

    'dashboardCurrencyExchange.fiat.title': 'Change fiat',
    'dashboardCurrencyExchange.fiat.liveRatesSource': 'Taux en direct via Frankfurter API',
    'dashboardCurrencyExchange.fiat.liveRates': 'Taux en direct',

    'dashboardCurrencyExchange.crypto.title': 'Change crypto',
    'dashboardCurrencyExchange.crypto.livePricesSource': 'Prix en direct via CoinGecko',
    'dashboardCurrencyExchange.crypto.livePrices': 'Prix en direct',

    'dashboardCurrencyExchange.cross.title': 'Échange fiat ↔ crypto',
    'dashboardCurrencyExchange.cross.liveRatesSource': 'Taux fiat et prix crypto en direct',
    'dashboardCurrencyExchange.cross.direction': 'Sens',
    'dashboardCurrencyExchange.cross.fiatToCrypto': 'Fiat vers crypto',
    'dashboardCurrencyExchange.cross.cryptoToFiat': 'Crypto vers fiat',
    'dashboardCurrencyExchange.cross.reverse': 'Inverser le sens de l’échange',
    'dashboardCurrencyExchange.cross.convert': 'Convertir',

    'dashboardCurrencyExchange.currencies.usd': 'Dollar américain',
    'dashboardCurrencyExchange.currencies.eur': 'Euro',
    'dashboardCurrencyExchange.currencies.cad': 'Dollar canadien',
    'dashboardCurrencyExchange.currencies.chf': 'Franc suisse',

    'dashboardCurrencyExchange.time.secondsAgo': 's',
    'dashboardCurrencyExchange.time.minutesAgo': ' min',
  },

  de: {
    'dashboardCurrencyExchange.title': 'Währungsumtausch',
    'dashboardCurrencyExchange.subtitle': 'Tauschen Sie Fiat und Krypto zu Live-Marktkursen',
    'dashboardCurrencyExchange.updated': 'Aktualisiert',

    'dashboardCurrencyExchange.actions.refresh': 'Aktualisieren',
    'dashboardCurrencyExchange.actions.processing': 'Verarbeitung...',
    'dashboardCurrencyExchange.actions.exchange': 'Umtauschen',
    'dashboardCurrencyExchange.actions.swap': 'Tauschen',
    'dashboardCurrencyExchange.actions.max': 'MAX',

    'dashboardCurrencyExchange.fields.from': 'Von',
    'dashboardCurrencyExchange.fields.to': 'Nach',
    'dashboardCurrencyExchange.fields.amount': 'Betrag',

    'dashboardCurrencyExchange.placeholders.selectCurrency': 'Währung auswählen',
    'dashboardCurrencyExchange.placeholders.selectToken': 'Token auswählen',
    'dashboardCurrencyExchange.placeholders.amount': '0.00',

    'dashboardCurrencyExchange.balance': 'Kontostand',
    'dashboardCurrencyExchange.insufficient': 'Unzureichend',

    'dashboardCurrencyExchange.summary.youSend': 'Sie senden',
    'dashboardCurrencyExchange.summary.youReceive': 'Sie erhalten',
    'dashboardCurrencyExchange.summary.rate': 'Kurs',
    'dashboardCurrencyExchange.summary.price': 'Preis',
    'dashboardCurrencyExchange.summary.value': 'Wert',

    'dashboardCurrencyExchange.messages.exchanged': 'Getauscht',
    'dashboardCurrencyExchange.messages.swapped': 'Getauscht',
    'dashboardCurrencyExchange.messages.to': 'in',

    'dashboardCurrencyExchange.fiat.title': 'Fiat-Umtausch',
    'dashboardCurrencyExchange.fiat.liveRatesSource': 'Live-Kurse über Frankfurter API',
    'dashboardCurrencyExchange.fiat.liveRates': 'Live-Kurse',

    'dashboardCurrencyExchange.crypto.title': 'Krypto-Umtausch',
    'dashboardCurrencyExchange.crypto.livePricesSource': 'Live-Preise über CoinGecko',
    'dashboardCurrencyExchange.crypto.livePrices': 'Live-Preise',

    'dashboardCurrencyExchange.cross.title': 'Fiat- ↔ Krypto-Umtausch',
    'dashboardCurrencyExchange.cross.liveRatesSource': 'Live-Fiatkurse und Kryptopreise',
    'dashboardCurrencyExchange.cross.direction': 'Richtung',
    'dashboardCurrencyExchange.cross.fiatToCrypto': 'Fiat zu Krypto',
    'dashboardCurrencyExchange.cross.cryptoToFiat': 'Krypto zu Fiat',
    'dashboardCurrencyExchange.cross.reverse': 'Umtauschrichtung wechseln',
    'dashboardCurrencyExchange.cross.convert': 'Umtauschen',

    'dashboardCurrencyExchange.currencies.usd': 'US-Dollar',
    'dashboardCurrencyExchange.currencies.eur': 'Euro',
    'dashboardCurrencyExchange.currencies.cad': 'Kanadischer Dollar',
    'dashboardCurrencyExchange.currencies.chf': 'Schweizer Franken',

    'dashboardCurrencyExchange.time.secondsAgo': 's zuvor',
    'dashboardCurrencyExchange.time.minutesAgo': ' Min. zuvor',
  },

  es: {
    'dashboardCurrencyExchange.title': 'Cambio de divisas',
    'dashboardCurrencyExchange.subtitle': 'Intercambia fiat y cripto con tasas de mercado en vivo',
    'dashboardCurrencyExchange.updated': 'Actualizado',

    'dashboardCurrencyExchange.actions.refresh': 'Actualizar',
    'dashboardCurrencyExchange.actions.processing': 'Procesando...',
    'dashboardCurrencyExchange.actions.exchange': 'Cambiar',
    'dashboardCurrencyExchange.actions.swap': 'Intercambiar',
    'dashboardCurrencyExchange.actions.max': 'MAX',

    'dashboardCurrencyExchange.fields.from': 'Desde',
    'dashboardCurrencyExchange.fields.to': 'Hacia',
    'dashboardCurrencyExchange.fields.amount': 'Monto',

    'dashboardCurrencyExchange.placeholders.selectCurrency': 'Selecciona moneda',
    'dashboardCurrencyExchange.placeholders.selectToken': 'Selecciona token',
    'dashboardCurrencyExchange.placeholders.amount': '0.00',

    'dashboardCurrencyExchange.balance': 'Saldo',
    'dashboardCurrencyExchange.insufficient': 'Insuficiente',

    'dashboardCurrencyExchange.summary.youSend': 'Envías',
    'dashboardCurrencyExchange.summary.youReceive': 'Recibes',
    'dashboardCurrencyExchange.summary.rate': 'Tasa',
    'dashboardCurrencyExchange.summary.price': 'Precio',
    'dashboardCurrencyExchange.summary.value': 'Valor',

    'dashboardCurrencyExchange.messages.exchanged': 'Cambiado',
    'dashboardCurrencyExchange.messages.swapped': 'Intercambiado',
    'dashboardCurrencyExchange.messages.to': 'a',

    'dashboardCurrencyExchange.fiat.title': 'Cambio fiat',
    'dashboardCurrencyExchange.fiat.liveRatesSource': 'Tasas en vivo vía Frankfurter API',
    'dashboardCurrencyExchange.fiat.liveRates': 'Tasas en vivo',

    'dashboardCurrencyExchange.crypto.title': 'Cambio cripto',
    'dashboardCurrencyExchange.crypto.livePricesSource': 'Precios en vivo vía CoinGecko',
    'dashboardCurrencyExchange.crypto.livePrices': 'Precios en vivo',

    'dashboardCurrencyExchange.cross.title': 'Cambio fiat ↔ cripto',
    'dashboardCurrencyExchange.cross.liveRatesSource': 'Tasas fiat y precios cripto en vivo',
    'dashboardCurrencyExchange.cross.direction': 'Dirección',
    'dashboardCurrencyExchange.cross.fiatToCrypto': 'Fiat a cripto',
    'dashboardCurrencyExchange.cross.cryptoToFiat': 'Cripto a fiat',
    'dashboardCurrencyExchange.cross.reverse': 'Invertir dirección del cambio',
    'dashboardCurrencyExchange.cross.convert': 'Convertir',

    'dashboardCurrencyExchange.currencies.usd': 'Dólar estadounidense',
    'dashboardCurrencyExchange.currencies.eur': 'Euro',
    'dashboardCurrencyExchange.currencies.cad': 'Dólar canadiense',
    'dashboardCurrencyExchange.currencies.chf': 'Franco suizo',

    'dashboardCurrencyExchange.time.secondsAgo': 's atrás',
    'dashboardCurrencyExchange.time.minutesAgo': 'm atrás',
  },

  it: {
    'dashboardCurrencyExchange.title': 'Cambio valuta',
    'dashboardCurrencyExchange.subtitle': 'Scambia fiat e crypto ai tassi di mercato in tempo reale',
    'dashboardCurrencyExchange.updated': 'Aggiornato',

    'dashboardCurrencyExchange.actions.refresh': 'Aggiorna',
    'dashboardCurrencyExchange.actions.processing': 'Elaborazione...',
    'dashboardCurrencyExchange.actions.exchange': 'Cambia',
    'dashboardCurrencyExchange.actions.swap': 'Scambia',
    'dashboardCurrencyExchange.actions.max': 'MAX',

    'dashboardCurrencyExchange.fields.from': 'Da',
    'dashboardCurrencyExchange.fields.to': 'A',
    'dashboardCurrencyExchange.fields.amount': 'Importo',

    'dashboardCurrencyExchange.placeholders.selectCurrency': 'Seleziona valuta',
    'dashboardCurrencyExchange.placeholders.selectToken': 'Seleziona token',
    'dashboardCurrencyExchange.placeholders.amount': '0.00',

    'dashboardCurrencyExchange.balance': 'Saldo',
    'dashboardCurrencyExchange.insufficient': 'Insufficiente',

    'dashboardCurrencyExchange.summary.youSend': 'Invii',
    'dashboardCurrencyExchange.summary.youReceive': 'Ricevi',
    'dashboardCurrencyExchange.summary.rate': 'Tasso',
    'dashboardCurrencyExchange.summary.price': 'Prezzo',
    'dashboardCurrencyExchange.summary.value': 'Valore',

    'dashboardCurrencyExchange.messages.exchanged': 'Convertito',
    'dashboardCurrencyExchange.messages.swapped': 'Scambiato',
    'dashboardCurrencyExchange.messages.to': 'in',

    'dashboardCurrencyExchange.fiat.title': 'Cambio fiat',
    'dashboardCurrencyExchange.fiat.liveRatesSource': 'Tassi live tramite Frankfurter API',
    'dashboardCurrencyExchange.fiat.liveRates': 'Tassi live',

    'dashboardCurrencyExchange.crypto.title': 'Cambio crypto',
    'dashboardCurrencyExchange.crypto.livePricesSource': 'Prezzi live tramite CoinGecko',
    'dashboardCurrencyExchange.crypto.livePrices': 'Prezzi live',

    'dashboardCurrencyExchange.cross.title': 'Cambio fiat ↔ crypto',
    'dashboardCurrencyExchange.cross.liveRatesSource': 'Tassi fiat e prezzi crypto in tempo reale',
    'dashboardCurrencyExchange.cross.direction': 'Direzione',
    'dashboardCurrencyExchange.cross.fiatToCrypto': 'Fiat in crypto',
    'dashboardCurrencyExchange.cross.cryptoToFiat': 'Crypto in fiat',
    'dashboardCurrencyExchange.cross.reverse': 'Inverti la direzione del cambio',
    'dashboardCurrencyExchange.cross.convert': 'Converti',

    'dashboardCurrencyExchange.currencies.usd': 'Dollaro USA',
    'dashboardCurrencyExchange.currencies.eur': 'Euro',
    'dashboardCurrencyExchange.currencies.cad': 'Dollaro canadese',
    'dashboardCurrencyExchange.currencies.chf': 'Franco svizzero',

    'dashboardCurrencyExchange.time.secondsAgo': 's fa',
    'dashboardCurrencyExchange.time.minutesAgo': 'm fa',
  },

  el: {
    'dashboardCurrencyExchange.title': 'Ανταλλαγή νομισμάτων',
    'dashboardCurrencyExchange.subtitle': 'Ανταλλάξτε fiat και crypto με ζωντανές τιμές αγοράς',
    'dashboardCurrencyExchange.updated': 'Ενημερώθηκε',

    'dashboardCurrencyExchange.actions.refresh': 'Ανανέωση',
    'dashboardCurrencyExchange.actions.processing': 'Επεξεργασία...',
    'dashboardCurrencyExchange.actions.exchange': 'Ανταλλαγή',
    'dashboardCurrencyExchange.actions.swap': 'Swap',
    'dashboardCurrencyExchange.actions.max': 'MAX',

    'dashboardCurrencyExchange.fields.from': 'Από',
    'dashboardCurrencyExchange.fields.to': 'Προς',
    'dashboardCurrencyExchange.fields.amount': 'Ποσό',

    'dashboardCurrencyExchange.placeholders.selectCurrency': 'Επιλέξτε νόμισμα',
    'dashboardCurrencyExchange.placeholders.selectToken': 'Επιλέξτε token',
    'dashboardCurrencyExchange.placeholders.amount': '0.00',

    'dashboardCurrencyExchange.balance': 'Υπόλοιπο',
    'dashboardCurrencyExchange.insufficient': 'Ανεπαρκές',

    'dashboardCurrencyExchange.summary.youSend': 'Στέλνετε',
    'dashboardCurrencyExchange.summary.youReceive': 'Λαμβάνετε',
    'dashboardCurrencyExchange.summary.rate': 'Ισοτιμία',
    'dashboardCurrencyExchange.summary.price': 'Τιμή',
    'dashboardCurrencyExchange.summary.value': 'Αξία',

    'dashboardCurrencyExchange.messages.exchanged': 'Ανταλλάχθηκαν',
    'dashboardCurrencyExchange.messages.swapped': 'Έγινε swap',
    'dashboardCurrencyExchange.messages.to': 'σε',

    'dashboardCurrencyExchange.fiat.title': 'Ανταλλαγή fiat',
    'dashboardCurrencyExchange.fiat.liveRatesSource': 'Ζωντανές ισοτιμίες μέσω Frankfurter API',
    'dashboardCurrencyExchange.fiat.liveRates': 'Ζωντανές ισοτιμίες',

    'dashboardCurrencyExchange.crypto.title': 'Ανταλλαγή crypto',
    'dashboardCurrencyExchange.crypto.livePricesSource': 'Ζωντανές τιμές μέσω CoinGecko',
    'dashboardCurrencyExchange.crypto.livePrices': 'Ζωντανές τιμές',

    'dashboardCurrencyExchange.cross.title': 'Ανταλλαγή fiat ↔ crypto',
    'dashboardCurrencyExchange.cross.liveRatesSource': 'Ζωντανές ισοτιμίες fiat και τιμές crypto',
    'dashboardCurrencyExchange.cross.direction': 'Κατεύθυνση',
    'dashboardCurrencyExchange.cross.fiatToCrypto': 'Fiat σε crypto',
    'dashboardCurrencyExchange.cross.cryptoToFiat': 'Crypto σε fiat',
    'dashboardCurrencyExchange.cross.reverse': 'Αντιστροφή κατεύθυνσης ανταλλαγής',
    'dashboardCurrencyExchange.cross.convert': 'Μετατροπή',

    'dashboardCurrencyExchange.currencies.usd': 'Δολάριο ΗΠΑ',
    'dashboardCurrencyExchange.currencies.eur': 'Ευρώ',
    'dashboardCurrencyExchange.currencies.cad': 'Δολάριο Καναδά',
    'dashboardCurrencyExchange.currencies.chf': 'Ελβετικό φράγκο',

    'dashboardCurrencyExchange.time.secondsAgo': 'δ πριν',
    'dashboardCurrencyExchange.time.minutesAgo': 'λ πριν',
  },
});
