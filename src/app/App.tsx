import { useState, createContext, useContext } from "react";
import { useRef, useEffect } from "react";
import {
  MapPin, Search, Star, ChevronRight, ArrowRight, Calendar,
  Menu, X, Clock, Package, Shield, Minus, Plus,
  Mountain, Wind, Layers, LayoutGrid, List,
  Settings, BookOpen, Globe, Check, CheckCircle2, ChevronDown,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Page = "landing" | "communities" | "explore" | "listing" | "collection" | "host" | "about" | "system";
type CommunityId = "runners" | "hikers";

interface Collection {
  id: string;
  tenant: CommunityId;
  kind: "event" | "place";
  title: string;
  summary: string;
  image: string;
  location?: string;
  dateLabel?: string;
  listingIds: string[];
}

interface Listing {
  id: string;
  title: string;
  location: string;
  neighborhood: string;
  price: number;
  rating: number;
  reviews: number;
  host: { name: string; avatar: string; badge: string; [key: string]: string };
  image: string;
  tags: string[];
  highlight: string;
  gear?: string[];
}

// ── i18n ──────────────────────────────────────────────────────────────────────
type Lang = "en" | "fr" | "es";

const TRANSLATIONS = {
  en: {
    "nav.communities": "Communities", "nav.explore": "Explore", "nav.host": "Host",
    "nav.signIn": "Sign in", "nav.startHosting": "Start hosting",
    "nav.switchCommunity": "Switch community", "nav.allCommunities": "All communities",
    "nav.home": "Home", "nav.about": "About",
    "lang.en": "English", "lang.fr": "French", "lang.es": "Spanish",
    "landing.eyebrow": "Affinity-based stays",
    "landing.headline": "Stay with people who get why you're traveling.",
    "landing.subtext": "Runners hosting runners. Hikers hosting hikers. Sojurno connects you to stays inside your community.",
    "landing.searchPlaceholder": "Where are you racing or hiking?",
    "landing.anyDates": "Any dates", "landing.search": "Search",
    "landing.buildCommunity": "Building a community? Start yours on Sojurno",
    "landing.runners.label": "Runners Community",
    "landing.runners.heading": "Race-ready stays, in cities you're running",
    "landing.hikers.label": "Hikers Community",
    "landing.hikers.heading": "Trailhead-close. Gear-ready. Host-guided.",
    "landing.viewAll": "View all",
    "landing.create.eyebrow": "For community builders",
    "landing.create.heading": "Don't see your community here?",
    "landing.create.body": "Cyclists, climbers, open water swimmers — if your group travels with a shared purpose, Sojurno can be home for it.",
    "landing.create.cta": "Create a community",
    "landing.hiw.eyebrow": "How Sojurno works", "landing.hiw.heading": "Belonging, not just booking",
    "landing.hiw.s1.title": "Find your community",
    "landing.hiw.s1.body": "Choose the community that matches why you travel — races, trails, climbs. Each has its own hosts, listings, and shared language.",
    "landing.hiw.s2.title": "Stay with someone who gets it",
    "landing.hiw.s2.body": "Hosts share your context. They know the roads, the trailheads, the gear. They've been in your shoes — sometimes literally.",
    "landing.hiw.s3.title": "Travel with belonging",
    "landing.hiw.s3.body": "Early checkout. Local beta. Gear on loan. The small things that matter enormously when you're traveling with a purpose.",
    "landing.cta.eyebrow": "For community builders",
    "landing.cta.heading": "Your community deserves its own place to stay.",
    "landing.cta.body": "Sojurno is multi-tenant by design. Cyclists, climbers, open water swimmers — if your community travels with shared purpose, we can build a home for it.",
    "landing.cta.btn": "Start a community",
    "communities.eyebrow": "All communities", "communities.heading": "Find your community",
    "communities.subtext": "Each community is a distinct stays experience — same platform, shared context, built for how you travel.",
    "communities.active": "Active", "communities.inDev": "In development", "communities.soon": "Coming soon",
    "communities.listings": "listings", "communities.cities": "cities",
    "communities.noMatch.heading": "Don't see your community?",
    "communities.noMatch.body": "Sojurno is built to host new communities. If you organize people who travel for a shared purpose, we'd like to talk.",
    "communities.startCta": "Start a community",
    "explore.anyLocation": "Any location", "explore.anyDates": "Any dates",
    "explore.raceType": "Race type", "explore.trailType": "Trail type",
    "explore.gearIncluded": "Gear included", "explore.racePerks": "Race perks",
    "explore.recommended": "Recommended", "explore.priceLow": "Price: Low to high",
    "explore.priceHigh": "Price: High to low", "explore.topRated": "Top rated", "explore.stays": "stays",
    "listing.raceAmenities": "Race-day amenities", "listing.trailAmenities": "Trail amenities",
    "listing.hostedBy": "Hosted by", "listing.optionalGear": "Optional gear from host",
    "listing.gearSubtext": "Select gear to include with your stay. No added charge.",
    "listing.hostLent": "Host-lent", "listing.reviews": "Reviews",
    "listing.checkIn": "Check-in", "listing.checkOut": "Check-out", "listing.nights": "Nights",
    "listing.requestBook": "Request to book", "listing.serviceFee": "Community service fee",
    "listing.total": "Total", "listing.perNight": "/ night",
    "listing.flexCheckIn": "Flexible check-in for race day",
    "listing.flexCheckInHike": "Flexible check-in for trail day",
    "listing.verifiedHost": "Verified community host",
    "listing.trustRunners": "Verified community member with race experience.",
    "listing.trustHikers": "Verified community member with backcountry experience.",
    "host.eyebrow": "Host Dashboard", "host.welcome": "Welcome back",
    "host.staysCompleted": "stays completed", "host.thisMonth": "This month",
    "host.avgRating": "Avg rating", "host.responseRate": "Response rate",
    "host.repeatGuests": "Repeat guests", "host.staysSub": "stays",
    "host.reviews": "reviews", "host.responseAvg": "< 2hr avg", "host.ofTotal": "of total",
    "host.reservations": "Reservations", "host.requests": "Requests", "host.listings": "Listings",
    "host.confirmed": "confirmed", "host.pending": "pending", "host.nights": "nights",
    "host.decline": "Decline", "host.accept": "Accept",
    "host.wantsToStay": "wants to stay", "host.prevStays": "previous Sojurno stays",
    "host.active": "Active", "host.addListing": "Add listing",
    "about.eyebrow": "Building Sojurno", "about.heading": "About the maker",
    "about.bio": "Sojurno is being designed and built by a UX designer and front-end engineer with a focus on consumer marketplace products, affinity communities, and hospitality-grade interaction design. The goal is to prove that a community-first stays platform can match the polish and trust of the best consumer apps in the market.",
    "about.launchNote": "At product launch, this section will introduce the Sojurno team, founding story, and mission. For now it reflects the solo design + engineering effort behind this prototype.",
    "about.builderResources": "Builder resources",
    "about.builderSubtext": "Internal tooling for designing and extending Sojurno communities.",
    "about.openSystem": "Open full design system reference",
    "system.eyebrow": "Builder tools", "system.heading": "Design system",
    "system.subtext": "Component library, tokens, and patterns for building community experiences on Sojurno's shared platform.",
    "system.tokens": "Community color tokens", "system.typography": "Typography scale",
    "footer.tagline": "Affinity-based stays for communities that travel with purpose.",
    "footer.product": "Product", "footer.about": "About", "footer.legal": "Legal",
    "footer.communities": "Communities", "footer.exploreStays": "Explore stays",
    "footer.startHosting": "Start hosting", "footer.createCommunity": "Create a community",
    "footer.aboutUs": "About us", "footer.designSystem": "Design system",
    "footer.privacy": "Privacy policy", "footer.terms": "Terms of service",
    "footer.accessibility": "Accessibility", "footer.copyright": "© 2025 Sojurno, Inc.",
    "footer.moreComing": "+ more coming",
    "collections.race": "Race", "collections.trail": "Trail",
    "collections.stayNear": "stay near this", "collections.staysNear": "stays near this",
    "collections.raceDestination": "race", "collections.trailDestination": "destination",
    "collections.noStays": "No stays listed for this collection yet.",
  },
  fr: {
    "nav.communities": "Communautés", "nav.explore": "Explorer", "nav.host": "Héberger",
    "nav.signIn": "Se connecter", "nav.startHosting": "Proposer un logement",
    "nav.switchCommunity": "Changer de communauté", "nav.allCommunities": "Toutes les communautés",
    "nav.home": "Accueil", "nav.about": "À propos",
    "lang.en": "English", "lang.fr": "Français", "lang.es": "Español",
    "landing.eyebrow": "Séjours par affinité",
    "landing.headline": "Séjournez chez des personnes qui comprennent pourquoi vous voyagez.",
    "landing.subtext": "Des coureurs qui accueillent des coureurs. Des randonneurs qui accueillent des randonneurs. Sojurno vous connecte à des logements au sein de votre communauté.",
    "landing.searchPlaceholder": "Où courez-vous ou randonnez-vous ?",
    "landing.anyDates": "Toutes dates", "landing.search": "Rechercher",
    "landing.buildCommunity": "Vous créez une communauté ? Lancez-la sur Sojurno",
    "landing.runners.label": "Communauté Coureurs",
    "landing.runners.heading": "Des logements prêts pour la course, dans vos villes de compétition",
    "landing.hikers.label": "Communauté Randonneurs",
    "landing.hikers.heading": "Près des sentiers. Équipé. Guidé par votre hôte.",
    "landing.viewAll": "Voir tout",
    "landing.create.eyebrow": "Pour les créateurs de communauté",
    "landing.create.heading": "Votre communauté n'est pas là ?",
    "landing.create.body": "Cyclistes, grimpeurs, nageurs en eau libre — si votre groupe voyage avec un objectif commun, Sojurno peut être votre maison.",
    "landing.create.cta": "Créer une communauté",
    "landing.hiw.eyebrow": "Comment fonctionne Sojurno", "landing.hiw.heading": "L'appartenance, pas seulement la réservation",
    "landing.hiw.s1.title": "Trouvez votre communauté",
    "landing.hiw.s1.body": "Choisissez la communauté qui correspond à vos raisons de voyager — courses, sentiers, ascensions. Chacune a ses propres hôtes, logements et langage partagé.",
    "landing.hiw.s2.title": "Séjournez chez quelqu'un qui comprend",
    "landing.hiw.s2.body": "Les hôtes partagent votre contexte. Ils connaissent les routes, les départs de sentiers, l'équipement. Ils ont été à votre place — parfois littéralement.",
    "landing.hiw.s3.title": "Voyagez avec un sentiment d'appartenance",
    "landing.hiw.s3.body": "Départ anticipé. Conseils locaux. Matériel en prêt. Les petits détails qui comptent énormément quand on voyage avec un but.",
    "landing.cta.eyebrow": "Pour les créateurs de communauté",
    "landing.cta.heading": "Votre communauté mérite son propre espace.",
    "landing.cta.body": "Sojurno est conçu multi-tenant. Cyclistes, grimpeurs, nageurs — si votre communauté voyage avec un objectif commun, nous pouvons lui créer un espace.",
    "landing.cta.btn": "Démarrer une communauté",
    "communities.eyebrow": "Toutes les communautés", "communities.heading": "Trouvez votre communauté",
    "communities.subtext": "Chaque communauté est une expérience de séjour unique — même plateforme, contexte partagé, conçu pour votre façon de voyager.",
    "communities.active": "Active", "communities.inDev": "En développement", "communities.soon": "Bientôt disponible",
    "communities.listings": "logements", "communities.cities": "villes",
    "communities.noMatch.heading": "Votre communauté n'est pas là ?",
    "communities.noMatch.body": "Sojurno est conçu pour accueillir de nouvelles communautés. Si vous organisez des personnes qui voyagent avec un objectif commun, contactez-nous.",
    "communities.startCta": "Démarrer une communauté",
    "explore.anyLocation": "N'importe où", "explore.anyDates": "Toutes dates",
    "explore.raceType": "Type de course", "explore.trailType": "Type de sentier",
    "explore.gearIncluded": "Équipement inclus", "explore.racePerks": "Avantages course",
    "explore.recommended": "Recommandé", "explore.priceLow": "Prix : croissant",
    "explore.priceHigh": "Prix : décroissant", "explore.topRated": "Mieux notés", "explore.stays": "logements",
    "listing.raceAmenities": "Équipements jour de course", "listing.trailAmenities": "Équipements randonnée",
    "listing.hostedBy": "Hébergé par", "listing.optionalGear": "Équipement optionnel de l'hôte",
    "listing.gearSubtext": "Sélectionnez l'équipement à inclure. Sans supplément.",
    "listing.hostLent": "Prêt hôte", "listing.reviews": "Avis",
    "listing.checkIn": "Arrivée", "listing.checkOut": "Départ", "listing.nights": "Nuits",
    "listing.requestBook": "Demander à réserver", "listing.serviceFee": "Frais de service communautaire",
    "listing.total": "Total", "listing.perNight": "/ nuit",
    "listing.flexCheckIn": "Arrivée flexible pour le jour de course",
    "listing.flexCheckInHike": "Arrivée flexible pour le jour de randonnée",
    "listing.verifiedHost": "Hôte communautaire vérifié",
    "listing.trustRunners": "Membre vérifié avec expérience en course.",
    "listing.trustHikers": "Membre vérifié avec expérience en milieu naturel.",
    "host.eyebrow": "Tableau de bord hôte", "host.welcome": "Bienvenue",
    "host.staysCompleted": "séjours complétés", "host.thisMonth": "Ce mois",
    "host.avgRating": "Note moyenne", "host.responseRate": "Taux de réponse",
    "host.repeatGuests": "Voyageurs récurrents", "host.staysSub": "séjours",
    "host.reviews": "avis", "host.responseAvg": "< 2h en moy.", "host.ofTotal": "du total",
    "host.reservations": "Réservations", "host.requests": "Demandes", "host.listings": "Logements",
    "host.confirmed": "confirmé", "host.pending": "en attente", "host.nights": "nuits",
    "host.decline": "Refuser", "host.accept": "Accepter",
    "host.wantsToStay": "veut séjourner", "host.prevStays": "séjours Sojurno précédents",
    "host.active": "Actif", "host.addListing": "Ajouter un logement",
    "about.eyebrow": "Création de Sojurno", "about.heading": "À propos du créateur",
    "about.bio": "Sojurno est conçu et développé par un designer UX et ingénieur front-end spécialisé dans les produits de marketplace, les communautés d'affinité et la conception d'interactions de qualité hôtelière. L'objectif est de prouver qu'une plateforme centrée sur la communauté peut rivaliser avec les meilleures applications grand public.",
    "about.launchNote": "Au lancement, cette section présentera l'équipe Sojurno, l'histoire fondatrice et la mission. Pour l'instant, elle reflète l'effort solo de design et d'ingénierie derrière ce prototype.",
    "about.builderResources": "Ressources pour les créateurs",
    "about.builderSubtext": "Outils internes pour concevoir et étendre les communautés Sojurno.",
    "about.openSystem": "Ouvrir la référence complète du système de design",
    "system.eyebrow": "Outils créateurs", "system.heading": "Système de design",
    "system.subtext": "Bibliothèque de composants, jetons et patterns pour créer des expériences communautaires sur la plateforme Sojurno.",
    "system.tokens": "Jetons de couleur communautaire", "system.typography": "Échelle typographique",
    "footer.tagline": "Séjours par affinité pour les communautés qui voyagent avec un objectif.",
    "footer.product": "Produit", "footer.about": "À propos", "footer.legal": "Mentions légales",
    "footer.communities": "Communautés", "footer.exploreStays": "Explorer les logements",
    "footer.startHosting": "Commencer à héberger", "footer.createCommunity": "Créer une communauté",
    "footer.aboutUs": "À propos", "footer.designSystem": "Système de design",
    "footer.privacy": "Confidentialité", "footer.terms": "Conditions d'utilisation",
    "footer.accessibility": "Accessibilité", "footer.copyright": "© 2025 Sojurno, Inc.",
    "footer.moreComing": "+ d'autres à venir",
    "collections.race": "Course", "collections.trail": "Sentier",
    "collections.stayNear": "logement près de", "collections.staysNear": "logements près de",
    "collections.raceDestination": "cette course", "collections.trailDestination": "cette destination",
    "collections.noStays": "Aucun logement répertorié pour cette collection.",
  },
  es: {
    "nav.communities": "Comunidades", "nav.explore": "Explorar", "nav.host": "Alojar",
    "nav.signIn": "Iniciar sesión", "nav.startHosting": "Empezar a alojar",
    "nav.switchCommunity": "Cambiar comunidad", "nav.allCommunities": "Todas las comunidades",
    "nav.home": "Inicio", "nav.about": "Acerca de",
    "lang.en": "English", "lang.fr": "Français", "lang.es": "Español",
    "landing.eyebrow": "Estancias por afinidad",
    "landing.headline": "Quédate con personas que entienden por qué viajas.",
    "landing.subtext": "Corredores que hospedan a corredores. Senderistas que hospedan a senderistas. Sojurno te conecta con alojamientos dentro de tu comunidad.",
    "landing.searchPlaceholder": "¿Dónde corres o haces senderismo?",
    "landing.anyDates": "Cualquier fecha", "landing.search": "Buscar",
    "landing.buildCommunity": "¿Creando una comunidad? Lánzala en Sojurno",
    "landing.runners.label": "Comunidad Corredores",
    "landing.runners.heading": "Alojamientos listos para la carrera, en las ciudades donde compites",
    "landing.hikers.label": "Comunidad Senderistas",
    "landing.hikers.heading": "Cerca del sendero. Con equipo listo. Guiado por tu anfitrión.",
    "landing.viewAll": "Ver todo",
    "landing.create.eyebrow": "Para creadores de comunidad",
    "landing.create.heading": "¿No ves tu comunidad aquí?",
    "landing.create.body": "Ciclistas, escaladores, nadadores — si tu grupo viaja con un propósito compartido, Sojurno puede ser su hogar.",
    "landing.create.cta": "Crear una comunidad",
    "landing.hiw.eyebrow": "Cómo funciona Sojurno", "landing.hiw.heading": "Pertenencia, no solo reservas",
    "landing.hiw.s1.title": "Encuentra tu comunidad",
    "landing.hiw.s1.body": "Elige la comunidad que coincide con tus razones para viajar — carreras, senderos, escaladas. Cada una tiene sus propios anfitriones, alojamientos y lenguaje compartido.",
    "landing.hiw.s2.title": "Quédate con alguien que lo entiende",
    "landing.hiw.s2.body": "Los anfitriones comparten tu contexto. Conocen las rutas, los accesos a senderos, el equipo. Han estado en tu lugar — a veces literalmente.",
    "landing.hiw.s3.title": "Viaja con sentido de pertenencia",
    "landing.hiw.s3.body": "Salida anticipada. Información local. Equipo prestado. Los pequeños detalles que importan enormemente cuando viajas con un propósito.",
    "landing.cta.eyebrow": "Para creadores de comunidad",
    "landing.cta.heading": "Tu comunidad merece su propio espacio para alojarse.",
    "landing.cta.body": "Sojurno está diseñado como multi-tenant. Ciclistas, escaladores, nadadores — si tu comunidad viaja con un propósito compartido, podemos crear un hogar para ella.",
    "landing.cta.btn": "Iniciar una comunidad",
    "communities.eyebrow": "Todas las comunidades", "communities.heading": "Encuentra tu comunidad",
    "communities.subtext": "Cada comunidad es una experiencia de estancia única — misma plataforma, contexto compartido, diseñada para tu forma de viajar.",
    "communities.active": "Activa", "communities.inDev": "En desarrollo", "communities.soon": "Próximamente",
    "communities.listings": "alojamientos", "communities.cities": "ciudades",
    "communities.noMatch.heading": "¿No ves tu comunidad?",
    "communities.noMatch.body": "Sojurno está diseñado para albergar nuevas comunidades. Si organizas personas que viajan con un propósito compartido, nos gustaría hablar.",
    "communities.startCta": "Iniciar una comunidad",
    "explore.anyLocation": "Cualquier lugar", "explore.anyDates": "Cualquier fecha",
    "explore.raceType": "Tipo de carrera", "explore.trailType": "Tipo de sendero",
    "explore.gearIncluded": "Equipo incluido", "explore.racePerks": "Ventajas carrera",
    "explore.recommended": "Recomendado", "explore.priceLow": "Precio: menor a mayor",
    "explore.priceHigh": "Precio: mayor a menor", "explore.topRated": "Mejor valorados", "explore.stays": "alojamientos",
    "listing.raceAmenities": "Servicios día de carrera", "listing.trailAmenities": "Servicios senderismo",
    "listing.hostedBy": "Alojado por", "listing.optionalGear": "Equipo opcional del anfitrión",
    "listing.gearSubtext": "Selecciona el equipo a incluir en tu estancia. Sin cargo adicional.",
    "listing.hostLent": "Prestado por anfitrión", "listing.reviews": "Reseñas",
    "listing.checkIn": "Entrada", "listing.checkOut": "Salida", "listing.nights": "Noches",
    "listing.requestBook": "Solicitar reserva", "listing.serviceFee": "Tarifa de servicio comunitario",
    "listing.total": "Total", "listing.perNight": "/ noche",
    "listing.flexCheckIn": "Entrada flexible para el día de carrera",
    "listing.flexCheckInHike": "Entrada flexible para el día de senderismo",
    "listing.verifiedHost": "Anfitrión comunitario verificado",
    "listing.trustRunners": "Miembro verificado con experiencia en carreras.",
    "listing.trustHikers": "Miembro verificado con experiencia al aire libre.",
    "host.eyebrow": "Panel del anfitrión", "host.welcome": "Bienvenida",
    "host.staysCompleted": "estancias completadas", "host.thisMonth": "Este mes",
    "host.avgRating": "Valoración media", "host.responseRate": "Tasa de respuesta",
    "host.repeatGuests": "Huéspedes recurrentes", "host.staysSub": "estancias",
    "host.reviews": "reseñas", "host.responseAvg": "< 2h promedio", "host.ofTotal": "del total",
    "host.reservations": "Reservas", "host.requests": "Solicitudes", "host.listings": "Alojamientos",
    "host.confirmed": "confirmada", "host.pending": "pendiente", "host.nights": "noches",
    "host.decline": "Rechazar", "host.accept": "Aceptar",
    "host.wantsToStay": "quiere alojarse", "host.prevStays": "estancias anteriores en Sojurno",
    "host.active": "Activo", "host.addListing": "Añadir alojamiento",
    "about.eyebrow": "Construyendo Sojurno", "about.heading": "Sobre el creador",
    "about.bio": "Sojurno está siendo diseñado y desarrollado por un diseñador UX e ingeniero front-end especializado en productos de marketplace, comunidades de afinidad y diseño de interacciones de calidad hotelera. El objetivo es demostrar que una plataforma de estancias centrada en la comunidad puede igualar el nivel de las mejores aplicaciones de consumo.",
    "about.launchNote": "En el lanzamiento, esta sección presentará al equipo de Sojurno, la historia fundacional y la misión. Por ahora refleja el esfuerzo individual de diseño e ingeniería detrás de este prototipo.",
    "about.builderResources": "Recursos para creadores",
    "about.builderSubtext": "Herramientas internas para diseñar y ampliar comunidades en Sojurno.",
    "about.openSystem": "Abrir referencia completa del sistema de diseño",
    "system.eyebrow": "Herramientas para creadores", "system.heading": "Sistema de diseño",
    "system.subtext": "Biblioteca de componentes, tokens y patrones para crear experiencias comunitarias en la plataforma compartida de Sojurno.",
    "system.tokens": "Tokens de color comunitario", "system.typography": "Escala tipográfica",
    "footer.tagline": "Estancias por afinidad para comunidades que viajan con propósito.",
    "footer.product": "Producto", "footer.about": "Acerca de", "footer.legal": "Legal",
    "footer.communities": "Comunidades", "footer.exploreStays": "Explorar alojamientos",
    "footer.startHosting": "Empezar a alojar", "footer.createCommunity": "Crear una comunidad",
    "footer.aboutUs": "Acerca de nosotros", "footer.designSystem": "Sistema de diseño",
    "footer.privacy": "Política de privacidad", "footer.terms": "Términos de servicio",
    "footer.accessibility": "Accesibilidad", "footer.copyright": "© 2025 Sojurno, Inc.",
    "footer.moreComing": "+ más próximamente",
    "collections.race": "Carrera", "collections.trail": "Sendero",
    "collections.stayNear": "alojamiento cerca de", "collections.staysNear": "alojamientos cerca de",
    "collections.raceDestination": "esta carrera", "collections.trailDestination": "este destino",
    "collections.noStays": "Aún no hay alojamientos para esta colección.",
  },
} as const;

type TKey = keyof typeof TRANSLATIONS.en;

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TKey) => string;
}>({ lang: "en", setLang: () => {}, t: (k) => k });

