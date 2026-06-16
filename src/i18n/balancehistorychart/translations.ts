import { registerTranslations } from '../../contexts/LanguageContext';

export const balanceHistoryChartTranslations = {
  en: {
    'balanceHistoryChart.title': 'Balance Over Time',
    'balanceHistoryChart.empty.title': 'No balance history yet',
    'balanceHistoryChart.empty.description': 'Balance snapshots will appear here as your balances change over time',
    'balanceHistoryChart.noHistoryFor': 'No history for {symbol}',
    'balanceHistoryChart.change.positive': '+{amount} (+{percent}%)',
    'balanceHistoryChart.change.negative': '{amount} ({percent}%)',
  },
  fr: {
    'balanceHistoryChart.title': 'Solde au fil du temps',
    'balanceHistoryChart.empty.title': 'Aucun historique de solde pour le moment',
    'balanceHistoryChart.empty.description': 'Les instantanés du solde apparaîtront ici à mesure que vos soldes évoluent',
    'balanceHistoryChart.noHistoryFor': 'Aucun historique pour {symbol}',
    'balanceHistoryChart.change.positive': '+{amount} (+{percent} %)',
    'balanceHistoryChart.change.negative': '{amount} ({percent} %)',
  },
  de: {
    'balanceHistoryChart.title': 'Kontostand im Zeitverlauf',
    'balanceHistoryChart.empty.title': 'Noch kein Kontostandsverlauf',
    'balanceHistoryChart.empty.description': 'Kontostand-Snapshots werden hier angezeigt, sobald sich Ihre Salden im Laufe der Zeit ändern',
    'balanceHistoryChart.noHistoryFor': 'Kein Verlauf für {symbol}',
    'balanceHistoryChart.change.positive': '+{amount} (+{percent} %)',
    'balanceHistoryChart.change.negative': '{amount} ({percent} %)',
  },
  es: {
    'balanceHistoryChart.title': 'Saldo a lo largo del tiempo',
    'balanceHistoryChart.empty.title': 'Aún no hay historial de saldo',
    'balanceHistoryChart.empty.description': 'Las instantáneas del saldo aparecerán aquí a medida que tus saldos cambien con el tiempo',
    'balanceHistoryChart.noHistoryFor': 'No hay historial para {symbol}',
    'balanceHistoryChart.change.positive': '+{amount} (+{percent}%)',
    'balanceHistoryChart.change.negative': '{amount} ({percent}%)',
  },
  it: {
    'balanceHistoryChart.title': 'Saldo nel tempo',
    'balanceHistoryChart.empty.title': 'Nessuna cronologia del saldo per ora',
    'balanceHistoryChart.empty.description': 'Le istantanee del saldo appariranno qui man mano che i tuoi saldi cambiano nel tempo',
    'balanceHistoryChart.noHistoryFor': 'Nessuna cronologia per {symbol}',
    'balanceHistoryChart.change.positive': '+{amount} (+{percent}%)',
    'balanceHistoryChart.change.negative': '{amount} ({percent}%)',
  },
  el: {
    'balanceHistoryChart.title': 'Υπόλοιπο με την πάροδο του χρόνου',
    'balanceHistoryChart.empty.title': 'Δεν υπάρχει ακόμη ιστορικό υπολοίπου',
    'balanceHistoryChart.empty.description': 'Τα στιγμιότυπα υπολοίπου θα εμφανίζονται εδώ καθώς τα υπόλοιπά σας αλλάζουν με την πάροδο του χρόνου',
    'balanceHistoryChart.noHistoryFor': 'Δεν υπάρχει ιστορικό για το {symbol}',
    'balanceHistoryChart.change.positive': '+{amount} (+{percent}%)',
    'balanceHistoryChart.change.negative': '{amount} ({percent}%)',
  },
} as const;

registerTranslations(balanceHistoryChartTranslations);