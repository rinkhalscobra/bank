import { registerTranslations } from '../../contexts/LanguageContext';

export const privacyPolicyTranslations = {
  en: {
    'privacyPolicy.pageTitle': 'Privacy Policy',
    'privacyPolicy.heroDescription':
      'This Privacy Policy explains how SKOK Bank collects, uses, discloses, stores, and protects personal information in connection with our banking, payments, and digital asset services. We are committed to handling personal data responsibly, lawfully, and with the level of care expected of a financial institution operating in both fiat and blockchain-based environments.',

    'privacyPolicy.effectiveDate': 'Effective Date',
    'privacyPolicy.lastUpdated': 'Last Updated',
    'privacyPolicy.appliesTo': 'Applies To',
    'privacyPolicy.appliesToValue': 'Fiat, Banking, Payments & Digital Assets',

    'privacyPolicy.onThisPage': 'On This Page',
    'privacyPolicy.contactUsNav': '17. Contact Us',
    'privacyPolicy.importantNoticeNav': '18. Important Notice',

    'privacyPolicy.legalNotice.title': 'Important Legal Notice',
    'privacyPolicy.legalNotice.body':
      'This Privacy Policy is intended to communicate our general data handling practices. It should be reviewed and finalized by qualified legal and compliance counsel before publication to ensure alignment with the regulatory, licensing, and operational requirements applicable to your business model and the jurisdictions in which services are offered.',

    'privacyPolicy.section1.title': '1. Scope',
    'privacyPolicy.section1.p1':
      'This Privacy Policy applies to personal information collected through our website, mobile and web applications, customer support channels, onboarding and account opening processes, transaction services, digital asset services, and any other products or services we make available to individuals, businesses, and institutional clients.',
    'privacyPolicy.section1.p2':
      'This Policy applies whether you interact with us as a visitor, prospective customer, authorized user, account holder, beneficial owner, corporate representative, vendor, or other relevant party.',

    'privacyPolicy.section2.title': '2. Information We Collect',
    'privacyPolicy.section2.p1':
      'We may collect the following categories of information, to the extent permitted or required by applicable law:',
    'privacyPolicy.section2.li1':
      'Identity information: full name, date of birth, nationality, government-issued identification details, passport, driver’s license, national ID, tax identification number, and similar verification records.',
    'privacyPolicy.section2.li2':
      'Contact information: residential address, mailing address, email address, telephone number, and other communication details.',
    'privacyPolicy.section2.li3':
      'Financial information: bank account details, payment card details, transaction history, source of funds, source of wealth, income information, account balances, and related financial profile data.',
    'privacyPolicy.section2.li4':
      'Business and corporate information: company name, registration number, business address, directors, shareholders, beneficial ownership information, and corporate verification records.',
    'privacyPolicy.section2.li5':
      'Digital asset information: wallet addresses, transaction hashes, blockchain interaction records, digital asset deposits and withdrawals, custody-related records, and other activity associated with digital asset services.',
    'privacyPolicy.section2.li6':
      'Technical and usage information: IP address, browser type, operating system, device identifiers, access logs, cookies, session data, app interactions, and website usage analytics.',
    'privacyPolicy.section2.li7':
      'Compliance and risk information: sanctions screening results, politically exposed person status, adverse media checks, fraud indicators, risk assessments, and anti-money laundering review records.',
    'privacyPolicy.section2.li8':
      'Communications: correspondence, customer support messages, call recordings where permitted, complaints, and other records of interactions with us.',

    'privacyPolicy.section3.title': '3. How We Collect Information',
    'privacyPolicy.section3.p1':
      'We collect personal information from a variety of sources, including:',
    'privacyPolicy.section3.li1':
      'directly from you during onboarding, applications, or service use;',
    'privacyPolicy.section3.li2':
      'through your transactions and account activity;',
    'privacyPolicy.section3.li3':
      'from your devices and browser when you use our website or apps;',
    'privacyPolicy.section3.li4':
      'from identity verification providers, payment processors, blockchain analytics providers, fraud prevention services, and compliance vendors;',
    'privacyPolicy.section3.li5':
      'from public registries, credit-related sources where lawful, sanctions lists, law enforcement requests, and other legally available sources;',
    'privacyPolicy.section3.li6':
      'from corporate representatives, introducers, or other persons acting on behalf of a customer or entity.',

    'privacyPolicy.section4.title': '4. Why We Use Personal Information',
    'privacyPolicy.section4.p1':
      'We use personal information for legitimate business, contractual, legal, and compliance purposes, including to:',
    'privacyPolicy.section4.li1':
      'provide and maintain banking, fiat payment, and digital asset services;',
    'privacyPolicy.section4.li2': 'open, manage, and administer accounts;',
    'privacyPolicy.section4.li3':
      'verify identity and conduct customer due diligence and enhanced due diligence;',
    'privacyPolicy.section4.li4':
      'process deposits, withdrawals, transfers, trades, settlements, and related instructions;',
    'privacyPolicy.section4.li5':
      'monitor transactions and account activity for fraud, abuse, sanctions exposure, and suspicious activity;',
    'privacyPolicy.section4.li6':
      'comply with legal, regulatory, tax, accounting, and reporting obligations;',
    'privacyPolicy.section4.li7':
      'detect, investigate, and prevent money laundering, terrorist financing, fraud, cyber threats, and other unlawful conduct;',
    'privacyPolicy.section4.li8':
      'secure our systems, platforms, customers, and operations;',
    'privacyPolicy.section4.li9':
      'communicate with you regarding services, notices, support requests, and legal updates;',
    'privacyPolicy.section4.li10':
      'improve our products, service delivery, risk controls, and customer experience;',
    'privacyPolicy.section4.li11': 'enforce our agreements, policies, and legal rights.',

    'privacyPolicy.section5.title': '5. Sensitive Compliance and Verification Activities',
    'privacyPolicy.section5.p1':
      'As a financial services provider operating in fiat and digital asset environments, we may process personal information as part of know-your-customer, anti-money laundering, sanctions compliance, fraud prevention, transaction monitoring, and financial crime risk management procedures.',
    'privacyPolicy.section5.p2':
      'This may include identity verification, document authentication, source-of-funds review, source-of-wealth review, suspicious activity assessment, wallet screening, blockchain analytics, and ongoing account monitoring. Where required, we may retain records of such reviews for the periods mandated by law or regulation.',

    'privacyPolicy.section6.title': '6. Blockchain and Digital Asset Disclosures',
    'privacyPolicy.section6.p1':
      'Certain digital asset transactions may be recorded on public or permissioned distributed ledgers. Blockchain records may be public, immutable, and difficult or impossible to modify or delete.',
    'privacyPolicy.section6.p2':
      'Even where wallet addresses do not directly identify an individual, they may become associated with a person through onboarding records, transaction patterns, analytics, or other data sources. By using digital asset services, you acknowledge that transaction data may be visible to blockchain participants, analytics providers, and other third parties with access to relevant networks or tools.',

    'privacyPolicy.section7.title': '7. Legal Bases for Processing',
    'privacyPolicy.section7.p1':
      'Where applicable law requires a legal basis for processing, we rely on one or more of the following:',
    'privacyPolicy.section7.li1':
      'performance of a contract or steps taken at your request prior to entering a contract;',
    'privacyPolicy.section7.li2':
      'compliance with legal and regulatory obligations;',
    'privacyPolicy.section7.li3':
      'our legitimate interests in operating, protecting, and improving our services;',
    'privacyPolicy.section7.li4':
      'your consent, where consent is required by law.',

    'privacyPolicy.section8.title': '8. How We Share Information',
    'privacyPolicy.section8.p1': 'We may disclose personal information to:',
    'privacyPolicy.section8.li1':
      'companies within our corporate group and affiliated entities;',
    'privacyPolicy.section8.li2':
      'banking partners, payment networks, liquidity providers, custody providers, and settlement counterparties;',
    'privacyPolicy.section8.li3':
      'identity verification, fraud prevention, cyber-security, blockchain analytics, and compliance service providers;',
    'privacyPolicy.section8.li4':
      'professional advisers, auditors, insurers, and legal counsel;',
    'privacyPolicy.section8.li5':
      'regulators, supervisory authorities, courts, law enforcement, tax authorities, and government agencies where required or permitted by law;',
    'privacyPolicy.section8.li6':
      'prospective purchasers, investors, or successors in connection with a merger, acquisition, restructuring, financing, or sale of assets, subject to appropriate confidentiality obligations.',
    'privacyPolicy.section8.p2':
      'We do not sell personal information in the ordinary commercial sense of selling customer data to unrelated third parties for independent marketing purposes.',

    'privacyPolicy.section9.title': '9. International Transfers',
    'privacyPolicy.section9.p1':
      'Your personal information may be processed in jurisdictions outside your country of residence, including jurisdictions that may not provide the same level of data protection as your home jurisdiction.',
    'privacyPolicy.section9.p2':
      'Where required, we implement appropriate safeguards for cross-border transfers, including contractual protections, internal controls, and other lawful transfer mechanisms.',

    'privacyPolicy.section10.title': '10. Data Retention',
    'privacyPolicy.section10.p1':
      'We retain personal information for as long as necessary to fulfill the purposes for which it was collected, including to provide services, maintain accurate business and financial records, resolve disputes, enforce agreements, and comply with legal, tax, accounting, audit, and regulatory obligations.',
    'privacyPolicy.section10.p2':
      'Retention periods may be extended where necessary for compliance investigations, litigation holds, regulatory inquiries, fraud monitoring, or ongoing risk management purposes.',

    'privacyPolicy.section11.title': '11. Security',
    'privacyPolicy.section11.p1':
      'We maintain administrative, technical, and physical safeguards designed to protect personal information against unauthorized access, destruction, loss, alteration, misuse, or disclosure. These measures may include access controls, encryption, monitoring, secure development practices, vendor oversight, and incident response procedures.',
    'privacyPolicy.section11.p2':
      'No security measure is absolute, and no method of transmission or storage can be guaranteed as fully secure. Customers are responsible for maintaining the confidentiality of account credentials and for notifying us immediately of suspected unauthorized activity.',

    'privacyPolicy.section12.title': '12. Cookies and Similar Technologies',
    'privacyPolicy.section12.p1':
      'We may use cookies, pixels, local storage, and similar technologies to operate our website and applications, maintain security, measure performance, remember preferences, and understand service usage.',
    'privacyPolicy.section12.p2':
      'You may be able to control certain cookies through browser settings or consent tools where available. Disabling some technologies may affect functionality, performance, or availability of certain features.',

    'privacyPolicy.section13.title': '13. Your Rights',
    'privacyPolicy.section13.p1':
      'Subject to applicable law, you may have rights relating to your personal information, which may include the right to request access, correction, deletion, restriction, portability, or objection to certain processing activities.',
    'privacyPolicy.section13.p2':
      'These rights are not absolute and may be limited where processing is required for legal compliance, regulatory recordkeeping, fraud prevention, exercise or defense of legal claims, or other lawful purposes.',
    'privacyPolicy.section13.p3':
      'To exercise available rights, please contact us using the details provided below. We may request additional information to verify your identity before responding.',

    'privacyPolicy.section14.title': '14. Marketing Communications',
    'privacyPolicy.section14.p1':
      'Where permitted by law, we may send you service updates, product information, and other communications relating to our offerings. You may opt out of non-essential marketing communications using the unsubscribe method provided in the message or by contacting us directly.',
    'privacyPolicy.section14.p2':
      'We will still send communications that are necessary for account administration, security, legal notices, or service-related operations.',

    'privacyPolicy.section15.title': '15. Children’s Privacy',
    'privacyPolicy.section15.p1':
      'Our products and services are not directed to children, and we do not knowingly collect personal information from individuals who are not legally permitted to use our services under applicable law.',

    'privacyPolicy.section16.title': '16. Changes to This Policy',
    'privacyPolicy.section16.p1':
      'We may amend this Privacy Policy from time to time to reflect changes in law, regulation, technology, business operations, or service offerings. The updated version will be posted on this page with a revised effective date.',
    'privacyPolicy.section16.p2':
      'Your continued use of our services after changes become effective may constitute acknowledgment of the revised Policy to the extent permitted by law.',

    'privacyPolicy.contact.title': '17. Contact Us',
    'privacyPolicy.contact.p1':
      'Questions, requests, and formal privacy inquiries should be directed to:',
    'privacyPolicy.contact.office': 'Privacy Office / Data Protection Officer',
    'privacyPolicy.contact.address1': '[Insert Registered Address]',
    'privacyPolicy.contact.address2': '[Insert City, Country, Postal Code]',
    'privacyPolicy.contact.email': '[Insert Privacy Email]',
    'privacyPolicy.contact.phone': '[Insert Contact Number]',

    'privacyPolicy.notice.title': '18. Important Notice',
    'privacyPolicy.notice.body':
      'This document is provided as a general website privacy policy template for a financial institution offering fiat and digital asset services. It should be reviewed and finalized by qualified legal and compliance counsel before publication to ensure alignment with the laws, regulations, licensing status, disclosures, and operational model applicable to your business and jurisdictions.',
  },

  fr: {
    'privacyPolicy.pageTitle': 'Politique de confidentialité',
    'privacyPolicy.heroDescription':
      'Cette politique de confidentialité explique comment SKOK Bank collecte, utilise, divulgue, stocke et protège les informations personnelles dans le cadre de ses services bancaires, de paiement et d’actifs numériques. Nous nous engageons à traiter les données personnelles de manière responsable, légale et avec le niveau de diligence attendu d’un établissement financier opérant à la fois dans des environnements fiduciaires et fondés sur la blockchain.',
    'privacyPolicy.effectiveDate': 'Date d’effet',
    'privacyPolicy.lastUpdated': 'Dernière mise à jour',
    'privacyPolicy.appliesTo': "S'applique à",
    'privacyPolicy.appliesToValue': 'Monnaie fiduciaire, banque, paiements et actifs numériques',
    'privacyPolicy.onThisPage': 'Sur cette page',
    'privacyPolicy.contactUsNav': '17. Nous contacter',
    'privacyPolicy.importantNoticeNav': '18. Avis important',
    'privacyPolicy.legalNotice.title': 'Avis juridique important',
    'privacyPolicy.legalNotice.body':
      'Cette politique de confidentialité a pour objectif de présenter nos pratiques générales en matière de traitement des données. Elle doit être examinée et finalisée par un conseiller juridique et conformité qualifié avant publication afin de garantir son alignement avec les exigences réglementaires, de licence et opérationnelles applicables à votre modèle d’activité et aux juridictions dans lesquelles les services sont proposés.',

    'privacyPolicy.section1.title': '1. Portée',
    'privacyPolicy.section1.p1':
      'Cette politique de confidentialité s’applique aux informations personnelles collectées par le biais de notre site web, de nos applications mobiles et web, de nos canaux de support client, de nos processus d’intégration et d’ouverture de compte, de nos services transactionnels, de nos services d’actifs numériques et de tout autre produit ou service mis à disposition des particuliers, des entreprises et des clients institutionnels.',
    'privacyPolicy.section1.p2':
      'Cette politique s’applique que vous interagissiez avec nous en tant que visiteur, client potentiel, utilisateur autorisé, titulaire de compte, bénéficiaire effectif, représentant d’entreprise, fournisseur ou autre partie concernée.',

    'privacyPolicy.section2.title': '2. Informations que nous collectons',
    'privacyPolicy.section2.p1':
      'Nous pouvons collecter les catégories d’informations suivantes, dans la mesure permise ou requise par la loi applicable :',
    'privacyPolicy.section2.li1':
      'Informations d’identité : nom complet, date de naissance, nationalité, données d’identification délivrées par l’État, passeport, permis de conduire, carte nationale d’identité, numéro d’identification fiscale et documents de vérification similaires.',
    'privacyPolicy.section2.li2':
      'Informations de contact : adresse résidentielle, adresse postale, adresse e-mail, numéro de téléphone et autres coordonnées de communication.',
    'privacyPolicy.section2.li3':
      'Informations financières : coordonnées bancaires, données de carte de paiement, historique des transactions, origine des fonds, origine du patrimoine, informations sur les revenus, soldes de compte et données financières associées.',
    'privacyPolicy.section2.li4':
      'Informations professionnelles et d’entreprise : raison sociale, numéro d’enregistrement, adresse de l’entreprise, administrateurs, actionnaires, informations sur les bénéficiaires effectifs et documents de vérification d’entreprise.',
    'privacyPolicy.section2.li5':
      'Informations relatives aux actifs numériques : adresses de portefeuille, hash de transaction, historiques d’interaction blockchain, dépôts et retraits d’actifs numériques, documents liés à la conservation et autres activités associées aux services d’actifs numériques.',
    'privacyPolicy.section2.li6':
      'Informations techniques et d’utilisation : adresse IP, type de navigateur, système d’exploitation, identifiants d’appareil, journaux d’accès, cookies, données de session, interactions applicatives et analyses d’utilisation du site web.',
    'privacyPolicy.section2.li7':
      'Informations de conformité et de risque : résultats de filtrage des sanctions, statut de personne politiquement exposée, vérifications de presse négative, indicateurs de fraude, évaluations de risque et dossiers d’examen anti-blanchiment.',
    'privacyPolicy.section2.li8':
      'Communications : correspondances, messages du support client, enregistrements d’appels lorsque cela est autorisé, réclamations et autres enregistrements de vos interactions avec nous.',

    'privacyPolicy.section3.title': '3. Comment nous collectons les informations',
    'privacyPolicy.section3.p1':
      'Nous collectons les informations personnelles à partir de diverses sources, notamment :',
    'privacyPolicy.section3.li1':
      'directement auprès de vous lors de l’intégration, des demandes ou de l’utilisation des services ;',
    'privacyPolicy.section3.li2':
      'par le biais de vos transactions et de l’activité de votre compte ;',
    'privacyPolicy.section3.li3':
      'à partir de vos appareils et de votre navigateur lorsque vous utilisez notre site web ou nos applications ;',
    'privacyPolicy.section3.li4':
      'auprès de fournisseurs de vérification d’identité, de processeurs de paiement, de fournisseurs d’analyses blockchain, de services de prévention de la fraude et de prestataires de conformité ;',
    'privacyPolicy.section3.li5':
      'à partir de registres publics, de sources liées au crédit lorsque cela est légal, de listes de sanctions, de demandes des forces de l’ordre et d’autres sources légalement disponibles ;',
    'privacyPolicy.section3.li6':
      'auprès de représentants d’entreprise, d’introducteurs ou d’autres personnes agissant pour le compte d’un client ou d’une entité.',

    'privacyPolicy.section4.title': '4. Pourquoi nous utilisons les informations personnelles',
    'privacyPolicy.section4.p1':
      'Nous utilisons les informations personnelles à des fins commerciales, contractuelles, juridiques et de conformité légitimes, notamment pour :',
    'privacyPolicy.section4.li1':
      'fournir et maintenir des services bancaires, de paiements fiduciaires et d’actifs numériques ;',
    'privacyPolicy.section4.li2':
      'ouvrir, gérer et administrer des comptes ;',
    'privacyPolicy.section4.li3':
      'vérifier l’identité et effectuer des diligences raisonnables standard et renforcées sur les clients ;',
    'privacyPolicy.section4.li4':
      'traiter les dépôts, retraits, transferts, opérations, règlements et instructions associées ;',
    'privacyPolicy.section4.li5':
      'surveiller les transactions et l’activité des comptes pour détecter la fraude, les abus, l’exposition aux sanctions et les activités suspectes ;',
    'privacyPolicy.section4.li6':
      'respecter les obligations légales, réglementaires, fiscales, comptables et de reporting ;',
    'privacyPolicy.section4.li7':
      'détecter, enquêter et prévenir le blanchiment d’argent, le financement du terrorisme, la fraude, les cybermenaces et autres activités illicites ;',
    'privacyPolicy.section4.li8':
      'sécuriser nos systèmes, plateformes, clients et opérations ;',
    'privacyPolicy.section4.li9':
      'communiquer avec vous au sujet des services, notifications, demandes de support et mises à jour juridiques ;',
    'privacyPolicy.section4.li10':
      'améliorer nos produits, la prestation de services, les contrôles de risque et l’expérience client ;',
    'privacyPolicy.section4.li11':
      'faire respecter nos accords, politiques et droits légaux.',

    'privacyPolicy.section5.title': '5. Activités sensibles de conformité et de vérification',
    'privacyPolicy.section5.p1':
      'En tant que prestataire de services financiers opérant dans des environnements fiduciaires et d’actifs numériques, nous pouvons traiter des informations personnelles dans le cadre de procédures de connaissance du client, de lutte contre le blanchiment, de conformité aux sanctions, de prévention de la fraude, de surveillance des transactions et de gestion des risques de criminalité financière.',
    'privacyPolicy.section5.p2':
      'Cela peut inclure la vérification d’identité, l’authentification de documents, l’examen de l’origine des fonds, l’examen de l’origine du patrimoine, l’évaluation des activités suspectes, le filtrage des portefeuilles, les analyses blockchain et la surveillance continue des comptes. Lorsque cela est requis, nous pouvons conserver les dossiers de ces examens pendant les périodes imposées par la loi ou la réglementation.',

    'privacyPolicy.section6.title': '6. Divulgations relatives à la blockchain et aux actifs numériques',
    'privacyPolicy.section6.p1':
      'Certaines transactions sur actifs numériques peuvent être enregistrées sur des registres distribués publics ou autorisés. Les enregistrements blockchain peuvent être publics, immuables et difficiles, voire impossibles, à modifier ou supprimer.',
    'privacyPolicy.section6.p2':
      'Même lorsque les adresses de portefeuille n’identifient pas directement une personne, elles peuvent être associées à celle-ci par les dossiers d’intégration, les schémas de transaction, les analyses ou d’autres sources de données. En utilisant les services d’actifs numériques, vous reconnaissez que les données de transaction peuvent être visibles par les participants de la blockchain, les fournisseurs d’analyses et d’autres tiers disposant d’un accès aux réseaux ou outils concernés.',

    'privacyPolicy.section7.title': '7. Bases juridiques du traitement',
    'privacyPolicy.section7.p1':
      'Lorsque la loi applicable exige une base juridique pour le traitement, nous nous appuyons sur une ou plusieurs des bases suivantes :',
    'privacyPolicy.section7.li1':
      'l’exécution d’un contrat ou les démarches prises à votre demande avant de conclure un contrat ;',
    'privacyPolicy.section7.li2':
      'le respect des obligations légales et réglementaires ;',
    'privacyPolicy.section7.li3':
      'nos intérêts légitimes à exploiter, protéger et améliorer nos services ;',
    'privacyPolicy.section7.li4':
      'votre consentement, lorsque celui-ci est requis par la loi.',

    'privacyPolicy.section8.title': '8. Comment nous partageons les informations',
    'privacyPolicy.section8.p1':
      'Nous pouvons divulguer les informations personnelles à :',
    'privacyPolicy.section8.li1':
      'des sociétés de notre groupe et des entités affiliées ;',
    'privacyPolicy.section8.li2':
      'des partenaires bancaires, réseaux de paiement, fournisseurs de liquidité, fournisseurs de conservation et contreparties de règlement ;',
    'privacyPolicy.section8.li3':
      'des prestataires de vérification d’identité, de prévention de la fraude, de cybersécurité, d’analyses blockchain et de conformité ;',
    'privacyPolicy.section8.li4':
      'des conseillers professionnels, auditeurs, assureurs et avocats ;',
    'privacyPolicy.section8.li5':
      'des régulateurs, autorités de surveillance, tribunaux, forces de l’ordre, autorités fiscales et organismes gouvernementaux lorsque la loi l’exige ou le permet ;',
    'privacyPolicy.section8.li6':
      'des acquéreurs potentiels, investisseurs ou successeurs dans le cadre d’une fusion, acquisition, restructuration, financement ou vente d’actifs, sous réserve d’obligations appropriées de confidentialité.',
    'privacyPolicy.section8.p2':
      'Nous ne vendons pas les informations personnelles au sens commercial ordinaire de la vente de données clients à des tiers indépendants à des fins de marketing propre.',

    'privacyPolicy.section9.title': '9. Transferts internationaux',
    'privacyPolicy.section9.p1':
      'Vos informations personnelles peuvent être traitées dans des juridictions situées hors de votre pays de résidence, y compris des juridictions n’offrant pas le même niveau de protection des données que votre juridiction d’origine.',
    'privacyPolicy.section9.p2':
      'Lorsque cela est requis, nous mettons en place des garanties appropriées pour les transferts transfrontaliers, notamment des protections contractuelles, des contrôles internes et d’autres mécanismes de transfert licites.',

    'privacyPolicy.section10.title': '10. Conservation des données',
    'privacyPolicy.section10.p1':
      'Nous conservons les informations personnelles aussi longtemps que nécessaire pour atteindre les finalités pour lesquelles elles ont été collectées, notamment pour fournir des services, tenir des registres commerciaux et financiers exacts, résoudre les litiges, faire respecter les accords et se conformer aux obligations légales, fiscales, comptables, d’audit et réglementaires.',
    'privacyPolicy.section10.p2':
      'Les périodes de conservation peuvent être prolongées lorsque cela est nécessaire pour des enquêtes de conformité, des obligations de préservation dans le cadre de litiges, des demandes réglementaires, la surveillance de la fraude ou des besoins continus de gestion des risques.',

    'privacyPolicy.section11.title': '11. Sécurité',
    'privacyPolicy.section11.p1':
      'Nous maintenons des mesures de protection administratives, techniques et physiques conçues pour protéger les informations personnelles contre l’accès non autorisé, la destruction, la perte, l’altération, l’utilisation abusive ou la divulgation. Ces mesures peuvent inclure des contrôles d’accès, le chiffrement, la surveillance, des pratiques de développement sécurisé, la supervision des fournisseurs et des procédures de réponse aux incidents.',
    'privacyPolicy.section11.p2':
      'Aucune mesure de sécurité n’est absolue et aucune méthode de transmission ou de stockage ne peut être garantie comme totalement sécurisée. Les clients sont responsables du maintien de la confidentialité de leurs identifiants de compte et doivent nous signaler immédiatement toute activité non autorisée suspectée.',

    'privacyPolicy.section12.title': '12. Cookies et technologies similaires',
    'privacyPolicy.section12.p1':
      'Nous pouvons utiliser des cookies, pixels, stockage local et technologies similaires pour exploiter notre site web et nos applications, maintenir la sécurité, mesurer les performances, mémoriser les préférences et comprendre l’usage du service.',
    'privacyPolicy.section12.p2':
      'Vous pouvez être en mesure de contrôler certains cookies via les paramètres du navigateur ou des outils de consentement lorsque ceux-ci sont disponibles. La désactivation de certaines technologies peut affecter la fonctionnalité, les performances ou la disponibilité de certaines fonctionnalités.',

    'privacyPolicy.section13.title': '13. Vos droits',
    'privacyPolicy.section13.p1':
      'Sous réserve de la loi applicable, vous pouvez disposer de droits relatifs à vos informations personnelles, notamment le droit de demander l’accès, la rectification, la suppression, la limitation, la portabilité ou de vous opposer à certaines activités de traitement.',
    'privacyPolicy.section13.p2':
      'Ces droits ne sont pas absolus et peuvent être limités lorsque le traitement est nécessaire au respect d’obligations légales, à la tenue de registres réglementaires, à la prévention de la fraude, à l’exercice ou à la défense de droits en justice, ou à d’autres fins légitimes.',
    'privacyPolicy.section13.p3':
      'Pour exercer les droits disponibles, veuillez nous contacter en utilisant les coordonnées ci-dessous. Nous pouvons demander des informations supplémentaires pour vérifier votre identité avant de répondre.',

    'privacyPolicy.section14.title': '14. Communications marketing',
    'privacyPolicy.section14.p1':
      'Lorsque la loi le permet, nous pouvons vous envoyer des mises à jour de service, des informations produit et d’autres communications relatives à nos offres. Vous pouvez vous désinscrire des communications marketing non essentielles en utilisant la méthode de désabonnement fournie dans le message ou en nous contactant directement.',
    'privacyPolicy.section14.p2':
      'Nous continuerons toutefois à envoyer les communications nécessaires à l’administration du compte, à la sécurité, aux notifications légales ou aux opérations liées au service.',

    'privacyPolicy.section15.title': '15. Vie privée des enfants',
    'privacyPolicy.section15.p1':
      'Nos produits et services ne sont pas destinés aux enfants, et nous ne collectons pas sciemment d’informations personnelles auprès de personnes qui ne sont pas légalement autorisées à utiliser nos services en vertu de la loi applicable.',

    'privacyPolicy.section16.title': '16. Modifications de cette politique',
    'privacyPolicy.section16.p1':
      'Nous pouvons modifier cette politique de confidentialité de temps à autre pour refléter les changements de loi, de réglementation, de technologie, d’opérations commerciales ou d’offres de services. La version mise à jour sera publiée sur cette page avec une date d’effet révisée.',
    'privacyPolicy.section16.p2':
      'Votre utilisation continue de nos services après l’entrée en vigueur des modifications peut constituer une reconnaissance de la politique révisée dans la mesure permise par la loi.',

    'privacyPolicy.contact.title': '17. Nous contacter',
    'privacyPolicy.contact.p1':
      'Les questions, demandes et requêtes formelles relatives à la vie privée doivent être adressées à :',
    'privacyPolicy.contact.office': 'Service confidentialité / Délégué à la protection des données',
    'privacyPolicy.contact.address1': '[Insérer l’adresse enregistrée]',
    'privacyPolicy.contact.address2': '[Insérer la ville, le pays, le code postal]',
    'privacyPolicy.contact.email': '[Insérer l’e-mail confidentialité]',
    'privacyPolicy.contact.phone': '[Insérer le numéro de contact]',

    'privacyPolicy.notice.title': '18. Avis important',
    'privacyPolicy.notice.body':
      'Ce document est fourni comme modèle général de politique de confidentialité de site web pour un établissement financier proposant des services fiduciaires et d’actifs numériques. Il doit être examiné et finalisé par un conseiller juridique et conformité qualifié avant publication afin de garantir son alignement avec les lois, réglementations, statut de licence, obligations d’information et modèle opérationnel applicables à votre entreprise et à vos juridictions.',
  },

  de: {
    'privacyPolicy.pageTitle': 'Datenschutzrichtlinie',
    'privacyPolicy.heroDescription':
      'Diese Datenschutzrichtlinie erläutert, wie SKOK Bank personenbezogene Daten im Zusammenhang mit unseren Bank-, Zahlungs- und digitalen Vermögensdienstleistungen erhebt, verwendet, offenlegt, speichert und schützt. Wir verpflichten uns, personenbezogene Daten verantwortungsvoll, rechtmäßig und mit der Sorgfalt zu behandeln, die von einem Finanzinstitut erwartet wird, das sowohl in Fiat- als auch in blockchainbasierten Umgebungen tätig ist.',
    'privacyPolicy.effectiveDate': 'Inkrafttretensdatum',
    'privacyPolicy.lastUpdated': 'Zuletzt aktualisiert',
    'privacyPolicy.appliesTo': 'Gilt für',
    'privacyPolicy.appliesToValue': 'Fiat, Bankwesen, Zahlungen und digitale Vermögenswerte',
    'privacyPolicy.onThisPage': 'Auf dieser Seite',
    'privacyPolicy.contactUsNav': '17. Kontakt',
    'privacyPolicy.importantNoticeNav': '18. Wichtiger Hinweis',
    'privacyPolicy.legalNotice.title': 'Wichtiger rechtlicher Hinweis',
    'privacyPolicy.legalNotice.body':
      'Diese Datenschutzrichtlinie soll unsere allgemeinen Datenverarbeitungspraktiken erläutern. Sie sollte vor der Veröffentlichung von qualifizierten Rechts- und Compliance-Beratern geprüft und finalisiert werden, um sicherzustellen, dass sie mit den regulatorischen, lizenzrechtlichen und betrieblichen Anforderungen Ihres Geschäftsmodells und der Rechtsordnungen, in denen Dienstleistungen angeboten werden, übereinstimmt.',

    'privacyPolicy.section1.title': '1. Geltungsbereich',
    'privacyPolicy.section1.p1':
      'Diese Datenschutzrichtlinie gilt für personenbezogene Daten, die über unsere Website, mobile und webbasierte Anwendungen, Kundensupportkanäle, Onboarding- und Kontoeröffnungsprozesse, Transaktionsdienste, Dienstleistungen für digitale Vermögenswerte sowie alle anderen Produkte oder Dienstleistungen erhoben werden, die wir Privatpersonen, Unternehmen und institutionellen Kunden zur Verfügung stellen.',
    'privacyPolicy.section1.p2':
      'Diese Richtlinie gilt unabhängig davon, ob Sie mit uns als Besucher, potenzieller Kunde, autorisierter Nutzer, Kontoinhaber, wirtschaftlich Berechtigter, Unternehmensvertreter, Lieferant oder sonstige relevante Partei interagieren.',

    'privacyPolicy.section2.title': '2. Welche Informationen wir erfassen',
    'privacyPolicy.section2.p1':
      'Wir können die folgenden Kategorien von Informationen erfassen, soweit dies nach geltendem Recht zulässig oder erforderlich ist:',
    'privacyPolicy.section2.li1':
      'Identitätsinformationen: vollständiger Name, Geburtsdatum, Staatsangehörigkeit, staatlich ausgestellte Ausweisdaten, Reisepass, Führerschein, Personalausweis, Steueridentifikationsnummer und ähnliche Verifizierungsunterlagen.',
    'privacyPolicy.section2.li2':
      'Kontaktinformationen: Wohnanschrift, Postanschrift, E-Mail-Adresse, Telefonnummer und andere Kommunikationsdaten.',
    'privacyPolicy.section2.li3':
      'Finanzinformationen: Bankverbindungsdaten, Zahlungskartendaten, Transaktionsverlauf, Herkunft der Mittel, Herkunft des Vermögens, Einkommensinformationen, Kontostände und zugehörige Finanzprofildaten.',
    'privacyPolicy.section2.li4':
      'Geschäfts- und Unternehmensinformationen: Firmenname, Registrierungsnummer, Geschäftsanschrift, Geschäftsführer, Anteilseigner, Angaben zum wirtschaftlichen Eigentum und Unternehmensverifizierungsunterlagen.',
    'privacyPolicy.section2.li5':
      'Informationen zu digitalen Vermögenswerten: Wallet-Adressen, Transaktions-Hashes, Blockchain-Interaktionsdaten, Ein- und Auszahlungen digitaler Vermögenswerte, verwahrungsbezogene Unterlagen und andere Aktivitäten im Zusammenhang mit Dienstleistungen für digitale Vermögenswerte.',
    'privacyPolicy.section2.li6':
      'Technische und Nutzungsinformationen: IP-Adresse, Browsertyp, Betriebssystem, Gerätekennungen, Zugriffsprotokolle, Cookies, Sitzungsdaten, App-Interaktionen und Website-Nutzungsanalysen.',
    'privacyPolicy.section2.li7':
      'Compliance- und Risikoinformationen: Ergebnisse von Sanktionsprüfungen, Status als politisch exponierte Person, Negativmedienprüfungen, Betrugsindikatoren, Risikobewertungen und Unterlagen zu Geldwäscheprüfungen.',
    'privacyPolicy.section2.li8':
      'Kommunikation: Korrespondenz, Kundensupport-Nachrichten, Anrufaufzeichnungen, soweit zulässig, Beschwerden und andere Aufzeichnungen über Interaktionen mit uns.',

    'privacyPolicy.section3.title': '3. Wie wir Informationen erfassen',
    'privacyPolicy.section3.p1':
      'Wir erfassen personenbezogene Daten aus verschiedenen Quellen, unter anderem:',
    'privacyPolicy.section3.li1':
      'direkt von Ihnen während des Onboardings, bei Anträgen oder bei der Nutzung von Dienstleistungen;',
    'privacyPolicy.section3.li2':
      'durch Ihre Transaktionen und Kontoaktivitäten;',
    'privacyPolicy.section3.li3':
      'von Ihren Geräten und Ihrem Browser, wenn Sie unsere Website oder Apps nutzen;',
    'privacyPolicy.section3.li4':
      'von Identitätsprüfungsanbietern, Zahlungsabwicklern, Blockchain-Analyseanbietern, Betrugspräventionsdiensten und Compliance-Dienstleistern;',
    'privacyPolicy.section3.li5':
      'aus öffentlichen Registern, kreditbezogenen Quellen, soweit rechtmäßig, Sanktionslisten, Anfragen von Strafverfolgungsbehörden und anderen rechtmäßig verfügbaren Quellen;',
    'privacyPolicy.section3.li6':
      'von Unternehmensvertretern, Vermittlern oder anderen Personen, die im Namen eines Kunden oder einer juristischen Person handeln.',

    'privacyPolicy.section4.title': '4. Warum wir personenbezogene Daten verwenden',
    'privacyPolicy.section4.p1':
      'Wir verwenden personenbezogene Daten für legitime geschäftliche, vertragliche, rechtliche und Compliance-Zwecke, insbesondere um:',
    'privacyPolicy.section4.li1':
      'Bank-, Fiat-Zahlungs- und Dienstleistungen für digitale Vermögenswerte bereitzustellen und aufrechtzuerhalten;',
    'privacyPolicy.section4.li2':
      'Konten zu eröffnen, zu verwalten und zu administrieren;',
    'privacyPolicy.section4.li3':
      'die Identität zu überprüfen und Kundenprüfungen sowie verstärkte Sorgfaltspflichten durchzuführen;',
    'privacyPolicy.section4.li4':
      'Einzahlungen, Auszahlungen, Überweisungen, Handelsgeschäfte, Abwicklungen und damit verbundene Weisungen zu verarbeiten;',
    'privacyPolicy.section4.li5':
      'Transaktionen und Kontoaktivitäten auf Betrug, Missbrauch, Sanktionsrisiken und verdächtige Aktivitäten zu überwachen;',
    'privacyPolicy.section4.li6':
      'gesetzliche, regulatorische, steuerliche, buchhalterische und Berichtspflichten zu erfüllen;',
    'privacyPolicy.section4.li7':
      'Geldwäsche, Terrorismusfinanzierung, Betrug, Cyberbedrohungen und andere rechtswidrige Handlungen zu erkennen, zu untersuchen und zu verhindern;',
    'privacyPolicy.section4.li8':
      'unsere Systeme, Plattformen, Kunden und Abläufe zu sichern;',
    'privacyPolicy.section4.li9':
      'mit Ihnen in Bezug auf Dienstleistungen, Hinweise, Supportanfragen und rechtliche Aktualisierungen zu kommunizieren;',
    'privacyPolicy.section4.li10':
      'unsere Produkte, die Servicebereitstellung, Risikokontrollen und das Kundenerlebnis zu verbessern;',
    'privacyPolicy.section4.li11':
      'unsere Vereinbarungen, Richtlinien und gesetzlichen Rechte durchzusetzen.',

    'privacyPolicy.section5.title': '5. Sensible Compliance- und Verifizierungsaktivitäten',
    'privacyPolicy.section5.p1':
      'Als Anbieter von Finanzdienstleistungen in Fiat- und digitalen Vermögensumgebungen können wir personenbezogene Daten im Rahmen von Know-your-Customer-, Geldwäschebekämpfungs-, Sanktions-Compliance-, Betrugspräventions-, Transaktionsüberwachungs- und Finanzkriminalitäts-Risikomanagementverfahren verarbeiten.',
    'privacyPolicy.section5.p2':
      'Dies kann die Identitätsprüfung, Dokumentenauthentifizierung, Prüfung der Mittelherkunft, Prüfung der Vermögensherkunft, Bewertung verdächtiger Aktivitäten, Wallet-Screening, Blockchain-Analysen und die laufende Kontoüberwachung umfassen. Soweit erforderlich, können wir Aufzeichnungen solcher Prüfungen für die gesetzlich oder regulatorisch vorgeschriebenen Zeiträume aufbewahren.',

    'privacyPolicy.section6.title': '6. Hinweise zu Blockchain und digitalen Vermögenswerten',
    'privacyPolicy.section6.p1':
      'Bestimmte Transaktionen mit digitalen Vermögenswerten können auf öffentlichen oder zugangsbeschränkten Distributed-Ledger-Systemen aufgezeichnet werden. Blockchain-Aufzeichnungen können öffentlich, unveränderlich und nur schwer oder gar nicht änder- oder löschbar sein.',
    'privacyPolicy.section6.p2':
      'Auch wenn Wallet-Adressen eine Person nicht unmittelbar identifizieren, können sie durch Onboarding-Unterlagen, Transaktionsmuster, Analysen oder andere Datenquellen mit einer Person in Verbindung gebracht werden. Durch die Nutzung digitaler Vermögensdienstleistungen erkennen Sie an, dass Transaktionsdaten für Blockchain-Teilnehmer, Analyseanbieter und andere Dritte mit Zugang zu relevanten Netzwerken oder Tools sichtbar sein können.',

    'privacyPolicy.section7.title': '7. Rechtsgrundlagen der Verarbeitung',
    'privacyPolicy.section7.p1':
      'Soweit das anwendbare Recht eine Rechtsgrundlage für die Verarbeitung verlangt, stützen wir uns auf eine oder mehrere der folgenden Grundlagen:',
    'privacyPolicy.section7.li1':
      'Erfüllung eines Vertrags oder Durchführung vorvertraglicher Maßnahmen auf Ihre Anfrage;',
    'privacyPolicy.section7.li2':
      'Einhaltung gesetzlicher und regulatorischer Verpflichtungen;',
    'privacyPolicy.section7.li3':
      'unsere berechtigten Interessen am Betrieb, Schutz und der Verbesserung unserer Dienstleistungen;',
    'privacyPolicy.section7.li4':
      'Ihre Einwilligung, soweit diese gesetzlich erforderlich ist.',

    'privacyPolicy.section8.title': '8. Wie wir Informationen weitergeben',
    'privacyPolicy.section8.p1':
      'Wir können personenbezogene Daten offenlegen an:',
    'privacyPolicy.section8.li1':
      'Unternehmen innerhalb unserer Unternehmensgruppe und verbundene Gesellschaften;',
    'privacyPolicy.section8.li2':
      'Bankpartner, Zahlungsnetzwerke, Liquiditätsanbieter, Verwahrstellen und Abwicklungsgegenparteien;',
    'privacyPolicy.section8.li3':
      'Dienstleister für Identitätsprüfung, Betrugsprävention, Cybersicherheit, Blockchain-Analysen und Compliance;',
    'privacyPolicy.section8.li4':
      'Berater, Wirtschaftsprüfer, Versicherer und Rechtsbeistände;',
    'privacyPolicy.section8.li5':
      'Regulierungsbehörden, Aufsichtsbehörden, Gerichte, Strafverfolgungsbehörden, Steuerbehörden und staatliche Stellen, soweit gesetzlich vorgeschrieben oder zulässig;',
    'privacyPolicy.section8.li6':
      'potenzielle Erwerber, Investoren oder Rechtsnachfolger im Zusammenhang mit einer Fusion, Übernahme, Umstrukturierung, Finanzierung oder einem Verkauf von Vermögenswerten, vorbehaltlich angemessener Vertraulichkeitsverpflichtungen.',
    'privacyPolicy.section8.p2':
      'Wir verkaufen personenbezogene Daten nicht im gewöhnlichen kommerziellen Sinne des Verkaufs von Kundendaten an unabhängige Dritte zu eigenen Marketingzwecken.',

    'privacyPolicy.section9.title': '9. Internationale Übermittlungen',
    'privacyPolicy.section9.p1':
      'Ihre personenbezogenen Daten können in Rechtsordnungen außerhalb Ihres Wohnsitzlandes verarbeitet werden, einschließlich Rechtsordnungen, die möglicherweise nicht das gleiche Datenschutzniveau wie Ihre Heimatjurisdiktion bieten.',
    'privacyPolicy.section9.p2':
      'Soweit erforderlich, setzen wir angemessene Schutzmaßnahmen für grenzüberschreitende Übermittlungen ein, darunter vertragliche Schutzvorkehrungen, interne Kontrollen und andere rechtmäßige Übermittlungsmechanismen.',

    'privacyPolicy.section10.title': '10. Datenspeicherung',
    'privacyPolicy.section10.p1':
      'Wir bewahren personenbezogene Daten so lange auf, wie es erforderlich ist, um die Zwecke zu erfüllen, für die sie erhoben wurden, einschließlich der Erbringung von Dienstleistungen, der Führung korrekter Geschäfts- und Finanzunterlagen, der Beilegung von Streitigkeiten, der Durchsetzung von Vereinbarungen und der Einhaltung gesetzlicher, steuerlicher, buchhalterischer, prüfungsbezogener und regulatorischer Pflichten.',
    'privacyPolicy.section10.p2':
      'Aufbewahrungsfristen können verlängert werden, wenn dies für Compliance-Untersuchungen, Prozesssicherungen, behördliche Anfragen, Betrugsüberwachung oder fortlaufende Risikomanagementzwecke erforderlich ist.',

    'privacyPolicy.section11.title': '11. Sicherheit',
    'privacyPolicy.section11.p1':
      'Wir unterhalten administrative, technische und physische Schutzmaßnahmen, die darauf ausgelegt sind, personenbezogene Daten vor unbefugtem Zugriff, Zerstörung, Verlust, Veränderung, Missbrauch oder Offenlegung zu schützen. Diese Maßnahmen können Zugriffskontrollen, Verschlüsselung, Überwachung, sichere Entwicklungspraktiken, Lieferantenaufsicht und Verfahren zur Reaktion auf Vorfälle umfassen.',
    'privacyPolicy.section11.p2':
      'Keine Sicherheitsmaßnahme ist absolut, und keine Methode der Übertragung oder Speicherung kann als vollständig sicher garantiert werden. Kunden sind dafür verantwortlich, die Vertraulichkeit ihrer Kontozugangsdaten zu wahren und uns unverzüglich über vermutete unbefugte Aktivitäten zu informieren.',

    'privacyPolicy.section12.title': '12. Cookies und ähnliche Technologien',
    'privacyPolicy.section12.p1':
      'Wir können Cookies, Pixel, lokalen Speicher und ähnliche Technologien verwenden, um unsere Website und Anwendungen zu betreiben, die Sicherheit aufrechtzuerhalten, die Leistung zu messen, Präferenzen zu speichern und die Nutzung unserer Dienste zu verstehen.',
    'privacyPolicy.section12.p2':
      'Sie können möglicherweise bestimmte Cookies über Browsereinstellungen oder Einwilligungstools steuern, sofern diese verfügbar sind. Das Deaktivieren bestimmter Technologien kann die Funktionalität, Leistung oder Verfügbarkeit bestimmter Funktionen beeinträchtigen.',

    'privacyPolicy.section13.title': '13. Ihre Rechte',
    'privacyPolicy.section13.p1':
      'Vorbehaltlich des anwendbaren Rechts stehen Ihnen möglicherweise Rechte in Bezug auf Ihre personenbezogenen Daten zu, darunter das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Übertragbarkeit oder Widerspruch gegen bestimmte Verarbeitungstätigkeiten.',
    'privacyPolicy.section13.p2':
      'Diese Rechte sind nicht absolut und können eingeschränkt sein, wenn die Verarbeitung zur Erfüllung gesetzlicher Verpflichtungen, zur regulatorischen Aufzeichnung, zur Betrugsprävention, zur Geltendmachung oder Verteidigung von Rechtsansprüchen oder zu anderen rechtmäßigen Zwecken erforderlich ist.',
    'privacyPolicy.section13.p3':
      'Um verfügbare Rechte auszuüben, kontaktieren Sie uns bitte unter den unten angegebenen Kontaktdaten. Wir können zusätzliche Informationen zur Überprüfung Ihrer Identität anfordern, bevor wir antworten.',

    'privacyPolicy.section14.title': '14. Marketingkommunikation',
    'privacyPolicy.section14.p1':
      'Soweit gesetzlich zulässig, können wir Ihnen Service-Updates, Produktinformationen und andere Mitteilungen zu unseren Angeboten senden. Sie können nicht wesentliche Marketingmitteilungen über die im Nachrichtentext angegebene Abmeldemethode oder durch direkte Kontaktaufnahme mit uns abbestellen.',
    'privacyPolicy.section14.p2':
      'Wir senden weiterhin Mitteilungen, die für die Kontoverwaltung, Sicherheit, rechtliche Hinweise oder servicebezogene Abläufe erforderlich sind.',

    'privacyPolicy.section15.title': '15. Datenschutz von Kindern',
    'privacyPolicy.section15.p1':
      'Unsere Produkte und Dienstleistungen richten sich nicht an Kinder, und wir erfassen wissentlich keine personenbezogenen Daten von Personen, die nach geltendem Recht unsere Dienste rechtlich nicht nutzen dürfen.',

    'privacyPolicy.section16.title': '16. Änderungen dieser Richtlinie',
    'privacyPolicy.section16.p1':
      'Wir können diese Datenschutzrichtlinie von Zeit zu Zeit ändern, um Änderungen in Recht, Regulierung, Technologie, Geschäftsabläufen oder Dienstleistungsangeboten Rechnung zu tragen. Die aktualisierte Version wird auf dieser Seite mit einem überarbeiteten Inkrafttretensdatum veröffentlicht.',
    'privacyPolicy.section16.p2':
      'Ihre fortgesetzte Nutzung unserer Dienste nach Inkrafttreten von Änderungen kann, soweit gesetzlich zulässig, als Anerkennung der überarbeiteten Richtlinie gelten.',

    'privacyPolicy.contact.title': '17. Kontakt',
    'privacyPolicy.contact.p1':
      'Fragen, Anträge und formelle Datenschutzanfragen sind zu richten an:',
    'privacyPolicy.contact.office': 'Datenschutzstelle / Datenschutzbeauftragter',
    'privacyPolicy.contact.address1': '[Eingetragene Adresse einfügen]',
    'privacyPolicy.contact.address2': '[Stadt, Land, Postleitzahl einfügen]',
    'privacyPolicy.contact.email': '[Datenschutz-E-Mail einfügen]',
    'privacyPolicy.contact.phone': '[Kontakttelefonnummer einfügen]',

    'privacyPolicy.notice.title': '18. Wichtiger Hinweis',
    'privacyPolicy.notice.body':
      'Dieses Dokument wird als allgemeine Vorlage für eine Website-Datenschutzrichtlinie für ein Finanzinstitut bereitgestellt, das Fiat- und digitale Vermögensdienstleistungen anbietet. Es sollte vor der Veröffentlichung von qualifizierten Rechts- und Compliance-Beratern geprüft und finalisiert werden, um die Übereinstimmung mit den für Ihr Unternehmen und Ihre Rechtsordnungen geltenden Gesetzen, Vorschriften, Lizenzstatus, Offenlegungspflichten und Betriebsmodellen sicherzustellen.',
  },

  es: {
    'privacyPolicy.pageTitle': 'Política de privacidad',
    'privacyPolicy.heroDescription':
      'Esta Política de privacidad explica cómo SKOK Bank recopila, utiliza, divulga, almacena y protege la información personal en relación con nuestros servicios bancarios, de pagos y de activos digitales. Nos comprometemos a tratar los datos personales de forma responsable, legal y con el nivel de cuidado esperado de una institución financiera que opera tanto en entornos fiduciarios como basados en blockchain.',
    'privacyPolicy.effectiveDate': 'Fecha de entrada en vigor',
    'privacyPolicy.lastUpdated': 'Última actualización',
    'privacyPolicy.appliesTo': 'Se aplica a',
    'privacyPolicy.appliesToValue': 'Moneda fiduciaria, banca, pagos y activos digitales',
    'privacyPolicy.onThisPage': 'En esta página',
    'privacyPolicy.contactUsNav': '17. Contáctenos',
    'privacyPolicy.importantNoticeNav': '18. Aviso importante',
    'privacyPolicy.legalNotice.title': 'Aviso legal importante',
    'privacyPolicy.legalNotice.body':
      'Esta Política de privacidad tiene como objetivo comunicar nuestras prácticas generales de tratamiento de datos. Debe ser revisada y finalizada por asesores jurídicos y de cumplimiento cualificados antes de su publicación para garantizar su alineación con los requisitos regulatorios, de licencias y operativos aplicables a su modelo de negocio y a las jurisdicciones en las que se ofrecen los servicios.',

    'privacyPolicy.section1.title': '1. Alcance',
    'privacyPolicy.section1.p1':
      'Esta Política de privacidad se aplica a la información personal recopilada a través de nuestro sitio web, aplicaciones móviles y web, canales de atención al cliente, procesos de incorporación y apertura de cuentas, servicios transaccionales, servicios de activos digitales y cualquier otro producto o servicio que pongamos a disposición de particulares, empresas y clientes institucionales.',
    'privacyPolicy.section1.p2':
      'Esta Política se aplica tanto si interactúa con nosotros como visitante, cliente potencial, usuario autorizado, titular de cuenta, beneficiario efectivo, representante corporativo, proveedor u otra parte relevante.',

    'privacyPolicy.section2.title': '2. Información que recopilamos',
    'privacyPolicy.section2.p1':
      'Podemos recopilar las siguientes categorías de información, en la medida en que lo permita o exija la legislación aplicable:',
    'privacyPolicy.section2.li1':
      'Información de identidad: nombre completo, fecha de nacimiento, nacionalidad, datos de identificación emitidos por el gobierno, pasaporte, permiso de conducir, documento nacional de identidad, número de identificación fiscal y registros de verificación similares.',
    'privacyPolicy.section2.li2':
      'Información de contacto: dirección residencial, dirección postal, dirección de correo electrónico, número de teléfono y otros datos de comunicación.',
    'privacyPolicy.section2.li3':
      'Información financiera: datos de cuentas bancarias, datos de tarjetas de pago, historial de transacciones, origen de los fondos, origen del patrimonio, información sobre ingresos, saldos de cuenta y datos de perfil financiero relacionados.',
    'privacyPolicy.section2.li4':
      'Información empresarial y corporativa: nombre de la empresa, número de registro, dirección comercial, directores, accionistas, información sobre titularidad real y registros de verificación corporativa.',
    'privacyPolicy.section2.li5':
      'Información de activos digitales: direcciones de billetera, hashes de transacción, registros de interacción con blockchain, depósitos y retiros de activos digitales, registros relacionados con custodia y otras actividades asociadas a los servicios de activos digitales.',
    'privacyPolicy.section2.li6':
      'Información técnica y de uso: dirección IP, tipo de navegador, sistema operativo, identificadores de dispositivo, registros de acceso, cookies, datos de sesión, interacciones con la aplicación y análisis de uso del sitio web.',
    'privacyPolicy.section2.li7':
      'Información de cumplimiento y riesgo: resultados de controles de sanciones, estado de persona políticamente expuesta, revisiones de medios adversos, indicadores de fraude, evaluaciones de riesgo y registros de revisión contra el lavado de dinero.',
    'privacyPolicy.section2.li8':
      'Comunicaciones: correspondencia, mensajes de atención al cliente, grabaciones de llamadas cuando estén permitidas, reclamaciones y otros registros de interacciones con nosotros.',

    'privacyPolicy.section3.title': '3. Cómo recopilamos la información',
    'privacyPolicy.section3.p1':
      'Recopilamos información personal de diversas fuentes, entre ellas:',
    'privacyPolicy.section3.li1':
      'directamente de usted durante la incorporación, las solicitudes o el uso del servicio;',
    'privacyPolicy.section3.li2':
      'a través de sus transacciones y actividad de cuenta;',
    'privacyPolicy.section3.li3':
      'de sus dispositivos y navegador cuando utiliza nuestro sitio web o aplicaciones;',
    'privacyPolicy.section3.li4':
      'de proveedores de verificación de identidad, procesadores de pagos, proveedores de análisis blockchain, servicios de prevención del fraude y proveedores de cumplimiento;',
    'privacyPolicy.section3.li5':
      'de registros públicos, fuentes relacionadas con crédito cuando sea legal, listas de sanciones, solicitudes de las fuerzas del orden y otras fuentes legalmente disponibles;',
    'privacyPolicy.section3.li6':
      'de representantes corporativos, introductores u otras personas que actúen en nombre de un cliente o entidad.',

    'privacyPolicy.section4.title': '4. Por qué usamos la información personal',
    'privacyPolicy.section4.p1':
      'Utilizamos la información personal con fines comerciales, contractuales, legales y de cumplimiento legítimos, entre ellos para:',
    'privacyPolicy.section4.li1':
      'prestar y mantener servicios bancarios, de pagos fiduciarios y de activos digitales;',
    'privacyPolicy.section4.li2':
      'abrir, gestionar y administrar cuentas;',
    'privacyPolicy.section4.li3':
      'verificar la identidad y realizar diligencia debida del cliente y diligencia reforzada;',
    'privacyPolicy.section4.li4':
      'procesar depósitos, retiros, transferencias, operaciones, liquidaciones e instrucciones relacionadas;',
    'privacyPolicy.section4.li5':
      'supervisar transacciones y actividad de cuentas para detectar fraude, abuso, exposición a sanciones y actividad sospechosa;',
    'privacyPolicy.section4.li6':
      'cumplir obligaciones legales, regulatorias, fiscales, contables y de información;',
    'privacyPolicy.section4.li7':
      'detectar, investigar y prevenir el blanqueo de capitales, la financiación del terrorismo, el fraude, las ciberamenazas y otras conductas ilícitas;',
    'privacyPolicy.section4.li8':
      'proteger nuestros sistemas, plataformas, clientes y operaciones;',
    'privacyPolicy.section4.li9':
      'comunicarnos con usted sobre servicios, avisos, solicitudes de soporte y actualizaciones legales;',
    'privacyPolicy.section4.li10':
      'mejorar nuestros productos, la prestación del servicio, los controles de riesgo y la experiencia del cliente;',
    'privacyPolicy.section4.li11':
      'hacer cumplir nuestros acuerdos, políticas y derechos legales.',

    'privacyPolicy.section5.title': '5. Actividades sensibles de cumplimiento y verificación',
    'privacyPolicy.section5.p1':
      'Como proveedor de servicios financieros que opera en entornos fiduciarios y de activos digitales, podemos tratar información personal como parte de procedimientos de conocimiento del cliente, lucha contra el blanqueo de capitales, cumplimiento de sanciones, prevención del fraude, supervisión de transacciones y gestión del riesgo de delitos financieros.',
    'privacyPolicy.section5.p2':
      'Esto puede incluir verificación de identidad, autenticación de documentos, revisión del origen de los fondos, revisión del origen del patrimonio, evaluación de actividad sospechosa, análisis de billeteras, análisis blockchain y supervisión continua de cuentas. Cuando sea necesario, podremos conservar registros de dichas revisiones durante los períodos exigidos por la ley o la normativa.',

    'privacyPolicy.section6.title': '6. Divulgaciones sobre blockchain y activos digitales',
    'privacyPolicy.section6.p1':
      'Ciertas transacciones de activos digitales pueden registrarse en libros distribuidos públicos o autorizados. Los registros blockchain pueden ser públicos, inmutables y difíciles o imposibles de modificar o eliminar.',
    'privacyPolicy.section6.p2':
      'Incluso cuando las direcciones de billetera no identifiquen directamente a una persona, pueden asociarse a ella mediante registros de incorporación, patrones de transacción, análisis u otras fuentes de datos. Al utilizar servicios de activos digitales, usted reconoce que los datos de transacción pueden ser visibles para participantes de la blockchain, proveedores de análisis y otros terceros con acceso a las redes o herramientas pertinentes.',

    'privacyPolicy.section7.title': '7. Bases legales para el tratamiento',
    'privacyPolicy.section7.p1':
      'Cuando la legislación aplicable exija una base legal para el tratamiento, nos basamos en una o más de las siguientes:',
    'privacyPolicy.section7.li1':
      'la ejecución de un contrato o medidas adoptadas a su solicitud antes de celebrar un contrato;',
    'privacyPolicy.section7.li2':
      'el cumplimiento de obligaciones legales y regulatorias;',
    'privacyPolicy.section7.li3':
      'nuestros intereses legítimos en operar, proteger y mejorar nuestros servicios;',
    'privacyPolicy.section7.li4':
      'su consentimiento, cuando la ley lo exija.',

    'privacyPolicy.section8.title': '8. Cómo compartimos la información',
    'privacyPolicy.section8.p1':
      'Podemos divulgar información personal a:',
    'privacyPolicy.section8.li1':
      'empresas de nuestro grupo corporativo y entidades afiliadas;',
    'privacyPolicy.section8.li2':
      'socios bancarios, redes de pago, proveedores de liquidez, proveedores de custodia y contrapartes de liquidación;',
    'privacyPolicy.section8.li3':
      'proveedores de verificación de identidad, prevención del fraude, ciberseguridad, análisis blockchain y servicios de cumplimiento;',
    'privacyPolicy.section8.li4':
      'asesores profesionales, auditores, aseguradoras y asesores jurídicos;',
    'privacyPolicy.section8.li5':
      'reguladores, autoridades supervisoras, tribunales, fuerzas del orden, autoridades fiscales y organismos gubernamentales cuando la ley lo exija o permita;',
    'privacyPolicy.section8.li6':
      'posibles compradores, inversores o sucesores en relación con una fusión, adquisición, reestructuración, financiación o venta de activos, sujetos a obligaciones de confidencialidad apropiadas.',
    'privacyPolicy.section8.p2':
      'No vendemos información personal en el sentido comercial ordinario de vender datos de clientes a terceros no relacionados para fines de marketing independiente.',

    'privacyPolicy.section9.title': '9. Transferencias internacionales',
    'privacyPolicy.section9.p1':
      'Su información personal puede ser tratada en jurisdicciones fuera de su país de residencia, incluidas jurisdicciones que podrían no ofrecer el mismo nivel de protección de datos que su jurisdicción de origen.',
    'privacyPolicy.section9.p2':
      'Cuando sea necesario, implementamos salvaguardas apropiadas para transferencias transfronterizas, incluidas protecciones contractuales, controles internos y otros mecanismos de transferencia legales.',

    'privacyPolicy.section10.title': '10. Conservación de datos',
    'privacyPolicy.section10.p1':
      'Conservamos la información personal durante el tiempo necesario para cumplir los fines para los que fue recopilada, incluso para prestar servicios, mantener registros comerciales y financieros precisos, resolver disputas, hacer cumplir acuerdos y cumplir obligaciones legales, fiscales, contables, de auditoría y regulatorias.',
    'privacyPolicy.section10.p2':
      'Los periodos de conservación pueden ampliarse cuando sea necesario para investigaciones de cumplimiento, obligaciones de preservación en litigios, consultas regulatorias, supervisión del fraude o fines continuos de gestión del riesgo.',

    'privacyPolicy.section11.title': '11. Seguridad',
    'privacyPolicy.section11.p1':
      'Mantenemos salvaguardas administrativas, técnicas y físicas diseñadas para proteger la información personal frente a acceso no autorizado, destrucción, pérdida, alteración, uso indebido o divulgación. Estas medidas pueden incluir controles de acceso, cifrado, supervisión, prácticas de desarrollo seguro, supervisión de proveedores y procedimientos de respuesta a incidentes.',
    'privacyPolicy.section11.p2':
      'Ninguna medida de seguridad es absoluta y ningún método de transmisión o almacenamiento puede garantizarse como completamente seguro. Los clientes son responsables de mantener la confidencialidad de las credenciales de su cuenta y de notificarnos inmediatamente cualquier actividad no autorizada sospechosa.',

    'privacyPolicy.section12.title': '12. Cookies y tecnologías similares',
    'privacyPolicy.section12.p1':
      'Podemos utilizar cookies, píxeles, almacenamiento local y tecnologías similares para operar nuestro sitio web y aplicaciones, mantener la seguridad, medir el rendimiento, recordar preferencias y comprender el uso del servicio.',
    'privacyPolicy.section12.p2':
      'Es posible que pueda controlar determinadas cookies a través de la configuración del navegador o herramientas de consentimiento cuando estén disponibles. Deshabilitar algunas tecnologías puede afectar la funcionalidad, el rendimiento o la disponibilidad de determinadas funciones.',

    'privacyPolicy.section13.title': '13. Sus derechos',
    'privacyPolicy.section13.p1':
      'Sujeto a la legislación aplicable, puede tener derechos relacionados con su información personal, que pueden incluir el derecho a solicitar acceso, corrección, eliminación, restricción, portabilidad u oposición a determinadas actividades de tratamiento.',
    'privacyPolicy.section13.p2':
      'Estos derechos no son absolutos y pueden verse limitados cuando el tratamiento sea necesario para el cumplimiento legal, la conservación regulatoria de registros, la prevención del fraude, el ejercicio o defensa de reclamaciones legales u otros fines lícitos.',
    'privacyPolicy.section13.p3':
      'Para ejercer los derechos disponibles, póngase en contacto con nosotros utilizando los datos que se indican a continuación. Podemos solicitar información adicional para verificar su identidad antes de responder.',

    'privacyPolicy.section14.title': '14. Comunicaciones de marketing',
    'privacyPolicy.section14.p1':
      'Cuando la ley lo permita, podremos enviarle actualizaciones del servicio, información sobre productos y otras comunicaciones relacionadas con nuestras ofertas. Puede darse de baja de las comunicaciones de marketing no esenciales utilizando el método de cancelación incluido en el mensaje o contactándonos directamente.',
    'privacyPolicy.section14.p2':
      'Seguiremos enviando comunicaciones necesarias para la administración de la cuenta, la seguridad, los avisos legales o las operaciones relacionadas con el servicio.',

    'privacyPolicy.section15.title': '15. Privacidad de los menores',
    'privacyPolicy.section15.p1':
      'Nuestros productos y servicios no están dirigidos a menores, y no recopilamos conscientemente información personal de personas que no estén legalmente autorizadas a utilizar nuestros servicios según la legislación aplicable.',

    'privacyPolicy.section16.title': '16. Cambios en esta política',
    'privacyPolicy.section16.p1':
      'Podemos modificar esta Política de privacidad ocasionalmente para reflejar cambios en la ley, la regulación, la tecnología, las operaciones comerciales o las ofertas de servicios. La versión actualizada se publicará en esta página con una fecha de entrada en vigor revisada.',
    'privacyPolicy.section16.p2':
      'El uso continuado de nuestros servicios después de que los cambios entren en vigor puede constituir el reconocimiento de la Política revisada en la medida permitida por la ley.',

    'privacyPolicy.contact.title': '17. Contáctenos',
    'privacyPolicy.contact.p1':
      'Las preguntas, solicitudes e inquietudes formales sobre privacidad deben dirigirse a:',
    'privacyPolicy.contact.office': 'Oficina de Privacidad / Delegado de Protección de Datos',
    'privacyPolicy.contact.address1': '[Insertar dirección registrada]',
    'privacyPolicy.contact.address2': '[Insertar ciudad, país, código postal]',
    'privacyPolicy.contact.email': '[Insertar correo de privacidad]',
    'privacyPolicy.contact.phone': '[Insertar número de contacto]',

    'privacyPolicy.notice.title': '18. Aviso importante',
    'privacyPolicy.notice.body':
      'Este documento se proporciona como una plantilla general de política de privacidad para un sitio web de una institución financiera que ofrece servicios fiduciarios y de activos digitales. Debe ser revisado y finalizado por asesores jurídicos y de cumplimiento cualificados antes de su publicación para garantizar su alineación con las leyes, regulaciones, estado de licencias, divulgaciones y modelo operativo aplicables a su negocio y jurisdicciones.',
  },

  it: {
    'privacyPolicy.pageTitle': 'Informativa sulla privacy',
    'privacyPolicy.heroDescription':
      'La presente Informativa sulla privacy spiega come SKOK Bank raccoglie, utilizza, divulga, conserva e protegge le informazioni personali in relazione ai nostri servizi bancari, di pagamento e di asset digitali. Ci impegniamo a trattare i dati personali in modo responsabile, lecito e con il livello di attenzione atteso da un istituto finanziario che opera sia in ambienti fiat sia basati su blockchain.',
    'privacyPolicy.effectiveDate': 'Data di efficacia',
    'privacyPolicy.lastUpdated': 'Ultimo aggiornamento',
    'privacyPolicy.appliesTo': 'Si applica a',
    'privacyPolicy.appliesToValue': 'Fiat, servizi bancari, pagamenti e asset digitali',
    'privacyPolicy.onThisPage': 'In questa pagina',
    'privacyPolicy.contactUsNav': '17. Contattaci',
    'privacyPolicy.importantNoticeNav': '18. Avviso importante',
    'privacyPolicy.legalNotice.title': 'Importante avviso legale',
    'privacyPolicy.legalNotice.body':
      'La presente Informativa sulla privacy ha lo scopo di comunicare le nostre pratiche generali di trattamento dei dati. Dovrebbe essere esaminata e finalizzata da consulenti legali e di conformità qualificati prima della pubblicazione per garantire l’allineamento con i requisiti normativi, di licenza e operativi applicabili al vostro modello di business e alle giurisdizioni in cui i servizi sono offerti.',

    'privacyPolicy.section1.title': '1. Ambito di applicazione',
    'privacyPolicy.section1.p1':
      'La presente Informativa sulla privacy si applica alle informazioni personali raccolte tramite il nostro sito web, le applicazioni mobili e web, i canali di assistenza clienti, i processi di onboarding e apertura conto, i servizi transazionali, i servizi relativi agli asset digitali e qualsiasi altro prodotto o servizio che rendiamo disponibile a individui, imprese e clienti istituzionali.',
    'privacyPolicy.section1.p2':
      'La presente Informativa si applica sia che interagiate con noi come visitatori, potenziali clienti, utenti autorizzati, titolari di conto, titolari effettivi, rappresentanti aziendali, fornitori o altre parti rilevanti.',

    'privacyPolicy.section2.title': '2. Informazioni che raccogliamo',
    'privacyPolicy.section2.p1':
      'Potremmo raccogliere le seguenti categorie di informazioni, nella misura consentita o richiesta dalla legge applicabile:',
    'privacyPolicy.section2.li1':
      'Informazioni identificative: nome completo, data di nascita, nazionalità, dati di identificazione rilasciati dal governo, passaporto, patente di guida, carta d’identità nazionale, numero di identificazione fiscale e documenti di verifica simili.',
    'privacyPolicy.section2.li2':
      'Informazioni di contatto: indirizzo di residenza, indirizzo postale, indirizzo e-mail, numero di telefono e altri dati di comunicazione.',
    'privacyPolicy.section2.li3':
      'Informazioni finanziarie: coordinate bancarie, dati delle carte di pagamento, cronologia delle transazioni, origine dei fondi, origine del patrimonio, informazioni sul reddito, saldi dei conti e dati correlati del profilo finanziario.',
    'privacyPolicy.section2.li4':
      'Informazioni aziendali e societarie: denominazione della società, numero di registrazione, indirizzo aziendale, amministratori, azionisti, informazioni sulla titolarità effettiva e documenti di verifica societaria.',
    'privacyPolicy.section2.li5':
      'Informazioni sugli asset digitali: indirizzi wallet, hash delle transazioni, registri di interazione con la blockchain, depositi e prelievi di asset digitali, registri relativi alla custodia e altre attività associate ai servizi di asset digitali.',
    'privacyPolicy.section2.li6':
      'Informazioni tecniche e di utilizzo: indirizzo IP, tipo di browser, sistema operativo, identificatori del dispositivo, registri di accesso, cookie, dati di sessione, interazioni con l’app e analisi di utilizzo del sito web.',
    'privacyPolicy.section2.li7':
      'Informazioni di conformità e rischio: risultati dei controlli sanzionatori, status di persona politicamente esposta, controlli di adverse media, indicatori di frode, valutazioni del rischio e registri di revisione antiriciclaggio.',
    'privacyPolicy.section2.li8':
      'Comunicazioni: corrispondenza, messaggi del supporto clienti, registrazioni delle chiamate ove consentito, reclami e altri registri delle interazioni con noi.',

    'privacyPolicy.section3.title': '3. Come raccogliamo le informazioni',
    'privacyPolicy.section3.p1':
      'Raccogliamo informazioni personali da diverse fonti, tra cui:',
    'privacyPolicy.section3.li1':
      'direttamente da voi durante l’onboarding, le richieste o l’utilizzo dei servizi;',
    'privacyPolicy.section3.li2':
      'attraverso le vostre transazioni e l’attività del vostro conto;',
    'privacyPolicy.section3.li3':
      'dai vostri dispositivi e browser quando utilizzate il nostro sito web o le nostre app;',
    'privacyPolicy.section3.li4':
      'da fornitori di verifica dell’identità, processori di pagamento, fornitori di analisi blockchain, servizi di prevenzione frodi e fornitori di conformità;',
    'privacyPolicy.section3.li5':
      'da registri pubblici, fonti relative al credito ove consentito, liste sanzionatorie, richieste delle forze dell’ordine e altre fonti legalmente disponibili;',
    'privacyPolicy.section3.li6':
      'da rappresentanti aziendali, introducer o altre persone che agiscono per conto di un cliente o di un’entità.',

    'privacyPolicy.section4.title': '4. Perché utilizziamo le informazioni personali',
    'privacyPolicy.section4.p1':
      'Utilizziamo le informazioni personali per finalità commerciali, contrattuali, legali e di conformità legittime, anche per:',
    'privacyPolicy.section4.li1':
      'fornire e mantenere servizi bancari, pagamenti fiat e servizi relativi agli asset digitali;',
    'privacyPolicy.section4.li2':
      'aprire, gestire e amministrare i conti;',
    'privacyPolicy.section4.li3':
      'verificare l’identità ed effettuare adeguata verifica della clientela e adeguata verifica rafforzata;',
    'privacyPolicy.section4.li4':
      'elaborare depositi, prelievi, trasferimenti, scambi, regolamenti e istruzioni correlate;',
    'privacyPolicy.section4.li5':
      'monitorare transazioni e attività dei conti per frode, abuso, esposizione a sanzioni e attività sospette;',
    'privacyPolicy.section4.li6':
      'adempiere a obblighi legali, normativi, fiscali, contabili e di reporting;',
    'privacyPolicy.section4.li7':
      'rilevare, indagare e prevenire riciclaggio, finanziamento del terrorismo, frodi, minacce informatiche e altre condotte illecite;',
    'privacyPolicy.section4.li8':
      'proteggere i nostri sistemi, piattaforme, clienti e operazioni;',
    'privacyPolicy.section4.li9':
      'comunicare con voi in merito a servizi, avvisi, richieste di supporto e aggiornamenti legali;',
    'privacyPolicy.section4.li10':
      'migliorare i nostri prodotti, l’erogazione dei servizi, i controlli di rischio e l’esperienza cliente;',
    'privacyPolicy.section4.li11':
      'far valere i nostri accordi, le nostre politiche e i nostri diritti legali.',

    'privacyPolicy.section5.title': '5. Attività sensibili di conformità e verifica',
    'privacyPolicy.section5.p1':
      'In qualità di fornitore di servizi finanziari che opera in ambienti fiat e di asset digitali, potremmo trattare informazioni personali nell’ambito di procedure know-your-customer, antiriciclaggio, conformità alle sanzioni, prevenzione frodi, monitoraggio delle transazioni e gestione del rischio di criminalità finanziaria.',
    'privacyPolicy.section5.p2':
      'Ciò può includere verifica dell’identità, autenticazione dei documenti, revisione dell’origine dei fondi, revisione dell’origine del patrimonio, valutazione di attività sospette, screening dei wallet, analisi blockchain e monitoraggio continuo dei conti. Ove richiesto, potremmo conservare i registri di tali revisioni per i periodi previsti dalla legge o dalla normativa.',

    'privacyPolicy.section6.title': '6. Informative su blockchain e asset digitali',
    'privacyPolicy.section6.p1':
      'Alcune transazioni di asset digitali possono essere registrate su registri distribuiti pubblici o autorizzati. I registri blockchain possono essere pubblici, immutabili e difficili o impossibili da modificare o cancellare.',
    'privacyPolicy.section6.p2':
      'Anche laddove gli indirizzi wallet non identifichino direttamente una persona, possono essere associati a essa tramite registri di onboarding, schemi transazionali, analisi o altre fonti di dati. Utilizzando servizi di asset digitali, riconoscete che i dati delle transazioni possono essere visibili ai partecipanti della blockchain, ai fornitori di analisi e ad altre terze parti con accesso alle reti o agli strumenti pertinenti.',

    'privacyPolicy.section7.title': '7. Basi giuridiche del trattamento',
    'privacyPolicy.section7.p1':
      'Laddove la legge applicabile richieda una base giuridica per il trattamento, facciamo affidamento su una o più delle seguenti:',
    'privacyPolicy.section7.li1':
      'esecuzione di un contratto o misure adottate su vostra richiesta prima della conclusione di un contratto;',
    'privacyPolicy.section7.li2':
      'adempimento di obblighi legali e normativi;',
    'privacyPolicy.section7.li3':
      'i nostri interessi legittimi a gestire, proteggere e migliorare i nostri servizi;',
    'privacyPolicy.section7.li4':
      'il vostro consenso, ove richiesto dalla legge.',

    'privacyPolicy.section8.title': '8. Come condividiamo le informazioni',
    'privacyPolicy.section8.p1':
      'Potremmo divulgare informazioni personali a:',
    'privacyPolicy.section8.li1':
      'società del nostro gruppo e entità affiliate;',
    'privacyPolicy.section8.li2':
      'partner bancari, reti di pagamento, fornitori di liquidità, fornitori di custodia e controparti di regolamento;',
    'privacyPolicy.section8.li3':
      'fornitori di verifica dell’identità, prevenzione frodi, cybersicurezza, analisi blockchain e servizi di conformità;',
    'privacyPolicy.section8.li4':
      'consulenti professionali, revisori, assicuratori e consulenti legali;',
    'privacyPolicy.section8.li5':
      'autorità regolatorie, autorità di vigilanza, tribunali, forze dell’ordine, autorità fiscali e agenzie governative ove richiesto o consentito dalla legge;',
    'privacyPolicy.section8.li6':
      'potenziali acquirenti, investitori o successori in relazione a fusione, acquisizione, ristrutturazione, finanziamento o cessione di asset, soggetti a opportuni obblighi di riservatezza.',
    'privacyPolicy.section8.p2':
      'Non vendiamo informazioni personali nel senso commerciale ordinario della vendita di dati dei clienti a terze parti non collegate per finalità di marketing indipendenti.',

    'privacyPolicy.section9.title': '9. Trasferimenti internazionali',
    'privacyPolicy.section9.p1':
      'Le vostre informazioni personali possono essere trattate in giurisdizioni al di fuori del vostro Paese di residenza, incluse giurisdizioni che potrebbero non offrire lo stesso livello di protezione dei dati della vostra giurisdizione di origine.',
    'privacyPolicy.section9.p2':
      'Ove richiesto, adottiamo adeguate garanzie per i trasferimenti transfrontalieri, incluse protezioni contrattuali, controlli interni e altri meccanismi di trasferimento leciti.',

    'privacyPolicy.section10.title': '10. Conservazione dei dati',
    'privacyPolicy.section10.p1':
      'Conserviamo le informazioni personali per il tempo necessario a soddisfare le finalità per cui sono state raccolte, anche per fornire servizi, mantenere registri aziendali e finanziari accurati, risolvere controversie, far valere accordi e adempiere a obblighi legali, fiscali, contabili, di revisione e normativi.',
    'privacyPolicy.section10.p2':
      'I periodi di conservazione possono essere estesi ove necessario per indagini di conformità, obblighi di conservazione in ambito contenzioso, richieste regolatorie, monitoraggio frodi o finalità continuative di gestione del rischio.',

    'privacyPolicy.section11.title': '11. Sicurezza',
    'privacyPolicy.section11.p1':
      'Manteniamo misure di salvaguardia amministrative, tecniche e fisiche progettate per proteggere le informazioni personali da accesso non autorizzato, distruzione, perdita, alterazione, uso improprio o divulgazione. Tali misure possono includere controlli di accesso, crittografia, monitoraggio, pratiche di sviluppo sicuro, supervisione dei fornitori e procedure di risposta agli incidenti.',
    'privacyPolicy.section11.p2':
      'Nessuna misura di sicurezza è assoluta e nessun metodo di trasmissione o archiviazione può essere garantito come completamente sicuro. I clienti sono responsabili del mantenimento della riservatezza delle credenziali del conto e della tempestiva notifica di qualsiasi attività non autorizzata sospetta.',

    'privacyPolicy.section12.title': '12. Cookie e tecnologie simili',
    'privacyPolicy.section12.p1':
      'Potremmo utilizzare cookie, pixel, archiviazione locale e tecnologie simili per gestire il nostro sito web e le nostre applicazioni, mantenere la sicurezza, misurare le prestazioni, ricordare le preferenze e comprendere l’utilizzo del servizio.',
    'privacyPolicy.section12.p2':
      'Potreste essere in grado di controllare determinati cookie tramite le impostazioni del browser o strumenti di consenso, ove disponibili. La disattivazione di alcune tecnologie può influire sulla funzionalità, sulle prestazioni o sulla disponibilità di alcune funzioni.',

    'privacyPolicy.section13.title': '13. I vostri diritti',
    'privacyPolicy.section13.p1':
      'Fatto salvo quanto previsto dalla legge applicabile, potreste avere diritti relativi alle vostre informazioni personali, inclusi il diritto di richiedere accesso, rettifica, cancellazione, limitazione, portabilità o opposizione a determinate attività di trattamento.',
    'privacyPolicy.section13.p2':
      'Tali diritti non sono assoluti e possono essere limitati laddove il trattamento sia necessario per la conformità legale, la conservazione regolatoria dei registri, la prevenzione frodi, l’esercizio o la difesa di pretese legali o altre finalità lecite.',
    'privacyPolicy.section13.p3':
      'Per esercitare i diritti disponibili, contattateci utilizzando i dettagli forniti di seguito. Potremmo richiedere informazioni aggiuntive per verificare la vostra identità prima di rispondere.',

    'privacyPolicy.section14.title': '14. Comunicazioni di marketing',
    'privacyPolicy.section14.p1':
      'Ove consentito dalla legge, potremmo inviarvi aggiornamenti di servizio, informazioni sui prodotti e altre comunicazioni relative alle nostre offerte. Potete rinunciare alle comunicazioni di marketing non essenziali utilizzando il metodo di disiscrizione fornito nel messaggio o contattandoci direttamente.',
    'privacyPolicy.section14.p2':
      'Continueremo comunque a inviare comunicazioni necessarie per l’amministrazione del conto, la sicurezza, gli avvisi legali o le operazioni connesse al servizio.',

    'privacyPolicy.section15.title': '15. Privacy dei minori',
    'privacyPolicy.section15.p1':
      'I nostri prodotti e servizi non sono rivolti ai minori e non raccogliamo consapevolmente informazioni personali da soggetti che non sono legalmente autorizzati a utilizzare i nostri servizi ai sensi della legge applicabile.',

    'privacyPolicy.section16.title': '16. Modifiche alla presente Informativa',
    'privacyPolicy.section16.p1':
      'Potremmo modificare la presente Informativa sulla privacy di tanto in tanto per riflettere cambiamenti di legge, normativa, tecnologia, operazioni aziendali o offerte di servizi. La versione aggiornata sarà pubblicata su questa pagina con una data di efficacia rivista.',
    'privacyPolicy.section16.p2':
      'Il vostro uso continuato dei nostri servizi dopo l’entrata in vigore delle modifiche può costituire accettazione della versione aggiornata dell’Informativa nella misura consentita dalla legge.',

    'privacyPolicy.contact.title': '17. Contattaci',
    'privacyPolicy.contact.p1':
      'Domande, richieste e istanze formali in materia di privacy devono essere indirizzate a:',
    'privacyPolicy.contact.office': 'Ufficio Privacy / Responsabile della Protezione dei Dati',
    'privacyPolicy.contact.address1': '[Inserire indirizzo registrato]',
    'privacyPolicy.contact.address2': '[Inserire città, Paese, CAP]',
    'privacyPolicy.contact.email': '[Inserire email privacy]',
    'privacyPolicy.contact.phone': '[Inserire numero di contatto]',

    'privacyPolicy.notice.title': '18. Avviso importante',
    'privacyPolicy.notice.body':
      'Questo documento è fornito come modello generale di informativa sulla privacy del sito web per un istituto finanziario che offre servizi fiat e di asset digitali. Deve essere esaminato e finalizzato da consulenti legali e di conformità qualificati prima della pubblicazione per garantire l’allineamento con leggi, regolamenti, stato delle licenze, informative e modello operativo applicabili alla vostra attività e alle relative giurisdizioni.',
  },

  el: {
    'privacyPolicy.pageTitle': 'Πολιτική απορρήτου',
    'privacyPolicy.heroDescription':
      'Η παρούσα Πολιτική Απορρήτου εξηγεί πώς η SKOK Bank συλλέγει, χρησιμοποιεί, κοινοποιεί, αποθηκεύει και προστατεύει προσωπικές πληροφορίες σε σχέση με τις τραπεζικές, πληρωμών και υπηρεσίες ψηφιακών περιουσιακών στοιχείων που παρέχουμε. Δεσμευόμαστε να διαχειριζόμαστε τα προσωπικά δεδομένα υπεύθυνα, νόμιμα και με το επίπεδο επιμέλειας που αναμένεται από ένα χρηματοπιστωτικό ίδρυμα που λειτουργεί τόσο σε περιβάλλοντα fiat όσο και σε περιβάλλοντα βασισμένα σε blockchain.',
    'privacyPolicy.effectiveDate': 'Ημερομηνία έναρξης ισχύος',
    'privacyPolicy.lastUpdated': 'Τελευταία ενημέρωση',
    'privacyPolicy.appliesTo': 'Ισχύει για',
    'privacyPolicy.appliesToValue': 'Fiat, τραπεζικές υπηρεσίες, πληρωμές και ψηφιακά περιουσιακά στοιχεία',
    'privacyPolicy.onThisPage': 'Σε αυτή τη σελίδα',
    'privacyPolicy.contactUsNav': '17. Επικοινωνήστε μαζί μας',
    'privacyPolicy.importantNoticeNav': '18. Σημαντική ειδοποίηση',
    'privacyPolicy.legalNotice.title': 'Σημαντική νομική ειδοποίηση',
    'privacyPolicy.legalNotice.body':
      'Η παρούσα Πολιτική Απορρήτου προορίζεται να παρουσιάσει τις γενικές πρακτικές μας σχετικά με τον χειρισμό δεδομένων. Θα πρέπει να εξεταστεί και να οριστικοποιηθεί από κατάλληλους νομικούς και συμβούλους συμμόρφωσης πριν από τη δημοσίευση, ώστε να διασφαλιστεί η ευθυγράμμιση με τις κανονιστικές, αδειοδοτικές και λειτουργικές απαιτήσεις που ισχύουν για το επιχειρηματικό σας μοντέλο και τις δικαιοδοσίες στις οποίες προσφέρονται οι υπηρεσίες.',

    'privacyPolicy.section1.title': '1. Πεδίο εφαρμογής',
    'privacyPolicy.section1.p1':
      'Η παρούσα Πολιτική Απορρήτου εφαρμόζεται σε προσωπικές πληροφορίες που συλλέγονται μέσω του ιστότοπού μας, των εφαρμογών μας για κινητά και web, των καναλιών υποστήριξης πελατών, των διαδικασιών onboarding και ανοίγματος λογαριασμού, των υπηρεσιών συναλλαγών, των υπηρεσιών ψηφιακών περιουσιακών στοιχείων και οποιωνδήποτε άλλων προϊόντων ή υπηρεσιών που διαθέτουμε σε ιδιώτες, επιχειρήσεις και θεσμικούς πελάτες.',
    'privacyPolicy.section1.p2':
      'Η παρούσα Πολιτική εφαρμόζεται είτε αλληλεπιδράτε μαζί μας ως επισκέπτης, υποψήφιος πελάτης, εξουσιοδοτημένος χρήστης, κάτοχος λογαριασμού, πραγματικός δικαιούχος, εταιρικός εκπρόσωπος, προμηθευτής ή άλλο σχετικό μέρος.',

    'privacyPolicy.section2.title': '2. Πληροφορίες που συλλέγουμε',
    'privacyPolicy.section2.p1':
      'Ενδέχεται να συλλέγουμε τις ακόλουθες κατηγορίες πληροφοριών, στον βαθμό που επιτρέπεται ή απαιτείται από την εφαρμοστέα νομοθεσία:',
    'privacyPolicy.section2.li1':
      'Στοιχεία ταυτότητας: πλήρες όνομα, ημερομηνία γέννησης, ιθαγένεια, στοιχεία ταυτοποίησης που έχουν εκδοθεί από κυβερνητική αρχή, διαβατήριο, άδεια οδήγησης, εθνική ταυτότητα, αριθμός φορολογικού μητρώου και παρόμοια αρχεία επαλήθευσης.',
    'privacyPolicy.section2.li2':
      'Στοιχεία επικοινωνίας: διεύθυνση κατοικίας, ταχυδρομική διεύθυνση, διεύθυνση email, αριθμός τηλεφώνου και άλλα στοιχεία επικοινωνίας.',
    'privacyPolicy.section2.li3':
      'Οικονομικές πληροφορίες: στοιχεία τραπεζικού λογαριασμού, στοιχεία κάρτας πληρωμών, ιστορικό συναλλαγών, προέλευση κεφαλαίων, προέλευση περιουσίας, πληροφορίες εισοδήματος, υπόλοιπα λογαριασμών και σχετικά οικονομικά δεδομένα προφίλ.',
    'privacyPolicy.section2.li4':
      'Επιχειρηματικές και εταιρικές πληροφορίες: επωνυμία εταιρείας, αριθμός μητρώου, επιχειρηματική διεύθυνση, διευθυντές, μέτοχοι, πληροφορίες πραγματικής κυριότητας και αρχεία εταιρικής επαλήθευσης.',
    'privacyPolicy.section2.li5':
      'Πληροφορίες ψηφιακών περιουσιακών στοιχείων: διευθύνσεις wallet, hashes συναλλαγών, αρχεία αλληλεπίδρασης με blockchain, καταθέσεις και αναλήψεις ψηφιακών περιουσιακών στοιχείων, αρχεία σχετιζόμενα με custody και άλλη δραστηριότητα που σχετίζεται με υπηρεσίες ψηφιακών περιουσιακών στοιχείων.',
    'privacyPolicy.section2.li6':
      'Τεχνικές πληροφορίες και πληροφορίες χρήσης: διεύθυνση IP, τύπος προγράμματος περιήγησης, λειτουργικό σύστημα, αναγνωριστικά συσκευής, αρχεία πρόσβασης, cookies, δεδομένα συνεδρίας, αλληλεπιδράσεις εφαρμογής και αναλύσεις χρήσης του ιστότοπου.',
    'privacyPolicy.section2.li7':
      'Πληροφορίες συμμόρφωσης και κινδύνου: αποτελέσματα ελέγχων κυρώσεων, καθεστώς πολιτικώς εκτεθειμένου προσώπου, έλεγχοι αρνητικής δημοσιότητας, ενδείξεις απάτης, αξιολογήσεις κινδύνου και αρχεία ελέγχου κατά της νομιμοποίησης εσόδων από παράνομες δραστηριότητες.',
    'privacyPolicy.section2.li8':
      'Επικοινωνίες: αλληλογραφία, μηνύματα υποστήριξης πελατών, ηχογραφήσεις κλήσεων όπου επιτρέπεται, παράπονα και άλλα αρχεία αλληλεπιδράσεων μαζί μας.',

    'privacyPolicy.section3.title': '3. Πώς συλλέγουμε πληροφορίες',
    'privacyPolicy.section3.p1':
      'Συλλέγουμε προσωπικές πληροφορίες από ποικίλες πηγές, μεταξύ άλλων:',
    'privacyPolicy.section3.li1':
      'απευθείας από εσάς κατά το onboarding, τις αιτήσεις ή τη χρήση των υπηρεσιών;',
    'privacyPolicy.section3.li2':
      'μέσω των συναλλαγών σας και της δραστηριότητας του λογαριασμού σας;',
    'privacyPolicy.section3.li3':
      'από τις συσκευές και το πρόγραμμα περιήγησής σας όταν χρησιμοποιείτε τον ιστότοπό μας ή τις εφαρμογές μας;',
    'privacyPolicy.section3.li4':
      'από παρόχους επαλήθευσης ταυτότητας, επεξεργαστές πληρωμών, παρόχους αναλύσεων blockchain, υπηρεσίες πρόληψης απάτης και παρόχους συμμόρφωσης;',
    'privacyPolicy.section3.li5':
      'από δημόσια μητρώα, πηγές σχετικές με πιστοληπτική ικανότητα όπου επιτρέπεται νόμιμα, λίστες κυρώσεων, αιτήματα αρχών επιβολής του νόμου και άλλες νόμιμα διαθέσιμες πηγές;',
    'privacyPolicy.section3.li6':
      'από εταιρικούς εκπροσώπους, εισαγωγείς πελατών ή άλλα πρόσωπα που ενεργούν για λογαριασμό πελάτη ή οντότητας.',

    'privacyPolicy.section4.title': '4. Γιατί χρησιμοποιούμε προσωπικές πληροφορίες',
    'privacyPolicy.section4.p1':
      'Χρησιμοποιούμε προσωπικές πληροφορίες για νόμιμους επιχειρηματικούς, συμβατικούς, νομικούς και σκοπούς συμμόρφωσης, συμπεριλαμβανομένων των εξής:',
    'privacyPolicy.section4.li1':
      'παροχή και διατήρηση τραπεζικών υπηρεσιών, υπηρεσιών πληρωμών fiat και υπηρεσιών ψηφιακών περιουσιακών στοιχείων;',
    'privacyPolicy.section4.li2':
      'άνοιγμα, διαχείριση και διοίκηση λογαριασμών;',
    'privacyPolicy.section4.li3':
      'επαλήθευση ταυτότητας και διενέργεια δέουσας επιμέλειας πελάτη και ενισχυμένης δέουσας επιμέλειας;',
    'privacyPolicy.section4.li4':
      'επεξεργασία καταθέσεων, αναλήψεων, μεταφορών, συναλλαγών, διακανονισμών και σχετικών οδηγιών;',
    'privacyPolicy.section4.li5':
      'παρακολούθηση συναλλαγών και δραστηριότητας λογαριασμών για απάτη, κατάχρηση, έκθεση σε κυρώσεις και ύποπτη δραστηριότητα;',
    'privacyPolicy.section4.li6':
      'συμμόρφωση με νομικές, κανονιστικές, φορολογικές, λογιστικές και υποχρεώσεις αναφοράς;',
    'privacyPolicy.section4.li7':
      'εντοπισμό, διερεύνηση και πρόληψη νομιμοποίησης εσόδων από παράνομες δραστηριότητες, χρηματοδότησης τρομοκρατίας, απάτης, κυβερνοαπειλών και άλλης παράνομης συμπεριφοράς;',
    'privacyPolicy.section4.li8':
      'ασφάλεια των συστημάτων, πλατφορμών, πελατών και λειτουργιών μας;',
    'privacyPolicy.section4.li9':
      'επικοινωνία μαζί σας σχετικά με υπηρεσίες, ειδοποιήσεις, αιτήματα υποστήριξης και νομικές ενημερώσεις;',
    'privacyPolicy.section4.li10':
      'βελτίωση των προϊόντων μας, της παροχής υπηρεσιών, των ελέγχων κινδύνου και της εμπειρίας πελάτη;',
    'privacyPolicy.section4.li11':
      'επιβολή των συμφωνιών, πολιτικών και νομικών δικαιωμάτων μας.',

    'privacyPolicy.section5.title': '5. Ευαίσθητες δραστηριότητες συμμόρφωσης και επαλήθευσης',
    'privacyPolicy.section5.p1':
      'Ως πάροχος χρηματοοικονομικών υπηρεσιών που δραστηριοποιείται σε περιβάλλοντα fiat και ψηφιακών περιουσιακών στοιχείων, ενδέχεται να επεξεργαζόμαστε προσωπικές πληροφορίες στο πλαίσιο διαδικασιών know-your-customer, καταπολέμησης νομιμοποίησης εσόδων από παράνομες δραστηριότητες, συμμόρφωσης με κυρώσεις, πρόληψης απάτης, παρακολούθησης συναλλαγών και διαχείρισης κινδύνου οικονομικού εγκλήματος.',
    'privacyPolicy.section5.p2':
      'Αυτό μπορεί να περιλαμβάνει επαλήθευση ταυτότητας, αυθεντικοποίηση εγγράφων, εξέταση προέλευσης κεφαλαίων, εξέταση προέλευσης περιουσίας, αξιολόγηση ύποπτης δραστηριότητας, έλεγχο wallet, αναλύσεις blockchain και συνεχή παρακολούθηση λογαριασμών. Όπου απαιτείται, ενδέχεται να διατηρούμε αρχεία τέτοιων ελέγχων για τα χρονικά διαστήματα που επιβάλλονται από τον νόμο ή τους κανονισμούς.',

    'privacyPolicy.section6.title': '6. Γνωστοποιήσεις για blockchain και ψηφιακά περιουσιακά στοιχεία',
    'privacyPolicy.section6.p1':
      'Ορισμένες συναλλαγές ψηφιακών περιουσιακών στοιχείων ενδέχεται να καταγράφονται σε δημόσια ή επιτρεπόμενα κατανεμημένα καθολικά. Τα αρχεία blockchain μπορεί να είναι δημόσια, αμετάβλητα και δύσκολο ή αδύνατο να τροποποιηθούν ή να διαγραφούν.',
    'privacyPolicy.section6.p2':
      'Ακόμη και όταν οι διευθύνσεις wallet δεν ταυτοποιούν άμεσα ένα άτομο, μπορεί να συνδεθούν με αυτό μέσω αρχείων onboarding, μοτίβων συναλλαγών, αναλύσεων ή άλλων πηγών δεδομένων. Χρησιμοποιώντας υπηρεσίες ψηφιακών περιουσιακών στοιχείων, αναγνωρίζετε ότι τα δεδομένα συναλλαγών μπορεί να είναι ορατά σε συμμετέχοντες του blockchain, παρόχους αναλύσεων και άλλα τρίτα μέρη με πρόσβαση σε σχετικά δίκτυα ή εργαλεία.',

    'privacyPolicy.section7.title': '7. Νομικές βάσεις επεξεργασίας',
    'privacyPolicy.section7.p1':
      'Όπου η εφαρμοστέα νομοθεσία απαιτεί νομική βάση για την επεξεργασία, βασιζόμαστε σε μία ή περισσότερες από τις ακόλουθες:',
    'privacyPolicy.section7.li1':
      'εκτέλεση σύμβασης ή λήψη μέτρων κατόπιν αιτήματός σας πριν από τη σύναψη σύμβασης;',
    'privacyPolicy.section7.li2':
      'συμμόρφωση με νομικές και κανονιστικές υποχρεώσεις;',
    'privacyPolicy.section7.li3':
      'τα έννομα συμφέροντά μας για τη λειτουργία, προστασία και βελτίωση των υπηρεσιών μας;',
    'privacyPolicy.section7.li4':
      'τη συγκατάθεσή σας, όπου απαιτείται από τον νόμο.',

    'privacyPolicy.section8.title': '8. Πώς κοινοποιούμε πληροφορίες',
    'privacyPolicy.section8.p1':
      'Ενδέχεται να κοινοποιούμε προσωπικές πληροφορίες σε:',
    'privacyPolicy.section8.li1':
      'εταιρείες εντός του εταιρικού μας ομίλου και συνδεδεμένες οντότητες;',
    'privacyPolicy.section8.li2':
      'τραπεζικούς συνεργάτες, δίκτυα πληρωμών, παρόχους ρευστότητας, παρόχους θεματοφυλακής και αντισυμβαλλόμενους διακανονισμού;',
    'privacyPolicy.section8.li3':
      'παρόχους επαλήθευσης ταυτότητας, πρόληψης απάτης, κυβερνοασφάλειας, αναλύσεων blockchain και υπηρεσιών συμμόρφωσης;',
    'privacyPolicy.section8.li4':
      'επαγγελματίες συμβούλους, ελεγκτές, ασφαλιστές και νομικούς συμβούλους;',
    'privacyPolicy.section8.li5':
      'ρυθμιστικές αρχές, εποπτικές αρχές, δικαστήρια, αρχές επιβολής του νόμου, φορολογικές αρχές και κρατικούς φορείς όπου απαιτείται ή επιτρέπεται από τον νόμο;',
    'privacyPolicy.section8.li6':
      'πιθανούς αγοραστές, επενδυτές ή διαδόχους σε σχέση με συγχώνευση, εξαγορά, αναδιάρθρωση, χρηματοδότηση ή πώληση περιουσιακών στοιχείων, υπό την προϋπόθεση κατάλληλων υποχρεώσεων εμπιστευτικότητας.',
    'privacyPolicy.section8.p2':
      'Δεν πωλούμε προσωπικές πληροφορίες με τη συνήθη εμπορική έννοια της πώλησης δεδομένων πελατών σε μη συνδεδεμένα τρίτα μέρη για ανεξάρτητους σκοπούς μάρκετινγκ.',

    'privacyPolicy.section9.title': '9. Διεθνείς διαβιβάσεις',
    'privacyPolicy.section9.p1':
      'Οι προσωπικές σας πληροφορίες ενδέχεται να υποβληθούν σε επεξεργασία σε δικαιοδοσίες εκτός της χώρας διαμονής σας, συμπεριλαμβανομένων δικαιοδοσιών που ενδέχεται να μην παρέχουν το ίδιο επίπεδο προστασίας δεδομένων με τη χώρα σας.',
    'privacyPolicy.section9.p2':
      'Όπου απαιτείται, εφαρμόζουμε κατάλληλες διασφαλίσεις για διασυνοριακές διαβιβάσεις, συμπεριλαμβανομένων συμβατικών προστασιών, εσωτερικών ελέγχων και άλλων νόμιμων μηχανισμών διαβίβασης.',

    'privacyPolicy.section10.title': '10. Διατήρηση δεδομένων',
    'privacyPolicy.section10.p1':
      'Διατηρούμε προσωπικές πληροφορίες για όσο διάστημα είναι απαραίτητο για την εκπλήρωση των σκοπών για τους οποίους συλλέχθηκαν, συμπεριλαμβανομένης της παροχής υπηρεσιών, της διατήρησης ακριβών επιχειρηματικών και οικονομικών αρχείων, της επίλυσης διαφορών, της επιβολής συμφωνιών και της συμμόρφωσης με νομικές, φορολογικές, λογιστικές, ελεγκτικές και κανονιστικές υποχρεώσεις.',
    'privacyPolicy.section10.p2':
      'Οι περίοδοι διατήρησης μπορεί να παρατείνονται όταν απαιτείται για έρευνες συμμόρφωσης, υποχρεώσεις διατήρησης λόγω δικαστικών διαφορών, ρυθμιστικά ερωτήματα, παρακολούθηση απάτης ή συνεχιζόμενους σκοπούς διαχείρισης κινδύνου.',

    'privacyPolicy.section11.title': '11. Ασφάλεια',
    'privacyPolicy.section11.p1':
      'Διατηρούμε διοικητικά, τεχνικά και φυσικά μέτρα προστασίας σχεδιασμένα ώστε να προστατεύουν προσωπικές πληροφορίες από μη εξουσιοδοτημένη πρόσβαση, καταστροφή, απώλεια, αλλοίωση, κακή χρήση ή κοινοποίηση. Τα μέτρα αυτά μπορεί να περιλαμβάνουν ελέγχους πρόσβασης, κρυπτογράφηση, παρακολούθηση, πρακτικές ασφαλούς ανάπτυξης, εποπτεία προμηθευτών και διαδικασίες αντιμετώπισης περιστατικών.',
    'privacyPolicy.section11.p2':
      'Κανένα μέτρο ασφαλείας δεν είναι απόλυτο και καμία μέθοδος μετάδοσης ή αποθήκευσης δεν μπορεί να θεωρηθεί πλήρως ασφαλής. Οι πελάτες είναι υπεύθυνοι για τη διατήρηση της εμπιστευτικότητας των διαπιστευτηρίων του λογαριασμού τους και για την άμεση ενημέρωσή μας σε περίπτωση ύποπτης μη εξουσιοδοτημένης δραστηριότητας.',

    'privacyPolicy.section12.title': '12. Cookies και παρόμοιες τεχνολογίες',
    'privacyPolicy.section12.p1':
      'Ενδέχεται να χρησιμοποιούμε cookies, pixels, τοπική αποθήκευση και παρόμοιες τεχνολογίες για τη λειτουργία του ιστότοπου και των εφαρμογών μας, τη διατήρηση της ασφάλειας, τη μέτρηση της απόδοσης, την απομνημόνευση προτιμήσεων και την κατανόηση της χρήσης των υπηρεσιών.',
    'privacyPolicy.section12.p2':
      'Ενδέχεται να μπορείτε να ελέγχετε ορισμένα cookies μέσω των ρυθμίσεων του προγράμματος περιήγησης ή εργαλείων συγκατάθεσης όπου διατίθενται. Η απενεργοποίηση ορισμένων τεχνολογιών μπορεί να επηρεάσει τη λειτουργικότητα, την απόδοση ή τη διαθεσιμότητα ορισμένων δυνατοτήτων.',

    'privacyPolicy.section13.title': '13. Τα δικαιώματά σας',
    'privacyPolicy.section13.p1':
      'Με την επιφύλαξη της εφαρμοστέας νομοθεσίας, μπορεί να έχετε δικαιώματα σχετικά με τις προσωπικές σας πληροφορίες, τα οποία μπορεί να περιλαμβάνουν το δικαίωμα πρόσβασης, διόρθωσης, διαγραφής, περιορισμού, φορητότητας ή εναντίωσης σε ορισμένες δραστηριότητες επεξεργασίας.',
    'privacyPolicy.section13.p2':
      'Τα δικαιώματα αυτά δεν είναι απόλυτα και μπορεί να περιορίζονται όταν η επεξεργασία απαιτείται για νομική συμμόρφωση, τήρηση ρυθμιστικών αρχείων, πρόληψη απάτης, άσκηση ή υπεράσπιση νομικών αξιώσεων ή άλλους νόμιμους σκοπούς.',
    'privacyPolicy.section13.p3':
      'Για να ασκήσετε τα διαθέσιμα δικαιώματα, παρακαλούμε επικοινωνήστε μαζί μας χρησιμοποιώντας τα στοιχεία που παρέχονται παρακάτω. Ενδέχεται να ζητήσουμε πρόσθετες πληροφορίες για να επαληθεύσουμε την ταυτότητά σας πριν απαντήσουμε.',

    'privacyPolicy.section14.title': '14. Επικοινωνίες μάρκετινγκ',
    'privacyPolicy.section14.p1':
      'Όπου επιτρέπεται από τον νόμο, ενδέχεται να σας στέλνουμε ενημερώσεις υπηρεσιών, πληροφορίες προϊόντων και άλλες επικοινωνίες σχετικά με τις προσφορές μας. Μπορείτε να εξαιρεθείτε από μη ουσιώδεις επικοινωνίες μάρκετινγκ χρησιμοποιώντας τη μέθοδο απεγγραφής που παρέχεται στο μήνυμα ή επικοινωνώντας απευθείας μαζί μας.',
    'privacyPolicy.section14.p2':
      'Θα συνεχίσουμε ωστόσο να αποστέλλουμε επικοινωνίες που είναι απαραίτητες για τη διαχείριση λογαριασμού, την ασφάλεια, τις νομικές ειδοποιήσεις ή τις λειτουργίες που σχετίζονται με την υπηρεσία.',

    'privacyPolicy.section15.title': '15. Απόρρητο παιδιών',
    'privacyPolicy.section15.p1':
      'Τα προϊόντα και οι υπηρεσίες μας δεν απευθύνονται σε παιδιά και δεν συλλέγουμε εν γνώσει μας προσωπικές πληροφορίες από άτομα που δεν επιτρέπεται νομικά να χρησιμοποιούν τις υπηρεσίες μας σύμφωνα με την εφαρμοστέα νομοθεσία.',

    'privacyPolicy.section16.title': '16. Αλλαγές στην παρούσα Πολιτική',
    'privacyPolicy.section16.p1':
      'Ενδέχεται να τροποποιούμε την παρούσα Πολιτική Απορρήτου κατά καιρούς ώστε να αντικατοπτρίζει αλλαγές στη νομοθεσία, τους κανονισμούς, την τεχνολογία, τις επιχειρησιακές λειτουργίες ή τις παρεχόμενες υπηρεσίες. Η ενημερωμένη έκδοση θα δημοσιεύεται σε αυτή τη σελίδα με αναθεωρημένη ημερομηνία έναρξης ισχύος.',
    'privacyPolicy.section16.p2':
      'Η συνέχιση της χρήσης των υπηρεσιών μας μετά την έναρξη ισχύος των αλλαγών μπορεί να συνιστά αναγνώριση της αναθεωρημένης Πολιτικής στον βαθμό που επιτρέπεται από τον νόμο.',

    'privacyPolicy.contact.title': '17. Επικοινωνήστε μαζί μας',
    'privacyPolicy.contact.p1':
      'Ερωτήσεις, αιτήματα και επίσημες ερωτήσεις σχετικά με την ιδιωτικότητα πρέπει να απευθύνονται προς:',
    'privacyPolicy.contact.office': 'Γραφείο Απορρήτου / Υπεύθυνος Προστασίας Δεδομένων',
    'privacyPolicy.contact.address1': '[Εισαγάγετε καταχωρημένη διεύθυνση]',
    'privacyPolicy.contact.address2': '[Εισαγάγετε πόλη, χώρα, ταχυδρομικό κώδικα]',
    'privacyPolicy.contact.email': '[Εισαγάγετε email απορρήτου]',
    'privacyPolicy.contact.phone': '[Εισαγάγετε αριθμό επικοινωνίας]',

    'privacyPolicy.notice.title': '18. Σημαντική ειδοποίηση',
    'privacyPolicy.notice.body':
      'Το παρόν έγγραφο παρέχεται ως γενικό πρότυπο πολιτικής απορρήτου ιστότοπου για χρηματοπιστωτικό ίδρυμα που προσφέρει υπηρεσίες fiat και ψηφιακών περιουσιακών στοιχείων. Θα πρέπει να εξεταστεί και να οριστικοποιηθεί από κατάλληλους νομικούς και συμβούλους συμμόρφωσης πριν από τη δημοσίευση, ώστε να διασφαλιστεί η ευθυγράμμιση με τους νόμους, τους κανονισμούς, το καθεστώς αδειοδότησης, τις γνωστοποιήσεις και το λειτουργικό μοντέλο που ισχύουν για την επιχείρησή σας και τις σχετικές δικαιοδοσίες.',
  },
} as const;

registerTranslations(privacyPolicyTranslations);