const useLang = () => useContext(LangContext);

// ── Language Switcher ─────────────────────────────────────────────────────────
function LangSwitcher() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const langs: { id: Lang; label: string; code: string }[] = [
    { id: "en", label: t("lang.en"), code: "EN" },
    { id: "fr", label: t("lang.fr"), code: "FR" },
    { id: "es", label: t("lang.es"), code: "ES" },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="font-medium">{lang.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-44 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50" role="listbox">
          {langs.map(({ id, label, code }) => (
            <button
              key={id}
              role="option"
              aria-selected={lang === id}
              onClick={() => { setLang(id); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-muted/60 ${lang === id ? "text-foreground font-semibold" : "text-muted-foreground"}`}
            >
              <span>{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">{code}</span>
                {lang === id && <Check className="w-3.5 h-3.5 text-foreground" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const RUNNER_LISTINGS: Listing[] = [
  {
    id: "r1",
    title: "Light-filled studio, half-block from race day bag check",
    location: "Boston, MA",
    neighborhood: "Back Bay",
    price: 112,
    rating: 4.97,
    reviews: 63,
    host: { name: "Priya S.", avatar: "photo-1494790108377-be9c29b29330", badge: "26 marathons", pace: "3:28 PR" },
    image: "photo-1522708323590-d24dbb6b0267",
    tags: ["4am checkout ok", "Gear storage", "Race bag included"],
    highlight: "Priya knows every early coffee shop near the Boylston finish.",
  },
  {
    id: "r2",
    title: "Quiet brownstone room, steps from Prospect Park loop",
    location: "Brooklyn, NY",
    neighborhood: "Park Slope",
    price: 95,
    rating: 4.91,
    reviews: 38,
    host: { name: "Jordan K.", avatar: "photo-1507003211169-0a1dd7228f2d", badge: "NYC Marathon pacer", pace: "3:55 PR" },
    image: "photo-1586023492125-27b2c045efd7",
    tags: ["6am key access", "Foam roller", "Strava routes"],
    highlight: "Jordan has paced the NYC Marathon six times. He knows every borough.",
  },
  {
    id: "r3",
    title: "Modern flat, 3 blocks from Chicago Marathon finish line",
    location: "Chicago, IL",
    neighborhood: "Grant Park",
    price: 138,
    rating: 4.89,
    reviews: 51,
    host: { name: "Mei L.", avatar: "photo-1438761681033-6461ffad8d80", badge: "Boston Qualifier", pace: "3:41 PR" },
    image: "photo-1502672260266-1c1ef2d93688",
    tags: ["Late checkout", "Recovery toolkit", "Nutrition station"],
    highlight: "Mei qualified for Boston three years running — literally.",
  },
  {
    id: "r4",
    title: "Serene guest suite near Crissy Field trail network",
    location: "San Francisco, CA",
    neighborhood: "Marina District",
    price: 149,
    rating: 4.95,
    reviews: 29,
    host: { name: "Daniel R.", avatar: "photo-1506794778202-cad84cf45f1d", badge: "Ultra runner", pace: "50K finisher" },
    image: "photo-1484154218962-a197022b5858",
    tags: ["Trail maps", "Pre-dawn kitchen", "Foam roller"],
    highlight: "Daniel keeps the kitchen stocked for recovery. No questions asked.",
  },
];

const HIKER_LISTINGS: Listing[] = [
  {
    id: "h1",
    title: "Timber cabin, 8 min drive to JMT trailhead",
    location: "Lone Pine, CA",
    neighborhood: "Eastern Sierra",
    price: 87,
    rating: 4.98,
    reviews: 84,
    host: { name: "Sam O.", avatar: "photo-1547425260-76bcadfb4f2c", badge: "JMT thru-hiker ×3", experience: "12 yrs backcountry" },
    image: "photo-1464822759023-fed622ff2c3b",
    tags: ["Bear canisters included", "Trekking poles", "Resupply storage"],
    highlight: "Sam has completed the JMT three times and can prep your resupply box.",
    gear: ["Bear canister", "Trekking poles (pair)", "Camp stove + fuel", "Headlamp", "Map set"],
  },
  {
    id: "h2",
    title: "Converted barn loft near Appalachian trailhead",
    location: "Harpers Ferry, WV",
    neighborhood: "Blue Ridge",
    price: 72,
    rating: 4.93,
    reviews: 61,
    host: { name: "Rene F.", avatar: "photo-1534528741775-53994a69daeb", badge: "AT section hiker", experience: "8 yrs hiking" },
    image: "photo-1449824913935-59a10b8d2000",
    tags: ["Gear drying room", "Trailhead shuttle", "Trail beta"],
    highlight: "Rene offers a gear drying room and will drive you to the trailhead at dawn.",
    gear: ["Trekking poles", "Water filter", "First aid kit", "Map set"],
  },
  {
    id: "h3",
    title: "Rustic guest house, Olympic Peninsula basecamp",
    location: "Port Angeles, WA",
    neighborhood: "Olympic NP gateway",
    price: 94,
    rating: 4.88,
    reviews: 42,
    host: { name: "Kai B.", avatar: "photo-1500648767791-00dcc994a43e", badge: "Olympic NP ranger (ret.)", experience: "20 yrs backcountry" },
    image: "photo-1510798831971-661eb04b3739",
    tags: ["GPS unit loaner", "Waterproof gear", "Permit assistance"],
    highlight: "Kai spent 20 years as a ranger in Olympic. He's a human trail guide.",
    gear: ["GPS unit", "Bear spray", "Rain gear set", "Trekking poles"],
  },
  {
    id: "h4",
    title: "Modern cabin, gateway to Glacier NP trails",
    location: "West Glacier, MT",
    neighborhood: "North Fork",
    price: 118,
    rating: 4.94,
    reviews: 37,
    host: { name: "Lily C.", avatar: "photo-1580489944761-15a19d654956", badge: "Glacier guide", experience: "14 yrs guiding" },
    image: "photo-1464822759023-fed622ff2c3b",
    tags: ["Bear country prep", "Shuttle available", "Gear library"],
    highlight: "Lily has guided in Glacier for 14 seasons. She'll have you fully prepared.",
    gear: ["Bear canister", "Trekking poles", "Water filter", "Camp stove"],
  },
];

const RUNNER_COLLECTIONS: Collection[] = [
  {
    id: "rc1",
    tenant: "runners",
    kind: "event",
    title: "Boston Marathon",
    summary: "The world's oldest annual marathon. Heartbreak Hill, the Boylston finish, and a city that shows up.",
    image: "photo-1571019613454-1cb2f99b2d8b",
    location: "Boston, MA",
    dateLabel: "Apr 21, 2026",
    listingIds: ["r1"],
  },
  {
    id: "rc2",
    tenant: "runners",
    kind: "event",
    title: "NYC Marathon",
    summary: "Five boroughs. Fifty thousand runners. The loudest race on earth.",
    image: "photo-1452626038306-9aae5b3d8f32",
    location: "New York, NY",
    dateLabel: "Nov 1, 2026",
    listingIds: ["r2"],
  },
  {
    id: "rc3",
    tenant: "runners",
    kind: "event",
    title: "Chicago Marathon",
    summary: "A fast, flat course through the city's best neighbourhoods. A PR favourite.",
    image: "photo-1502672260266-1c1ef2d93688",
    location: "Chicago, IL",
    dateLabel: "Oct 11, 2026",
    listingIds: ["r3"],
  },
  {
    id: "rc4",
    tenant: "runners",
    kind: "event",
    title: "San Francisco Marathon",
    summary: "Over the Golden Gate, through the Presidio. Stunning and unforgiving.",
    image: "photo-1484154218962-a197022b5858",
    location: "San Francisco, CA",
    dateLabel: "Jul 26, 2026",
    listingIds: ["r4"],
  },
];

const HIKER_COLLECTIONS: Collection[] = [
  {
    id: "hc1",
    tenant: "hikers",
    kind: "place",
    title: "John Muir Trail",
    summary: "211 miles through the High Sierra. The benchmark thru-hike of the American West.",
    image: "photo-1464822759023-fed622ff2c3b",
    location: "Eastern Sierra, CA",
    listingIds: ["h1"],
  },
  {
    id: "hc2",
    tenant: "hikers",
    kind: "place",
    title: "Appalachian Trail",
    summary: "2,190 miles of ridgeline from Georgia to Maine. Section hikers welcome.",
    image: "photo-1449824913935-59a10b8d2000",
    location: "Blue Ridge, WV",
    listingIds: ["h2"],
  },
  {
    id: "hc3",
    tenant: "hikers",
    kind: "place",
    title: "Olympic National Park",
    summary: "Rainforest, alpine meadows, and a wild Pacific coastline — all in one park.",
    image: "photo-1510798831971-661eb04b3739",
    location: "Olympic Peninsula, WA",
    listingIds: ["h3"],
  },
  {
    id: "hc4",
    tenant: "hikers",
    kind: "place",
    title: "Glacier National Park",
    summary: "Going-to-the-Sun Road, grizzly country, and 700 miles of maintained trail.",
    image: "photo-1506905925346-21bda4d32df4",
    location: "West Glacier, MT",
    listingIds: ["h4"],
  },
];

function getCollectionsByTenant(tenant: CommunityId): Collection[] {
  return tenant === "runners" ? RUNNER_COLLECTIONS : HIKER_COLLECTIONS;
}

function getCollection(id: string): Collection | undefined {
  return [...RUNNER_COLLECTIONS, ...HIKER_COLLECTIONS].find((c) => c.id === id);
}

const COMMUNITIES = [
  {
    id: "runners" as CommunityId,
    name: "Runners",
    tagline: "Stay close to the start line. Stay with someone who's been there.",
    description: "Race-day logistics, local route knowledge, and early-morning readiness from hosts who've run the same roads.",
    listings: 847,
    cities: 62,
    color: "#E8651A",
    lightBg: "#FEF3EC",
    image: "photo-1571019613454-1cb2f99b2d8b",
    tags: ["Marathon", "Half marathon", "Trail race", "Ultra"],
    active: true,
    capabilities: { collections: true },
    collectionsLabel: "Upcoming races",
  },
  {
    id: "hikers" as CommunityId,
    name: "Hikers",
    tagline: "Trail knowledge, loaner gear, and hosts who've done the miles.",
    description: "Trailhead proximity, optional gear lending, and hard-won host wisdom for day hikes and multi-day expeditions.",
    listings: 412,
    cities: 38,
    color: "#2D6A4F",
    lightBg: "#EEFAF4",
    image: "photo-1551632811-561732d1e306",
    tags: ["Day hike", "Backpacking", "Thru-hike", "Peak bagging"],
    active: true,
    capabilities: { collections: true },
    collectionsLabel: "Trails & parks",
  },
  {
    id: "cyclists" as CommunityId,
    name: "Cyclists",
    tagline: "Stays that understand a 5am departure and a muddy kit.",
    description: "Secure bike storage, ride intel, and hosts who think in watts per kilo.",
    listings: 0,
    cities: 0,
    color: "#1A56DB",
    lightBg: "#EFF6FF",
    image: "photo-1558618666-fcd25c85cd64",
    active: false,
    capabilities: { collections: false },
    collectionsLabel: "",
  },
  {
    id: "climbers" as CommunityId,
    name: "Climbers",
    tagline: "Near the crag. Hosted by people who know the grades.",
    description: "Approach intel, gear storage, and community beta from hosts who know the routes.",
    listings: 0,
    cities: 0,
    color: "#9333EA",
    lightBg: "#FAF5FF",
    image: "photo-1522163182402-834f871fd851",
    active: false,
    capabilities: { collections: false },
    collectionsLabel: "",
  },
];

// ── Utilities ─────────────────────────────────────────────────────────────────
function unsplash(id: string, w: number, h: number) {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}

function getCommunity(id: CommunityId) {
  return COMMUNITIES.find((c) => c.id === id)!;
}

// ── Micro Components ──────────────────────────────────────────────────────────
function StarRating({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="flex items-center gap-1 text-xs">
      <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
      <span className="font-semibold text-foreground">{rating}</span>
      {reviews !== undefined && <span className="text-muted-foreground">({reviews})</span>}
    </span>
  );
}

function CommunityPill({ id }: { id: CommunityId }) {
  const c = getCommunity(id);
  return (
    <span
      className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ color: c.color, backgroundColor: c.lightBg }}
    >
      {c.name}
    </span>
  );
}

// ── Collection Card ───────────────────────────────────────────────────────────
function CollectionCard({
  collection,
  onClick,
}: {
  collection: Collection;
  onClick: () => void;
}) {
  const { t } = useLang();
  const c = getCommunity(collection.tenant);
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-shrink-0 w-44 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl group"
      aria-label={`View ${collection.title}`}
    >
      <div className={`rounded-2xl overflow-hidden border bg-card transition-all duration-200 ${hovered ? "shadow-lg border-border -translate-y-0.5" : "shadow-sm border-border/60"}`}>
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          <img
            src={unsplash(collection.image, 360, 480)}
            alt={collection.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? "scale-105" : "scale-100"}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute top-2.5 left-2.5">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ color: c.color, backgroundColor: c.lightBg }}
            >
              {collection.kind === "event" ? t("collections.race") : t("collections.trail")}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white text-sm font-semibold leading-snug line-clamp-2">{collection.title}</p>
            <p className="text-white/70 text-xs mt-0.5">
              {collection.kind === "event" && collection.dateLabel
                ? collection.dateLabel
                : collection.location}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Collection Rail ────────────────────────────────────────────────────────────
function CollectionRail({
  community,
  onSelectCollection,
}: {
  community: CommunityId;
  onSelectCollection: (id: string) => void;
}) {
  const { t } = useLang();
  const c = getCommunity(community);
  const collections = getCollectionsByTenant(community);

  if (!c.capabilities?.collections || collections.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
          <h2 className="text-base font-semibold text-foreground">{c.collectionsLabel}</h2>
        </div>
        <button className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          {t("landing.viewAll")} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 sm:px-6 pb-2 scrollbar-hide snap-x snap-mandatory">
        {collections.map((col) => (
          <div key={col.id} className="snap-start">
            <CollectionCard
              collection={col}
              onClick={() => onSelectCollection(col.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Listing Card ──────────────────────────────────────────────────────────────
function ListingCard({
  listing,
  community,
  onClick,
}: {
  listing: Listing;
  community: CommunityId;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const c = getCommunity(community);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
      aria-label={`View ${listing.title}`}
    >
      <div
        className={`rounded-2xl overflow-hidden border bg-card transition-all duration-200 flex flex-col h-full ${
          hovered ? "shadow-xl border-border -translate-y-0.5" : "shadow-sm border-border/60"
        }`}
      >
        <div className="relative aspect-[4/3] bg-muted overflow-hidden flex-shrink-0">
          <img
            src={unsplash(listing.image, 600, 450)}
            alt={listing.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${hovered ? "scale-105" : "scale-100"}`}
          />
          <div className="absolute top-3 left-3">
            <CommunityPill id={community} />
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 min-h-[2.5rem]">{listing.title}</h3>
            <div className="flex-shrink-0 pt-0.5">
              <StarRating rating={listing.rating} reviews={listing.reviews} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {listing.neighborhood} · {listing.location}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {listing.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-auto space-y-2">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={unsplash(listing.host.avatar, 40, 40)}
                alt={listing.host.name}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
              <span className="text-xs text-muted-foreground truncate">{listing.host.name}</span>
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded-md flex-shrink-0"
                style={{ color: c.color, backgroundColor: c.lightBg }}
              >
                {listing.host.badge}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-px flex-1 bg-border/60 mr-3" />
              <span className="text-sm font-semibold text-foreground flex-shrink-0">${listing.price}</span>
              <span className="text-xs text-muted-foreground"> / night</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Community Dropdown ────────────────────────────────────────────────────────
function CommunityDropdown({
  activeCommunity,
  setActiveCommunity,
  setPage,
}: {
  activeCommunity: CommunityId;
  setActiveCommunity: (c: CommunityId) => void;
  setPage: (p: Page) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const c = getCommunity(activeCommunity);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="hidden sm:block relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border border-border/70 rounded-xl px-3 py-2 text-sm hover:bg-muted/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
        <span className="font-medium text-foreground">{c.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="px-3 pt-3 pb-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">Switch community</p>
          </div>
          <div className="px-2 pb-2" role="listbox">
            {COMMUNITIES.map((community) => {
              const isActive = activeCommunity === community.id && community.active;
              return (
                <button
                  key={community.id}
                  role="option"
                  aria-selected={activeCommunity === community.id}
                  disabled={!community.active}
                  onClick={() => {
                    if (!community.active) return;
                    setActiveCommunity(community.id);
                    setPage("explore");
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    community.active
                      ? "hover:bg-muted/60 cursor-pointer"
                      : "opacity-40 cursor-default"
                  } ${isActive ? "bg-muted/60" : ""}`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: community.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">{community.name}</span>
                    {community.active ? (
                      <span className="text-xs text-muted-foreground ml-2">
                        {community.listings.toLocaleString()} stays
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground ml-2">Coming soon</span>
                    )}
                  </div>
                  {isActive && (
                    <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: community.color }} />
                  )}
                </button>
              );
            })}
          </div>
          <div className="border-t border-border/60 px-3 py-2.5">
            <button
              onClick={() => { setPage("communities"); setOpen(false); }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-3 h-3" />
              All communities
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav({
  page,
  setPage,
  activeCommunity,
  setActiveCommunity,
}: {
  page: Page;
  setPage: (p: Page) => void;
  activeCommunity: CommunityId;
  setActiveCommunity: (c: CommunityId) => void;
}) {
  const { t } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isExploreContext = page === "explore" || page === "listing";

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <button
          onClick={() => setPage("landing")}
          className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <span
            className="text-xl tracking-tight"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}
          >
            Sojurno
          </span>
        </button>

        {isExploreContext && (
          <CommunityDropdown
            activeCommunity={activeCommunity}
            setActiveCommunity={setActiveCommunity}
            setPage={setPage}
          />
        )}

        <div className="hidden sm:flex items-center gap-1 ml-auto">
          {(
            [
              { label: t("nav.communities"), page: "communities" as Page },
              { label: t("nav.explore"), page: "explore" as Page },
              { label: t("nav.host"), page: "host" as Page },
            ] as { label: string; page: Page }[]
          ).map(({ label, page: p }) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                page === p ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
          <div className="w-px h-5 bg-border mx-2" />
          <LangSwitcher />
          <div className="w-px h-5 bg-border mx-2" />
          <button className="text-sm px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted/60 transition-colors font-medium">
            {t("nav.signIn")}
          </button>
          <button className="text-sm px-4 py-2 rounded-xl text-white font-semibold transition-opacity hover:opacity-90 bg-foreground">
            {t("nav.startHosting")}
          </button>
        </div>

        <button
          className="sm:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="sm:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-1">
          {[
            { p: "landing" as Page, label: t("nav.home") },
            { p: "communities" as Page, label: t("nav.communities") },
            { p: "explore" as Page, label: t("nav.explore") },
            { p: "host" as Page, label: t("nav.host") },
            { p: "about" as Page, label: t("nav.about") },
          ].map(({ p, label }) => (
            <button
              key={p}
              onClick={() => { setPage(p); setMobileOpen(false); }}
              className="text-sm text-left px-3 py-2.5 rounded-lg text-foreground hover:bg-muted/60"
            >
              {label}
            </button>
          ))}
          <div className="py-1"><LangSwitcher /></div>
          <div className="flex gap-2">
            <button className="flex-1 text-sm py-2.5 rounded-xl border border-border text-foreground font-medium">{t("nav.signIn")}</button>
            <button className="flex-1 text-sm py-2.5 rounded-xl text-white font-semibold bg-foreground">{t("nav.startHosting")}</button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Landing Page ──────────────────────────────────────────────────────────────
function LandingPage({
  setPage,
  setActiveCommunity,
  setSelectedListing,
}: {
  setPage: (p: Page) => void;
  setActiveCommunity: (c: CommunityId) => void;
  setSelectedListing: (id: string) => void;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative h-[88vh] min-h-[560px] max-h-[860px] overflow-hidden">
        <img
          src={unsplash("photo-1564013799919-ab600027ffc6", 1800, 1000)}
          alt="A warm, welcoming home exterior at dusk"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/55" />
        <div className="relative h-full flex flex-col justify-end pb-14 px-6 sm:px-10 max-w-5xl mx-auto">
          <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-5">
            Affinity-based stays
          </p>
          <h1
            className="text-white text-4xl sm:text-6xl leading-[1.08] mb-5 max-w-2xl"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
          >
            Stay with people who get why you're traveling.
          </h1>
          <p className="text-white/65 text-base sm:text-lg max-w-md mb-10 leading-relaxed">
            Runners hosting runners. Hikers hosting hikers. Sojurno connects you to stays inside your community.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl">
            <div className="flex-1 flex items-center gap-3 px-5 py-3.5 border-b sm:border-b-0 sm:border-r border-border/60">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Where are you racing or hiking?"
                className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5 border-b sm:border-b-0 sm:border-r border-border/60">
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground">Any dates</span>
            </div>
            <button
              onClick={() => { setActiveCommunity("runners"); setPage("explore"); }}
              className="text-white text-sm font-semibold px-6 py-3.5 flex-shrink-0 transition-opacity hover:opacity-90 bg-foreground"
            >
              Search
            </button>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <div className="h-px w-8 bg-white/20" />
            <button
              onClick={() => setPage("communities")}
              className="text-white/60 text-sm hover:text-white/90 transition-colors flex items-center gap-1.5"
            >
              Building a community? Start yours on Sojurno
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Community rows */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Runners */}
        <div className="mb-16">
          <div className="flex items-end justify-between mb-7">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: "#E8651A" }} />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Runners Community</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl text-foreground"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
              >
                Race-ready stays, in cities you're running
              </h2>
            </div>
            <button
              onClick={() => { setActiveCommunity("runners"); setPage("explore"); }}
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-foreground hover:opacity-60 transition-opacity flex-shrink-0"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RUNNER_LISTINGS.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                community="runners"
                onClick={() => { setActiveCommunity("runners"); setSelectedListing(listing.id); setPage("listing"); }}
              />
            ))}
          </div>
        </div>

        {/* Hikers */}
        <div>
          <div className="flex items-end justify-between mb-7">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: "#2D6A4F" }} />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Hikers Community</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl text-foreground"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
              >
                Trailhead-close. Gear-ready. Host-guided.
              </h2>
            </div>
            <button
              onClick={() => { setActiveCommunity("hikers"); setPage("explore"); }}
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-foreground hover:opacity-60 transition-opacity flex-shrink-0"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HIKER_LISTINGS.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                community="hikers"
                onClick={() => { setActiveCommunity("hikers"); setSelectedListing(listing.id); setPage("listing"); }}
              />
            ))}
          </div>
        </div>

        {/* Create a community strip */}
        <div className="mt-14 rounded-3xl border border-dashed border-border bg-secondary/50 px-8 sm:px-12 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-11 h-11 rounded-2xl bg-background border border-border flex items-center justify-center flex-shrink-0 text-muted-foreground">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">For community builders</p>
              <h3
                className="text-xl sm:text-2xl text-foreground mb-1"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
              >
                Don't see your community here?
              </h3>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                Cyclists, climbers, open water swimmers — if your group travels with a shared purpose, Sojurno can be home for it.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPage("communities")}
            className="flex-shrink-0 flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            Create a community <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/60 border-y border-border/60 py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">How Sojurno works</p>
            <h2
              className="text-3xl sm:text-4xl text-foreground"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
            >
              Belonging, not just booking
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-16">
            {[
              {
                n: "01",
                title: "Find your community",
                body: "Choose the community that matches why you travel — races, trails, climbs. Each has its own hosts, listings, and shared language.",
              },
              {
                n: "02",
                title: "Stay with someone who gets it",
                body: "Hosts share your context. They know the roads, the trailheads, the gear. They've been in your shoes — sometimes literally.",
              },
              {
                n: "03",
                title: "Travel with belonging",
                body: "Early checkout. Local beta. Gear on loan. The small things that matter enormously when you're traveling with a purpose.",
              },
            ].map((step) => (
              <div key={step.n} className="flex flex-col gap-4">
                <span
                  className="text-6xl font-light leading-none"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: "rgba(26,25,22,0.1)" }}
                >
                  {step.n}
                </span>
                <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Start a community CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="rounded-3xl overflow-hidden relative bg-foreground">
          <div className="absolute inset-0 opacity-[0.08]">
            <img
              src={unsplash("photo-1551632811-561732d1e306", 1200, 400)}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative px-8 sm:px-14 py-14 sm:py-16">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-5">For community builders</p>
            <h2
              className="text-white text-3xl sm:text-4xl max-w-lg mb-4 leading-snug"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
            >
              Your community deserves its own place to stay.
            </h2>
            <p className="text-white/55 text-base max-w-md mb-10 leading-relaxed">
              Sojurno is multi-tenant by design. Cyclists, climbers, open water swimmers — if your community travels with shared purpose, we can build a home for it.
            </p>
            <button
              onClick={() => setPage("communities")}
              className="inline-flex items-center gap-2 bg-white text-foreground text-sm font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
            >
              Start a community <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

// ── Communities Page ───────────────────────────────────────────────────────────
function CommunitiesPage({
  setPage,
  setActiveCommunity,
}: {
  setPage: (p: Page) => void;
  setActiveCommunity: (c: CommunityId) => void;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">All communities</p>
          <h1
            className="text-4xl sm:text-5xl mb-4"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
          >
            Find your community
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
            Each community is a distinct stays experience — same platform, shared context, built for how you travel.
          </p>
        </div>

        {/* Active communities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14">
          {COMMUNITIES.filter((c) => c.active).map((community) => (
            <button
              key={community.id}
              onClick={() => { setActiveCommunity(community.id); setPage("explore"); }}
              className="group text-left rounded-3xl overflow-hidden border border-border/60 hover:border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="relative h-60 bg-muted overflow-hidden">
                <img
                  src={unsplash(community.image, 900, 480)}
                  alt={community.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 flex items-center gap-2">
                  <span
                    className="text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full"
                    style={{ color: community.color, backgroundColor: community.lightBg }}
                  >
                    Active
                  </span>
                  <span className="text-white/80 text-xs">{community.listings.toLocaleString()} listings · {community.cities} cities</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-foreground">{community.name}</h2>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{community.tagline}</p>
                <div className="flex flex-wrap gap-1.5">
                  {community.tags?.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Coming soon */}
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">In development</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMMUNITIES.filter((c) => !c.active).map((community) => (
              <div
                key={community.id}
                className="rounded-2xl border border-border/50 overflow-hidden bg-card"
              >
                <div className="relative h-36 bg-muted overflow-hidden grayscale opacity-60">
                  <img
                    src={unsplash(community.image, 600, 280)}
                    alt={community.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white/90 text-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                      Coming soon
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-1">{community.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{community.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start a community */}
        <div className="pt-10 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Don't see your community?</h2>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Sojurno is built to host new communities. If you organize people who travel for a shared purpose, we'd like to talk.
            </p>
          </div>
          <button className="flex-shrink-0 text-sm font-semibold px-6 py-3 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity">
            Start a community
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Explore Page ──────────────────────────────────────────────────────────────
function ExplorePage({
  community,
  setPage,
  setSelectedListing,
  setSelectedCollection,
}: {
  community: CommunityId;
  setPage: (p: Page) => void;
  setSelectedListing: (id: string) => void;
  setSelectedCollection: (id: string) => void;
}) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recommended");
  const c = getCommunity(community);
  const listings = community === "runners" ? RUNNER_LISTINGS : HIKER_LISTINGS;

  return (
    <div className="min-h-screen bg-background">
      {/* Community header */}
      <div className="border-b border-border/60 py-10 px-4 sm:px-6" style={{ backgroundColor: c.lightBg }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: c.color }}>
              {c.name} Community
            </span>
          </div>
          <h1
            className="text-3xl sm:text-4xl text-foreground mb-2"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
          >
            {c.tagline}
          </h1>
          <p className="text-sm text-muted-foreground">
            {c.listings.toLocaleString()} stays · {c.cities} cities
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-2 text-sm border border-border/70 rounded-xl px-3 py-2 hover:bg-muted/60 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              Any location
            </button>
            <button className="flex items-center gap-2 text-sm border border-border/70 rounded-xl px-3 py-2 hover:bg-muted/60 transition-colors">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              Any dates
            </button>
            {community === "runners" && (
              <button className="flex items-center gap-2 text-sm border border-border/70 rounded-xl px-3 py-2 hover:bg-muted/60 transition-colors">
                <Wind className="w-3.5 h-3.5 text-muted-foreground" />
                Race type
              </button>
            )}
            {community === "hikers" && (
              <button className="flex items-center gap-2 text-sm border border-border/70 rounded-xl px-3 py-2 hover:bg-muted/60 transition-colors">
                <Mountain className="w-3.5 h-3.5 text-muted-foreground" />
                Trail type
              </button>
            )}
            <button
              className="flex items-center gap-2 text-sm border rounded-xl px-3 py-2 transition-colors"
              style={{ borderColor: c.color, color: c.color }}
            >
              <Package className="w-3.5 h-3.5" />
              {community === "hikers" ? "Gear included" : "Race perks"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
              <option value="rating">Top rated</option>
            </select>
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 transition-colors ${viewMode === "grid" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted/60"}`}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 transition-colors ${viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted/60"}`}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collections rail */}
      <div className="max-w-7xl mx-auto pt-8">
        <CollectionRail
          community={community}
          onSelectCollection={(id) => { setSelectedCollection(id); setPage("collection"); }}
        />
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <p className="text-sm text-muted-foreground mb-6">{listings.length} {t("explore.stays")}</p>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                community={community}
                onClick={() => { setSelectedListing(listing.id); setPage("listing"); }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {listings.map((listing) => (
              <button
                key={listing.id}
                onClick={() => { setSelectedListing(listing.id); setPage("listing"); }}
                className="text-left group rounded-2xl border border-border/60 bg-card hover:shadow-md hover:border-border transition-all duration-200 overflow-hidden flex focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="w-40 sm:w-56 h-36 flex-shrink-0 bg-muted overflow-hidden">
                  <img
                    src={unsplash(listing.image, 400, 288)}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold leading-snug">{listing.title}</h3>
                      <div className="flex-shrink-0"><StarRating rating={listing.rating} reviews={listing.reviews} /></div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{listing.neighborhood} · {listing.location}</p>
                    <p className="text-xs text-muted-foreground italic hidden sm:block">&ldquo;{listing.highlight}&rdquo;</p>
                  </div>
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    <div className="flex gap-1.5 flex-wrap">
                      {listing.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                      ))}
                    </div>
                    <span className="text-sm font-semibold">${listing.price}<span className="text-xs font-normal text-muted-foreground"> / night</span></span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Listing Detail ────────────────────────────────────────────────────────────
function ListingDetailPage({
  listingId,
  community,
  setPage,
}: {
  listingId: string;
  community: CommunityId;
  setPage: (p: Page) => void;
}) {
  const [nights, setNights] = useState(2);
  const [selectedGear, setSelectedGear] = useState<string[]>([]);
  const listings = community === "runners" ? RUNNER_LISTINGS : HIKER_LISTINGS;
  const listing = listings.find((l) => l.id === listingId) ?? listings[0];
  const c = getCommunity(community);

  const total = listing.price * nights;
  const fee = Math.round(total * 0.12);

  const toggleGear = (item: string) =>
    setSelectedGear((prev) => (prev.includes(item) ? prev.filter((g) => g !== item) : [...prev, item]));

  const galleryPool = community === "runners"
    ? ["photo-1586023492125-27b2c045efd7", "photo-1502672260266-1c1ef2d93688", "photo-1484154218962-a197022b5858", "photo-1522708323590-d24dbb6b0267"]
    : ["photo-1449824913935-59a10b8d2000", "photo-1510798831971-661eb04b3739", "photo-1464822759023-fed622ff2c3b", "photo-1449824913935-59a10b8d2000"];

  const reviews = [
    {
      name: "Alex M.",
      avatar: "photo-1527980965255-d3b416303d12",
      date: "March 2025",
      text: community === "runners"
        ? "Perfect setup for race day. Left coffee out at 4am and the route maps were exactly right. Will be back for the fall half."
        : "The gear lending made this trip. I didn't have to haul poles across the country — they were waiting. Host was incredibly knowledgeable.",
    },
    {
      name: "Tarini R.",
      avatar: "photo-1580489944761-15a19d654956",
      date: "January 2025",
      text: community === "runners"
        ? "Stayed here for the marathon and it was seamless. The foam roller and recovery snacks in the room were a thoughtful touch after a hard effort."
        : "Checked in the night before a big trail day, and the host had everything sorted — bear can, stove, maps. You couldn't get a better basecamp.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => setPage("explore")} className="hover:text-foreground transition-colors">
            {c.name}
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{listing.neighborhood}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <h1
          className="text-2xl sm:text-3xl mb-3"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
        >
          {listing.title}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <StarRating rating={listing.rating} reviews={listing.reviews} />
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {listing.neighborhood}, {listing.location}
          </span>
          <CommunityPill id={community} />
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-3xl overflow-hidden h-72 sm:h-[420px]">
          <div className="col-span-2 row-span-2 bg-muted">
            <img src={unsplash(listing.image, 800, 600)} alt={listing.title} className="w-full h-full object-cover" />
          </div>
          {galleryPool.map((photoId, i) => (
            <div key={i} className="bg-muted overflow-hidden">
              <img src={unsplash(photoId, 400, 250)} alt="Interior view" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20">
          {/* Left */}
          <div className="lg:col-span-2 space-y-10">
            {/* Host */}
            <div className="flex items-start gap-5 pb-8 border-b border-border/60">
              <img
                src={unsplash(listing.host.avatar, 80, 80)}
                alt={listing.host.name}
                className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-border"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">Hosted by {listing.host.name}</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ color: c.color, backgroundColor: c.lightBg }}
                  >
                    {listing.host.badge}
                  </span>
                  {Object.entries(listing.host)
                    .filter(([k]) => !["name", "avatar", "badge"].includes(k))
                    .map(([k, v]) => (
                      <span key={k} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{v}</span>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground italic">&ldquo;{listing.highlight}&rdquo;</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="pb-8 border-b border-border/60">
              <h3 className="text-base font-semibold mb-5">
                {community === "runners" ? "Race-day amenities" : "Trail amenities"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {listing.tags.map((tag) => (
                  <div key={tag} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: c.lightBg }}
                    >
                      <CheckCircle2 className="w-4 h-4" style={{ color: c.color }} />
                    </div>
                    <span className="text-sm text-foreground">{tag}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.lightBg }}>
                    <Clock className="w-4 h-4" style={{ color: c.color }} />
                  </div>
                  <span className="text-sm">Flexible check-in for {community === "runners" ? "race" : "trail"} day</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.lightBg }}>
                    <Shield className="w-4 h-4" style={{ color: c.color }} />
                  </div>
                  <span className="text-sm">Verified community host</span>
                </div>
              </div>
            </div>

            {/* Gear section (hikers only) */}
            {community === "hikers" && listing.gear && (
              <div className="pb-8 border-b border-border/60">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-base font-semibold mb-1">Optional gear from host</h3>
                    <p className="text-sm text-muted-foreground">Select gear to include with your stay. No added charge.</p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ color: c.color, backgroundColor: c.lightBg }}
                  >
                    Host-lent
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {listing.gear.map((item) => {
                    const checked = selectedGear.includes(item);
                    return (
                      <button
                        key={item}
                        onClick={() => toggleGear(item)}
                        className="flex items-center gap-3 text-left p-3 rounded-xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        style={
                          checked
                            ? { borderColor: c.color, backgroundColor: c.lightBg }
                            : { borderColor: "rgba(26,25,22,0.1)" }
                        }
                        aria-pressed={checked}
                      >
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all"
                          style={checked ? { borderColor: c.color, backgroundColor: c.color } : { borderColor: "#C8C4BC" }}
                        >
                          {checked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm font-medium text-foreground">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-base font-semibold">Reviews</h3>
                <StarRating rating={listing.rating} reviews={listing.reviews} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {reviews.map((review) => (
                  <div key={review.name} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={unsplash(review.avatar, 48, 48)}
                        alt={review.name}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-semibold">{review.name}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-border rounded-2xl p-6 shadow-lg bg-card">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-semibold">${listing.price}</span>
                <span className="text-muted-foreground text-sm">/ night</span>
              </div>
              <div className="border border-border rounded-xl overflow-hidden mb-4">
                <div className="grid grid-cols-2 divide-x divide-border">
                  <div className="p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Check-in</p>
                    <p className="text-sm font-medium">Oct 12</p>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">Check-out</p>
                    <p className="text-sm font-medium">Oct {12 + nights}</p>
                  </div>
                </div>
                <div className="border-t border-border p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Nights</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setNights(Math.max(1, nights - 1))}
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Remove a night"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{nights}</span>
                    <button
                      onClick={() => setNights(nights + 1)}
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Add a night"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              <button
                className="w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 mb-4"
                style={{ backgroundColor: c.color }}
              >
                Request to book
              </button>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">${listing.price} × {nights} nights</span>
                  <span>${total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Community service fee</span>
                  <span>${fee}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2.5 border-t border-border">
                  <span>Total</span>
                  <span>${total + fee}</span>
                </div>
              </div>
              <div
                className="mt-4 p-3 rounded-xl text-xs leading-relaxed flex items-start gap-2"
                style={{ backgroundColor: c.lightBg, color: c.color }}
              >
                <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  {community === "runners"
                    ? "Verified community member with race experience."
                    : "Verified community member with backcountry experience."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Collection Detail Page ────────────────────────────────────────────────────
function CollectionDetailPage({
  collectionId,
  setPage,
  setSelectedListing,
  setActiveCommunity,
}: {
  collectionId: string;
  setPage: (p: Page) => void;
  setSelectedListing: (id: string) => void;
  setActiveCommunity: (c: CommunityId) => void;
}) {
  const { t } = useLang();
  const collection = getCollection(collectionId);
  if (!collection) return null;

  const c = getCommunity(collection.tenant);
  const allListings = collection.tenant === "runners" ? RUNNER_LISTINGS : HIKER_LISTINGS;
  const listings = allListings.filter((l) => collection.listingIds.includes(l.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img
          src={unsplash(collection.image, 1400, 600)}
          alt={collection.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => { setActiveCommunity(collection.tenant); setPage("explore"); }}
              className="text-white/60 text-xs hover:text-white/90 transition-colors flex items-center gap-1"
            >
              <ChevronRight className="w-3 h-3 rotate-180" />
              {c.name}
            </button>
            <span className="text-white/40 text-xs">/</span>
            <span className="text-white/60 text-xs">
              {c.collectionsLabel}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ color: c.color, backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
                >
                  {collection.kind === "event" ? t("collections.race") : t("collections.trail")}
                </span>
                {collection.dateLabel && (
                  <span className="text-white/70 text-xs font-medium">{collection.dateLabel}</span>
                )}
              </div>
              <h1
                className="text-white text-3xl sm:text-4xl leading-tight"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
              >
                {collection.title}
              </h1>
              {collection.location && (
                <p className="text-white/60 text-sm mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {collection.location}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary + listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mb-10">
          {collection.summary}
        </p>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
            <h2 className="text-base font-semibold text-foreground">
              {listings.length} {listings.length === 1 ? t("collections.stayNear") : t("collections.staysNear")} {collection.kind === "event" ? t("collections.raceDestination") : t("collections.trailDestination")}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              community={collection.tenant}
              onClick={() => {
                setActiveCommunity(collection.tenant);
                setSelectedListing(listing.id);
                setPage("listing");
              }}
            />
          ))}
        </div>

        {listings.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">{t("collections.noStays")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Host Dashboard ────────────────────────────────────────────────────────────
function HostDashboardPage({ community }: { community: CommunityId }) {
  const [activeTab, setActiveTab] = useState<"reservations" | "requests" | "listings">("reservations");
  const c = getCommunity(community);

  const reservations = [
    { guest: "Alex M.", avatar: "photo-1527980965255-d3b416303d12", dates: "Oct 12–14", nights: 2, total: 237, status: "confirmed" },
    { guest: "Sana P.", avatar: "photo-1580489944761-15a19d654956", dates: "Oct 19–21", nights: 2, total: 201, status: "confirmed" },
    { guest: "Tyler B.", avatar: "photo-1500648767791-00dcc994a43e", dates: "Nov 2–4", nights: 2, total: 263, status: "pending" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Host Dashboard</p>
          <h1
            className="text-3xl sm:text-4xl mb-2"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
          >
            Welcome back, Priya.
          </h1>
          <div className="flex items-center gap-2.5">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ color: c.color, backgroundColor: c.lightBg }}
            >
              {c.name} host
            </span>
            <span className="text-sm text-muted-foreground">· 63 stays completed · 4.97 rating</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "This month", value: "$1,248", sub: "3 stays" },
            { label: "Avg rating", value: "4.97", sub: "63 reviews" },
            { label: "Response rate", value: "100%", sub: "< 2hr avg" },
            { label: "Repeat guests", value: "34%", sub: "of total" },
          ].map((stat) => (
            <div key={stat.label} className="border border-border/60 rounded-2xl p-5 bg-card">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold text-foreground mb-0.5">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border/60 mb-7">
          {(["reservations", "requests", "listings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {tab === "requests" && (
                <span
                  className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: c.color }}
                >
                  1
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "reservations" && (
          <div className="space-y-3">
            {reservations.map((res, i) => (
              <div key={i} className="flex items-center gap-4 border border-border/60 rounded-2xl p-4 bg-card hover:border-border transition-colors">
                <img src={unsplash(res.avatar, 48, 48)} alt={res.guest} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-semibold">{res.guest}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        res.status === "confirmed" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{res.nights} nights · {c.name} community</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold">${res.total}</p>
                  <p className="text-xs text-muted-foreground">{res.dates}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="border border-border/60 rounded-2xl p-6 bg-card">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <img src={unsplash("photo-1500648767791-00dcc994a43e", 48, 48)} alt="Tyler B." className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold mb-1">Tyler B. wants to stay Nov 2–4</p>
                  <p className="text-xs text-muted-foreground mb-2">2 nights · $263 total</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: c.color, backgroundColor: c.lightBg }}
                    >
                      Verified {c.name.toLowerCase().replace(/s$/, "")}
                    </span>
                    <span className="text-xs text-muted-foreground">· 5 previous Sojurno stays</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-sm px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted transition-colors font-medium">
                  Decline
                </button>
                <button
                  className="text-sm px-4 py-2 rounded-xl text-white font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: c.color }}
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "listings" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(community === "runners" ? RUNNER_LISTINGS : HIKER_LISTINGS).slice(0, 2).map((listing) => (
              <div key={listing.id} className="border border-border/60 rounded-2xl overflow-hidden bg-card flex">
                <div className="w-28 flex-shrink-0 bg-muted">
                  <img src={unsplash(listing.image, 200, 160)} alt={listing.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2 mb-1">{listing.title}</h3>
                    <p className="text-xs text-muted-foreground">{listing.location}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                    <span className="text-xs text-muted-foreground">${listing.price}/night</span>
                  </div>
                </div>
              </div>
            ))}
            <button className="border-2 border-dashed border-border/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-border transition-colors text-muted-foreground hover:text-foreground">
              <Plus className="w-6 h-6" />
              <span className="text-sm font-medium">Add listing</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Design System Page ────────────────────────────────────────────────────────
function DesignSystemPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{t("system.eyebrow")}</p>
          <h1
            className="text-4xl sm:text-5xl mb-4"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
          >
            {t("system.heading")}
          </h1>
          <p className="text-muted-foreground text-base max-w-lg leading-relaxed">
            {t("system.subtext")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {[
            { title: "Storybook", desc: "Interactive component docs with all variants, states, and accessibility notes.", icon: <Layers className="w-5 h-5" />, link: "storybook.sojurno.com" },
            { title: "Design tokens", desc: "Color, spacing, typography, and radius tokens — platform and tenant scoped.", icon: <Settings className="w-5 h-5" />, link: "tokens.sojurno.com" },
            { title: "Figma library", desc: "Shared component set synced to the production codebase via Code Connect.", icon: <Globe className="w-5 h-5" />, link: "figma.com/sojurno-system" },
            { title: "Tenant theming guide", desc: "How to configure a new community: palette, vocabulary, and enabled features.", icon: <BookOpen className="w-5 h-5" />, link: "docs.sojurno.com/theming" },
          ].map((item) => (
            <div
              key={item.title}
              className="group border border-border/60 rounded-2xl p-6 bg-card hover:border-border hover:shadow-md transition-all duration-200 cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:bg-foreground group-hover:text-background transition-colors text-muted-foreground">
                {item.icon}
              </div>
              <h2 className="font-semibold text-foreground mb-1">{item.title}</h2>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{item.desc}</p>
              <span className="text-xs font-mono text-muted-foreground">{item.link}</span>
            </div>
          ))}
        </div>

        {/* Color tokens */}
        <div className="border border-border/60 rounded-2xl p-6 bg-card mb-6">
          <h2 className="font-semibold text-foreground mb-5">{t("system.tokens")}</h2>
          <div className="space-y-4">
            {[
              { name: "Platform", color: "#1A1916", light: "#F4F2EE", label: "--community-primary" },
              { name: "Runners", color: "#E8651A", light: "#FEF3EC", label: "--community-accent (runners)" },
              { name: "Hikers", color: "#2D6A4F", light: "#EEFAF4", label: "--community-accent (hikers)" },
              { name: "Cyclists (upcoming)", color: "#1A56DB", light: "#EFF6FF", label: "--community-accent (cyclists)" },
            ].map((token) => (
              <div key={token.name} className="flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg border border-border/60" style={{ backgroundColor: token.color }} title={token.color} />
                  <div className="w-8 h-8 rounded-lg border border-border/60" style={{ backgroundColor: token.light }} title={token.light} />
                </div>
                <div>
                  <span className="text-sm font-semibold mr-3">{token.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{token.label}: {token.color}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="border border-border/60 rounded-2xl p-6 bg-card">
          <h2 className="font-semibold text-foreground mb-6">{t("system.typography")}</h2>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-2">Display · Instrument Serif · Regular · Italic</p>
              <p className="text-4xl" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic" }}>
                Stay with people who get it.
              </p>
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-2">Heading · Instrument Serif · Regular</p>
              <p className="text-2xl" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                Race-ready stays, in cities you're running
              </p>
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-2">Body · Plus Jakarta Sans · Regular</p>
              <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                Sojurno connects travelers to stays inside their community. Hosts and guests share the same context, rituals, and reason to be there.
              </p>
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-2">Label · Plus Jakarta Sans · SemiBold · Tracking</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Runners Community · 847 listings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── About Page ────────────────────────────────────────────────────────────────
function AboutPage({ setPage }: { setPage: (p: Page) => void }) {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">

        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start gap-8 mb-16 pb-16 border-b border-border/60">
          <div className="w-24 h-24 rounded-3xl overflow-hidden bg-muted flex-shrink-0 border border-border/60">
            <img
              src={unsplash("photo-1506794778202-cad84cf45f1d", 192, 192)}
              alt="Founder portrait"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{t("about.eyebrow")}</p>
            <h1
              className="text-4xl sm:text-5xl mb-3"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
            >
              {t("about.heading")}
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
              {t("about.bio")}
            </p>
          </div>
        </div>

        {/* Disciplines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
          {[
            {
              label: "UX Design",
              desc: "End-to-end product design: information architecture, interaction flows, component systems, and trust-pattern research. Hospitality and marketplace products are a particular focus.",
              skills: ["Interaction design", "Design systems", "User research", "Figma / Code Connect"],
            },
            {
              label: "Front-End Engineering",
              desc: "Production React applications with Tailwind CSS, typed component libraries, and accessibility as a first-class concern. This prototype is the working artefact.",
              skills: ["React + TypeScript", "Tailwind CSS", "Accessible UI", "Design token systems"],
            },
            {
              label: "Marketplace & Community",
              desc: "Hands-on work with peer-to-peer platforms, trust signal design, multi-tenant product architecture, and community-specific UX patterns.",
              skills: ["P2P trust design", "Multi-tenant systems", "Affinity UX", "Booking flows"],
            },
            {
              label: "Product thinking",
              desc: "Sojurno is a product thesis as much as a design exercise — community as a trust signal, affinity as a differentiator, and reusable platform architecture as a moat.",
              skills: ["Product strategy", "Positioning", "Brand architecture", "Launch scoping"],
            },
          ].map((item) => (
            <div key={item.label} className="border border-border/60 rounded-2xl p-6 bg-card hover:border-border transition-colors">
              <h3 className="font-semibold text-foreground mb-2">{item.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {item.skills.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* At launch note */}
        <div className="rounded-2xl border border-dashed border-border/60 px-6 py-5 mb-16 flex items-start gap-4 bg-secondary/40">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("about.launchNote")}
          </p>
        </div>

        {/* Design System subsection */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-border/60" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-2">{t("about.builderResources")}</p>
            <div className="h-px flex-1 bg-border/60" />
          </div>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            {t("about.builderSubtext")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              { title: "Storybook", desc: "Interactive component docs with all variants, states, and accessibility notes.", icon: <Layers className="w-5 h-5" />, link: "storybook.sojurno.com" },
              { title: "Design tokens", desc: "Color, spacing, typography, and radius tokens — platform and tenant scoped.", icon: <Settings className="w-5 h-5" />, link: "tokens.sojurno.com" },
              { title: "Figma library", desc: "Shared component set synced to the codebase via Code Connect.", icon: <Globe className="w-5 h-5" />, link: "figma.com/sojurno-system" },
              { title: "Tenant theming guide", desc: "How to configure a new community: palette, vocabulary, and enabled capabilities.", icon: <BookOpen className="w-5 h-5" />, link: "docs.sojurno.com/theming" },
            ].map((item) => (
              <div
                key={item.title}
                className="group border border-border/60 rounded-2xl p-5 bg-card hover:border-border hover:shadow-sm transition-all duration-200 cursor-default"
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-foreground group-hover:text-background transition-colors text-muted-foreground">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-0.5">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-1.5">{item.desc}</p>
                    <span className="text-xs font-mono text-muted-foreground/70">{item.link}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button
              onClick={() => setPage("system")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              {t("about.openSystem")} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Site Footer ───────────────────────────────────────────────────────────────
function SiteFooter({ setPage }: { setPage: (p: Page) => void }) {
  const { t } = useLang();
  return (
    <footer className="border-t border-border/60 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <button
              onClick={() => setPage("landing")}
              className="mb-4 inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <span
                className="text-2xl"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}
              >
                Sojurno
              </span>
            </button>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">{t("footer.product")}</p>
            <div className="flex flex-col gap-2.5">
              {[
                { key: "footer.communities" as TKey, page: "communities" as Page },
                { key: "footer.exploreStays" as TKey, page: "explore" as Page },
                { key: "footer.startHosting" as TKey, page: "host" as Page },
                { key: "footer.createCommunity" as TKey, page: "communities" as Page },
              ].map(({ key, page }) => (
                <button
                  key={key}
                  onClick={() => setPage(page)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>

          {/* About */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">{t("footer.about")}</p>
            <div className="flex flex-col gap-2.5">
              {[
                { key: "footer.aboutUs" as TKey, page: "about" as Page },
                { key: "footer.designSystem" as TKey, page: "system" as Page },
              ].map(({ key, page }) => (
                <button
                  key={key}
                  onClick={() => setPage(page)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">{t("footer.legal")}</p>
            <div className="flex flex-col gap-2.5">
              {(["footer.privacy", "footer.terms", "footer.accessibility"] as TKey[]).map((key) => (
                <a key={key} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t(key)}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{t("footer.copyright")}</p>
          <div className="flex items-center gap-2">
            {(["runners", "hikers"] as CommunityId[]).map((id) => {
              const c = getCommunity(id);
              return (
                <span
                  key={id}
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ color: c.color, backgroundColor: c.lightBg }}
                >
                  {c.name}
                </span>
              );
            })}
            <span className="text-xs text-muted-foreground/60 ml-1">{t("footer.moreComing")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [activeCommunity, setActiveCommunity] = useState<CommunityId>("runners");
  const [selectedListingId, setSelectedListingId] = useState<string>("r1");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("rc1");
  const [lang, setLang] = useState<Lang>("en");

  const t = (key: TKey): string =>
    (TRANSLATIONS[lang] as Record<string, string>)[key] ??
    (TRANSLATIONS.en as Record<string, string>)[key] ??
    key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
    <div className="min-h-screen bg-background">
      <Nav
        page={page}
        setPage={setPage}
        activeCommunity={activeCommunity}
        setActiveCommunity={setActiveCommunity}
      />
      {page === "landing" && (
        <LandingPage
          setPage={setPage}
          setActiveCommunity={setActiveCommunity}
          setSelectedListing={setSelectedListingId}
        />
      )}
      {page === "communities" && (
        <CommunitiesPage setPage={setPage} setActiveCommunity={setActiveCommunity} />
      )}
      {page === "explore" && (
        <ExplorePage
          community={activeCommunity}
          setPage={setPage}
          setSelectedListing={setSelectedListingId}
          setSelectedCollection={setSelectedCollectionId}
        />
      )}
      {page === "listing" && (
        <ListingDetailPage
          listingId={selectedListingId}
          community={activeCommunity}
          setPage={setPage}
        />
      )}
      {page === "collection" && (
        <CollectionDetailPage
          collectionId={selectedCollectionId}
          setPage={setPage}
          setSelectedListing={setSelectedListingId}
          setActiveCommunity={setActiveCommunity}
        />
      )}
      {page === "host" && <HostDashboardPage community={activeCommunity} />}
      {page === "about" && <AboutPage setPage={setPage} />}
      {page === "system" && <DesignSystemPage />}
      <SiteFooter setPage={setPage} />
    </div>
    </LangContext.Provider>
  );
}
