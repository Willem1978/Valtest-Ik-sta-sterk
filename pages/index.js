import React, { useState, useRef, useEffect } from 'react';
import { Eye, Footprints, Dumbbell, Pill, Apple, Home, ChevronRight, ChevronLeft, Check, AlertCircle, Phone, MapPin, Clock, Heart, Shield, Users, FileText, CheckCircle2, ArrowRight, X, Send, ArrowLeft, Calendar, Lightbulb, Search } from 'lucide-react';

// Supabase configuratie
const SUPABASE_URL = 'https://bggavoacfhmxcbeiixjf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nnGd9pTnIuI92K9K_zZt-w_1Qb0fug6';

const IkStaSterkTest = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questionHistory, setQuestionHistory] = useState([]);
  const [preventionAnswers, setPreventionAnswers] = useState({});
  const [demographics, setDemographics] = useState({ age: '', gender: '', email: '' });
  const [riskLevel, setRiskLevel] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Voorkom dubbel klikken
  const [woonplaats, setWoonplaats] = useState('');
  const [woonplaatsSearch, setWoonplaatsSearch] = useState('');
  const [woonplaatsModalOpen, setWoonplaatsModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null); // Behouden voor eventueel toekomstig gebruik
  const [reportPage, setReportPage] = useState(0);
  const [selectedFysio, setSelectedFysio] = useState(null);
  const [contactForm, setContactForm] = useState({ naam: '', telefoon: '', voorkeur: '', opmerking: '' });
  const [telefoonError, setTelefoonError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [screenHistory, setScreenHistory] = useState([]);
  const [dataSaved, setDataSaved] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState(null);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const woonplaatsInputRef = useRef(null);
  const woonplaatsSearchRef = useRef(null);
  const emailInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;

  // ============================================================================
  // ZLIMTHUIS HUISSTIJL - Gebaseerd op zlimthuis.nl
  // Primaire kleur: Saliegroen (sage green) - rustgevend, natuurlijk, betrouwbaar
  // ============================================================================
  const ZLIM = {
    // Primaire kleuren - Saliegroen palette
    sage: '#8a9a6d',           // Hoofdkleur saliegroen
    sageDark: '#6b7a52',       // Donkerder voor hover/actief
    sageLight: '#a8b88f',      // Lichter accent
    sagePale: '#e8ede2',       // Zeer licht voor achtergronden
    sageVeryPale: '#f4f7f0',   // Bijna wit met groene tint
    
    // Secundaire kleuren - Teal/turquoise accent (zoals op zlimthuis.nl knoppen)
    teal: '#4a9b8c',           // Accent kleur voor knoppen
    tealDark: '#3a7b6f',       // Donkerder teal
    tealLight: '#e6f3f0',      // Licht teal achtergrond
    
    // Functionele kleuren
    success: '#5a8a5a',        // Groen voor positief (iets donkerder, past bij sage)
    successLight: '#e8f2e8',
    successDark: '#4a7a4a',
    
    warning: '#c9a227',        // Warm goud/geel voor waarschuwing
    warningLight: '#fdf6e3',
    warningDark: '#a68a1f',
    
    danger: '#c25a5a',         // Zacht rood voor negatief
    dangerLight: '#faeaea',
    dangerDark: '#a24a4a',
    
    // Neutrale kleuren
    white: '#ffffff',
    offWhite: '#fafbf8',       // Zeer lichte achtergrond met warme tint
    bgLight: '#f5f7f2',        // Lichte achtergrond
    bgGrey: '#eef1ea',         // Grijze achtergrond
    border: '#d4dbc8',         // Zachte groene border
    borderLight: '#e4e9dc',
    
    // Tekstkleuren
    textDark: '#2d3a24',       // Donkergroen-zwart voor hoofdtekst
    textMedium: '#5a6650',     // Medium voor subtekst
    textLight: '#8a9580',      // Licht voor hints
    textMuted: '#a0ab96',      // Zeer licht/muted
  };

  // Lettertype stijlen - Zlimthuis gebruikt schone, leesbare fonts
  const FONT = {
    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    // Groottes
    h1: isMobile ? '28px' : '34px',
    h2: isMobile ? '22px' : '26px',
    h3: isMobile ? '18px' : '20px',
    body: isMobile ? '16px' : '17px',
    small: '14px',
    tiny: '12px',
    // Gewichten
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  };

  // Fysiotherapie praktijken met coördinaten
  const fysioPraktijken = [
    { id: 1, naam: 'FysioVitaal Ulft', adres: 'Industriestraat 12', plaats: 'Ulft', postcode: '7071XK', lat: 51.8956, lng: 6.3789, telefoon: '0315 - 123 456', omschrijving: 'FysioVitaal is gespecialiseerd in valpreventie en ouderenfysiotherapie. Bij ons krijg je een uitgebreide valrisicometing waarbij we je balans, spierkracht en looppatroon nauwkeurig in kaart brengen.', specialisaties: ['Valpreventie', 'Geriatrie', 'Balanstraining'], openingstijden: 'Ma-Vr 8:00-17:30', eersteAfspraak: 'Binnen 5 werkdagen' },
    { id: 2, naam: 'Fysiotherapie Terborg', adres: 'Hoofdstraat 45', plaats: 'Terborg', postcode: '7061CW', lat: 51.9203, lng: 6.3567, telefoon: '0315 - 234 567', omschrijving: 'Bij Fysiotherapie Terborg krijg je persoonlijke begeleiding bij het verbeteren van je balans en spierkracht. Onze therapeuten hebben ruime ervaring met ouderen.', specialisaties: ['Geriatrie', 'Spierkracht', 'Looptraining'], openingstijden: 'Ma-Vr 8:00-18:00', eersteAfspraak: 'Binnen 3 werkdagen' },
    { id: 3, naam: 'Praktijk Bewegen & Balans', adres: 'Varsseveldseweg 78', plaats: 'Silvolde', postcode: '7064BZ', lat: 51.9134, lng: 6.3845, telefoon: '0315 - 345 678', omschrijving: 'Bewegen & Balans is dé expert in het voorkomen van valincidenten. We werken nauw samen met huisartsen en specialisten in de regio.', specialisaties: ['Valpreventie', 'Oefentherapie', 'Groepslessen'], openingstijden: 'Ma-Vr 8:30-17:00', eersteAfspraak: 'Binnen 1 week' }
  ];

  // Uitgebreide postcode naar coördinaten lookup 
  // Bron: Kadaster/PDOK data voor gemeente Oude IJsselstreek en omgeving
  const postcodeCoords = {
    // === GEMEENTE OUDE IJSSELSTREEK ===
    // Ulft
    '7071': { lat: 51.8961, lng: 6.3792, plaats: 'Ulft' },
    // Silvolde  
    '7064': { lat: 51.9128, lng: 6.3847, plaats: 'Silvolde' },
    // Terborg
    '7061': { lat: 51.9211, lng: 6.3572, plaats: 'Terborg' },
    // Gendringen
    '7081': { lat: 51.8722, lng: 6.3736, plaats: 'Gendringen' },
    // Varsselder
    '7076': { lat: 51.8989, lng: 6.4156, plaats: 'Varsselder' },
    // Sinderen
    '7075': { lat: 51.8942, lng: 6.4531, plaats: 'Sinderen' },
    // Breedenbroek
    '7084': { lat: 51.8883, lng: 6.3461, plaats: 'Breedenbroek' },
    // Voorst
    '7078': { lat: 51.8614, lng: 6.3278, plaats: 'Voorst' },
    // Megchelen
    '7078': { lat: 51.8667, lng: 6.3231, plaats: 'Megchelen' },
    // Netterden
    '7077': { lat: 51.8531, lng: 6.3128, plaats: 'Netterden' },
    // Etten
    '7075': { lat: 51.8936, lng: 6.4528, plaats: 'Etten' },
    // Heelweg
    '7055': { lat: 51.9142, lng: 6.4292, plaats: 'Heelweg' },
    // Westendorp
    '7054': { lat: 51.9286, lng: 6.4017, plaats: 'Westendorp' },
    // Bontebrug
    '7063': { lat: 51.9042, lng: 6.3714, plaats: 'Bontebrug' },
    // Kilder
    '7086': { lat: 51.8708, lng: 6.3547, plaats: 'Kilder' },
    // IJzerlo
    '7085': { lat: 51.8819, lng: 6.3869, plaats: 'IJzerlo' },
    
    // === OMLIGGENDE GEMEENTEN ===
    // Varsseveld (Oude IJsselstreek)
    '7051': { lat: 51.9406, lng: 6.4569, plaats: 'Varsseveld' },
    '7052': { lat: 51.9389, lng: 6.4612, plaats: 'Varsseveld' },
    
    // Dinxperlo (Aalten)
    '7091': { lat: 51.8625, lng: 6.4881, plaats: 'Dinxperlo' },
    '7092': { lat: 51.8603, lng: 6.4917, plaats: 'Dinxperlo' },
    
    // Aalten
    '7121': { lat: 51.9264, lng: 6.5792, plaats: 'Aalten' },
    '7122': { lat: 51.9281, lng: 6.5831, plaats: 'Aalten' },
    
    // Doetinchem
    '7001': { lat: 51.9647, lng: 6.2892, plaats: 'Doetinchem' },
    '7002': { lat: 51.9661, lng: 6.2928, plaats: 'Doetinchem' },
    '7003': { lat: 51.9639, lng: 6.2967, plaats: 'Doetinchem' },
    '7004': { lat: 51.9683, lng: 6.2847, plaats: 'Doetinchem' },
    '7005': { lat: 51.9622, lng: 6.2803, plaats: 'Doetinchem' },
    '7006': { lat: 51.9597, lng: 6.2756, plaats: 'Doetinchem' },
    
    // Gaanderen (Doetinchem)
    '7011': { lat: 51.9353, lng: 6.3236, plaats: 'Gaanderen' },
    
    // Zelhem
    '7021': { lat: 52.0058, lng: 6.3472, plaats: 'Zelhem' },
    
    // 's-Heerenberg (Montferland)
    '7041': { lat: 51.8747, lng: 6.2453, plaats: "'s-Heerenberg" },
    '7042': { lat: 51.8761, lng: 6.2489, plaats: "'s-Heerenberg" },
    
    // Didam (Montferland)
    '6942': { lat: 51.9372, lng: 6.1264, plaats: 'Didam' },
    
    // Zevenaar
    '6901': { lat: 51.9308, lng: 6.0728, plaats: 'Zevenaar' },
    '6902': { lat: 51.9289, lng: 6.0764, plaats: 'Zevenaar' },
    '6903': { lat: 51.9325, lng: 6.0692, plaats: 'Zevenaar' },
    
    // Wehl (Doetinchem)
    '7031': { lat: 51.9467, lng: 6.2117, plaats: 'Wehl' },
    
    // Lichtenvoorde (Oost Gelre)
    '7131': { lat: 51.9872, lng: 6.5639, plaats: 'Lichtenvoorde' },
    
    // Groenlo (Oost Gelre)
    '7141': { lat: 52.0439, lng: 6.6139, plaats: 'Groenlo' },
    
    // Winterswijk
    '7101': { lat: 51.9706, lng: 6.7194, plaats: 'Winterswijk' },
    '7102': { lat: 51.9689, lng: 6.7228, plaats: 'Winterswijk' },
    '7103': { lat: 51.9722, lng: 6.7156, plaats: 'Winterswijk' },
  };
  
  // Uitgebreide lijst van Nederlandse woonplaatsen met coördinaten
  // Dit zijn woonplaatsen (dorpen, gehuchten, steden), geen gemeenten
  const woonplaatsen = [
    // === GEMEENTE OUDE IJSSELSTREEK ===
    { naam: 'Ulft', lat: 51.8958, lng: 6.3789 },
    { naam: 'Silvolde', lat: 51.9133, lng: 6.3833 },
    { naam: 'Terborg', lat: 51.9194, lng: 6.3564 },
    { naam: 'Gendringen', lat: 51.8722, lng: 6.3736 },
    { naam: 'Varsselder', lat: 51.8989, lng: 6.4156 },
    { naam: 'Sinderen', lat: 51.8942, lng: 6.4531 },
    { naam: 'Breedenbroek', lat: 51.8883, lng: 6.3461 },
    { naam: 'Voorst', lat: 51.8614, lng: 6.3278 },
    { naam: 'Megchelen', lat: 51.8667, lng: 6.3231 },
    { naam: 'Netterden', lat: 51.8531, lng: 6.3128 },
    { naam: 'Etten', lat: 51.8936, lng: 6.4528 },
    { naam: 'Heelweg', lat: 51.9142, lng: 6.4292 },
    { naam: 'Westendorp', lat: 51.9286, lng: 6.4017 },
    { naam: 'Bontebrug', lat: 51.9042, lng: 6.3714 },
    { naam: 'Kilder', lat: 51.8708, lng: 6.3547 },
    { naam: 'IJzerlo', lat: 51.8819, lng: 6.3869 },
    
    // === ACHTERHOEK WOONPLAATSEN ===
    // Gemeente Aalten
    { naam: 'Aalten', lat: 51.9264, lng: 6.5792 },
    { naam: 'Bredevoort', lat: 51.9417, lng: 6.6194 },
    { naam: 'Dinxperlo', lat: 51.8625, lng: 6.4881 },
    { naam: 'De Heurne', lat: 51.9500, lng: 6.5333 },
    { naam: 'Lintelo', lat: 51.9167, lng: 6.5500 },
    { naam: 'Dale', lat: 51.9333, lng: 6.5667 },
    { naam: 'IJzerlo', lat: 51.9167, lng: 6.5833 },
    
    // Gemeente Berkelland
    { naam: 'Borculo', lat: 52.1147, lng: 6.5225 },
    { naam: 'Eibergen', lat: 52.0989, lng: 6.6486 },
    { naam: 'Neede', lat: 52.1358, lng: 6.6125 },
    { naam: 'Ruurlo', lat: 52.0819, lng: 6.4522 },
    { naam: 'Beltrum', lat: 52.0667, lng: 6.5500 },
    { naam: 'Gelselaar', lat: 52.1333, lng: 6.5167 },
    { naam: 'Haarlo', lat: 52.0833, lng: 6.6000 },
    { naam: 'Rekken', lat: 52.1000, lng: 6.7333 },
    { naam: 'Noordijk', lat: 52.1500, lng: 6.5833 },
    
    // Gemeente Bronckhorst
    { naam: 'Hengelo (Gld)', lat: 52.0653, lng: 6.2697 },
    { naam: 'Vorden', lat: 52.1064, lng: 6.3125 },
    { naam: 'Zelhem', lat: 52.0058, lng: 6.3472 },
    { naam: 'Hummelo', lat: 51.9833, lng: 6.2500 },
    { naam: 'Keppel', lat: 52.0000, lng: 6.2333 },
    { naam: 'Laag-Keppel', lat: 51.9833, lng: 6.2167 },
    { naam: 'Steenderen', lat: 52.0500, lng: 6.1833 },
    { naam: 'Toldijk', lat: 52.0333, lng: 6.2167 },
    { naam: 'Baak', lat: 52.0500, lng: 6.1500 },
    { naam: 'Drempt', lat: 52.0167, lng: 6.1500 },
    { naam: 'Olburgen', lat: 52.0333, lng: 6.1167 },
    { naam: 'Kranenburg', lat: 52.0667, lng: 6.2333 },
    { naam: 'Wichmond', lat: 52.0833, lng: 6.1833 },
    { naam: 'Veldhoek', lat: 52.0167, lng: 6.3000 },
    
    // Gemeente Doetinchem
    { naam: 'Doetinchem', lat: 51.9647, lng: 6.2892 },
    { naam: 'Gaanderen', lat: 51.9353, lng: 6.3236 },
    { naam: 'Wehl', lat: 51.9467, lng: 6.2117 },
    { naam: 'Nieuw-Wehl', lat: 51.9500, lng: 6.2333 },
    { naam: 'Langerak', lat: 51.9500, lng: 6.3000 },
    
    // Gemeente Lochem
    { naam: 'Lochem', lat: 52.1597, lng: 6.4139 },
    { naam: 'Gorssel', lat: 52.1833, lng: 6.2000 },
    { naam: 'Epse', lat: 52.2000, lng: 6.1667 },
    { naam: 'Almen', lat: 52.1500, lng: 6.3167 },
    { naam: 'Laren', lat: 52.1833, lng: 6.3667 },
    { naam: 'Barchem', lat: 52.1333, lng: 6.4833 },
    { naam: 'Harfsen', lat: 52.1833, lng: 6.2500 },
    { naam: 'Joppe', lat: 52.1667, lng: 6.2167 },
    { naam: 'Zwiep', lat: 52.1500, lng: 6.4333 },
    { naam: 'Exel', lat: 52.1333, lng: 6.4500 },
    
    // Gemeente Montferland
    { naam: "'s-Heerenberg", lat: 51.8747, lng: 6.2453 },
    { naam: 'Didam', lat: 51.9372, lng: 6.1264 },
    { naam: 'Zeddam', lat: 51.8833, lng: 6.2000 },
    { naam: 'Beek', lat: 51.8500, lng: 6.1833 },
    { naam: 'Loerbeek', lat: 51.8667, lng: 6.1667 },
    { naam: 'Stokkum', lat: 51.8667, lng: 6.2333 },
    { naam: 'Braamt', lat: 51.8500, lng: 6.2167 },
    { naam: 'Lengel', lat: 51.8833, lng: 6.2667 },
    { naam: 'Kilder', lat: 51.8708, lng: 6.3547 },
    { naam: 'Azewijn', lat: 51.8833, lng: 6.2833 },
    { naam: 'Nieuw-Dijk', lat: 51.9167, lng: 6.1500 },
    { naam: 'Loil', lat: 51.9333, lng: 6.0833 },
    
    // Gemeente Oost Gelre
    { naam: 'Groenlo', lat: 52.0439, lng: 6.6139 },
    { naam: 'Lichtenvoorde', lat: 51.9872, lng: 6.5639 },
    { naam: 'Zieuwent', lat: 52.0167, lng: 6.5167 },
    { naam: 'Harreveld', lat: 51.9833, lng: 6.5000 },
    { naam: 'Mariënvelde', lat: 52.0000, lng: 6.4667 },
    { naam: 'Vragender', lat: 52.0333, lng: 6.5833 },
    { naam: 'Lievelde', lat: 52.0167, lng: 6.6000 },
    
    // Gemeente Winterswijk
    { naam: 'Winterswijk', lat: 51.9706, lng: 6.7194 },
    { naam: 'Woold', lat: 51.9833, lng: 6.7500 },
    { naam: 'Kotten', lat: 51.9500, lng: 6.7833 },
    { naam: 'Miste', lat: 51.9333, lng: 6.7167 },
    { naam: 'Corle', lat: 51.9500, lng: 6.6667 },
    { naam: 'Henxel', lat: 51.9833, lng: 6.6667 },
    { naam: 'Meddo', lat: 51.9833, lng: 6.7833 },
    { naam: 'Ratum', lat: 51.9500, lng: 6.7500 },
    
    // Gemeente Zutphen
    { naam: 'Zutphen', lat: 52.1383, lng: 6.2014 },
    { naam: 'Warnsveld', lat: 52.1333, lng: 6.2333 },
    
    // === LIEMERS WOONPLAATSEN ===
    // Gemeente Zevenaar
    { naam: 'Zevenaar', lat: 51.9308, lng: 6.0728 },
    { naam: 'Duiven', lat: 51.9467, lng: 6.0164 },
    { naam: 'Westervoort', lat: 51.9558, lng: 5.9722 },
    { naam: 'Angerlo', lat: 51.9833, lng: 6.0833 },
    { naam: 'Lathum', lat: 51.9667, lng: 6.0500 },
    { naam: 'Groessen', lat: 51.9167, lng: 6.0667 },
    { naam: 'Loo', lat: 51.9167, lng: 6.1000 },
    { naam: 'Pannerden', lat: 51.8833, lng: 6.0333 },
    { naam: 'Aerdt', lat: 51.8667, lng: 6.0667 },
    { naam: 'Herwen', lat: 51.8667, lng: 6.0333 },
    { naam: 'Lobith', lat: 51.8667, lng: 6.1000 },
    { naam: 'Spijk', lat: 51.8500, lng: 6.0833 },
    { naam: 'Tolkamer', lat: 51.8500, lng: 6.1000 },
    { naam: 'Babberich', lat: 51.9000, lng: 6.0500 },
    { naam: 'Giesbeek', lat: 51.9833, lng: 6.0500 },
    
    // === VELUWE & GELDERLAND ===
    { naam: 'Arnhem', lat: 51.9851, lng: 5.8987 },
    { naam: 'Velp', lat: 52.0000, lng: 5.9667 },
    { naam: 'Rheden', lat: 52.0167, lng: 6.0333 },
    { naam: 'Dieren', lat: 52.0500, lng: 6.1000 },
    { naam: 'Ellecom', lat: 52.0333, lng: 6.0833 },
    { naam: 'De Steeg', lat: 52.0333, lng: 6.0500 },
    { naam: 'Rozendaal', lat: 52.0167, lng: 5.9667 },
    { naam: 'Oosterbeek', lat: 51.9833, lng: 5.8500 },
    { naam: 'Renkum', lat: 51.9667, lng: 5.7333 },
    { naam: 'Heelsum', lat: 51.9833, lng: 5.7667 },
    { naam: 'Doorwerth', lat: 51.9667, lng: 5.7833 },
    { naam: 'Wolfheze', lat: 52.0000, lng: 5.7833 },
    { naam: 'Wageningen', lat: 51.9692, lng: 5.6653 },
    { naam: 'Bennekom', lat: 52.0000, lng: 5.6667 },
    { naam: 'Ede', lat: 52.0383, lng: 5.6650 },
    { naam: 'Lunteren', lat: 52.0833, lng: 5.6167 },
    { naam: 'Barneveld', lat: 52.1378, lng: 5.5875 },
    { naam: 'Voorthuizen', lat: 52.1833, lng: 5.6167 },
    { naam: 'Apeldoorn', lat: 52.2112, lng: 5.9699 },
    { naam: 'Beekbergen', lat: 52.1667, lng: 5.9667 },
    { naam: 'Loenen', lat: 52.1333, lng: 6.0167 },
    { naam: 'Eerbeek', lat: 52.1000, lng: 6.0500 },
    { naam: 'Hall', lat: 52.1167, lng: 6.0833 },
    { naam: 'Brummen', lat: 52.0833, lng: 6.1500 },
    { naam: 'Voorst', lat: 52.1667, lng: 6.1333 },
    { naam: 'Twello', lat: 52.2333, lng: 6.1000 },
    { naam: 'Terwolde', lat: 52.2667, lng: 6.0833 },
    { naam: 'Deventer', lat: 52.2550, lng: 6.1639 },
    { naam: 'Harderwijk', lat: 52.3419, lng: 5.6208 },
    { naam: 'Ermelo', lat: 52.2989, lng: 5.6222 },
    { naam: 'Putten', lat: 52.2500, lng: 5.6000 },
    { naam: 'Nunspeet', lat: 52.3767, lng: 5.7856 },
    { naam: 'Elburg', lat: 52.4492, lng: 5.8350 },
    { naam: "'t Harde", lat: 52.4167, lng: 5.8833 },
    { naam: 'Epe', lat: 52.3500, lng: 5.9833 },
    { naam: 'Vaassen', lat: 52.2833, lng: 5.9667 },
    { naam: 'Heerde', lat: 52.3833, lng: 6.0333 },
    { naam: 'Wapenveld', lat: 52.4333, lng: 6.0667 },
    { naam: 'Hattem', lat: 52.4667, lng: 6.0667 },
    
    // === BETUWE & RIVIERENLAND ===
    { naam: 'Nijmegen', lat: 51.8426, lng: 5.8546 },
    { naam: 'Wijchen', lat: 51.8000, lng: 5.7333 },
    { naam: 'Beuningen', lat: 51.8500, lng: 5.7667 },
    { naam: 'Druten', lat: 51.8833, lng: 5.6000 },
    { naam: 'Tiel', lat: 51.8867, lng: 5.4317 },
    { naam: 'Culemborg', lat: 51.9556, lng: 5.2278 },
    { naam: 'Geldermalsen', lat: 51.8833, lng: 5.2833 },
    { naam: 'Zaltbommel', lat: 51.8000, lng: 5.2500 },
    { naam: 'Elst', lat: 51.9167, lng: 5.8333 },
    { naam: 'Huissen', lat: 51.9333, lng: 5.9333 },
    { naam: 'Bemmel', lat: 51.8833, lng: 5.9000 },
    { naam: 'Gendt', lat: 51.8833, lng: 5.9667 },
    { naam: 'Veenendaal', lat: 52.0283, lng: 5.5583 },
    { naam: 'Rhenen', lat: 51.9592, lng: 5.5681 },
    { naam: 'Kesteren', lat: 51.9333, lng: 5.5667 },
    { naam: 'Opheusden', lat: 51.9333, lng: 5.6333 },
    { naam: 'Dodewaard', lat: 51.9000, lng: 5.6500 },
    
    // === OVERIJSSEL ===
    { naam: 'Enschede', lat: 52.2215, lng: 6.8937 },
    { naam: 'Hengelo', lat: 52.2661, lng: 6.7931 },
    { naam: 'Almelo', lat: 52.3567, lng: 6.6681 },
    { naam: 'Oldenzaal', lat: 52.3133, lng: 6.9292 },
    { naam: 'Borne', lat: 52.3000, lng: 6.7500 },
    { naam: 'Haaksbergen', lat: 52.1500, lng: 6.7333 },
    { naam: 'Losser', lat: 52.2667, lng: 7.0000 },
    { naam: 'Denekamp', lat: 52.3833, lng: 7.0000 },
    { naam: 'Zwolle', lat: 52.5168, lng: 6.0830 },
    { naam: 'Kampen', lat: 52.5500, lng: 5.9167 },
    
    // === NOORD-BRABANT ===
    { naam: 'Eindhoven', lat: 51.4416, lng: 5.4697 },
    { naam: "'s-Hertogenbosch", lat: 51.6978, lng: 5.3037 },
    { naam: 'Tilburg', lat: 51.5555, lng: 5.0913 },
    { naam: 'Breda', lat: 51.5719, lng: 4.7683 },
    { naam: 'Helmond', lat: 51.4833, lng: 5.6500 },
    { naam: 'Oss', lat: 51.7667, lng: 5.5167 },
    
    // === LIMBURG ===
    { naam: 'Maastricht', lat: 50.8514, lng: 5.6910 },
    { naam: 'Venlo', lat: 51.3704, lng: 6.1724 },
    { naam: 'Roermond', lat: 51.1943, lng: 5.9875 },
    { naam: 'Sittard', lat: 51.0000, lng: 5.8667 },
    { naam: 'Heerlen', lat: 50.8833, lng: 5.9833 },
    { naam: 'Weert', lat: 51.2500, lng: 5.7000 },
    
    // === RANDSTAD ===
    { naam: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
    { naam: 'Rotterdam', lat: 51.9244, lng: 4.4777 },
    { naam: 'Den Haag', lat: 52.0705, lng: 4.3007 },
    { naam: 'Utrecht', lat: 52.0907, lng: 5.1214 },
    { naam: 'Leiden', lat: 52.1601, lng: 4.4970 },
    { naam: 'Haarlem', lat: 52.3874, lng: 4.6462 },
    { naam: 'Amersfoort', lat: 52.1561, lng: 5.3878 },
    { naam: 'Hilversum', lat: 52.2292, lng: 5.1669 },
    { naam: 'Almere', lat: 52.3508, lng: 5.2647 },
    { naam: 'Lelystad', lat: 52.5185, lng: 5.4714 },
    { naam: 'Alkmaar', lat: 52.6324, lng: 4.7534 },
    { naam: 'Zaandam', lat: 52.4389, lng: 4.8261 },
    { naam: 'Hoorn', lat: 52.6422, lng: 5.0597 },
    { naam: 'Purmerend', lat: 52.5050, lng: 4.9597 },
    { naam: 'Dordrecht', lat: 51.8133, lng: 4.6901 },
    { naam: 'Delft', lat: 52.0116, lng: 4.3571 },
    { naam: 'Zoetermeer', lat: 52.0575, lng: 4.4931 },
    { naam: 'Gouda', lat: 52.0175, lng: 4.7086 },
    { naam: 'Alphen aan den Rijn', lat: 52.1292, lng: 4.6575 },
    { naam: 'Nieuwegein', lat: 52.0333, lng: 5.0833 },
    { naam: 'Woerden', lat: 52.0833, lng: 4.8833 },
    { naam: 'IJsselstein', lat: 52.0167, lng: 5.0333 },
    
    // === ZEELAND ===
    { naam: 'Middelburg', lat: 51.4988, lng: 3.6136 },
    { naam: 'Vlissingen', lat: 51.4536, lng: 3.5736 },
    { naam: 'Goes', lat: 51.5044, lng: 3.8900 },
    { naam: 'Terneuzen', lat: 51.3333, lng: 3.8333 },
    
    // === NOORD-NEDERLAND ===
    { naam: 'Groningen', lat: 53.2194, lng: 6.5665 },
    { naam: 'Leeuwarden', lat: 53.2012, lng: 5.7999 },
    { naam: 'Assen', lat: 52.9925, lng: 6.5625 },
    { naam: 'Emmen', lat: 52.7792, lng: 6.9069 },
    { naam: 'Hoogeveen', lat: 52.7239, lng: 6.4761 },
    { naam: 'Meppel', lat: 52.6961, lng: 6.1944 },
    { naam: 'Drachten', lat: 53.1128, lng: 6.0989 },
    { naam: 'Heerenveen', lat: 52.9592, lng: 5.9250 },
    { naam: 'Sneek', lat: 53.0328, lng: 5.6619 },
    { naam: 'Coevorden', lat: 52.6667, lng: 6.7333 },
    { naam: 'Stadskanaal', lat: 52.9833, lng: 6.9500 },
    { naam: 'Veendam', lat: 53.1000, lng: 6.8833 },
    { naam: 'Winschoten', lat: 53.1500, lng: 7.0333 },
  ];

  // Complete lijst van alle Nederlandse woonplaatsnamen (voor autocomplete)
  // Bron: CBS/BAG - Basisregistratie Adressen en Gebouwen (circa 2500 woonplaatsen)
  const alleWoonplaatsnamen = [
    "'s-Gravendeel", "'s-Gravenhage", "'s-Gravenpolder", "'s-Gravenzande", "'s-Heer Abtskerke",
    "'s-Heer Arendskerke", "'s-Heerenberg", "'s-Hertogenbosch", "'t Harde", "'t Veld", "'t Zand",
    "Aadorp", "Aalden", "Aalsmeer", "Aalst", "Aalsum", "Aalten", "Aardenburg", "Aarlanderveen",
    "Aarle-Rixtel", "Aartswoud", "Abbekerk", "Abbenes", "Abcoude", "Achterveld", "Achthuizen",
    "Acquoy", "Adorp", "Aduard", "Aerdt", "Afferden", "Akersloot", "Akkrum", "Albergen",
    "Alblasserdam", "Aldeboarn", "Aldtsjerk", "Alem", "Alkmaar", "Almelo", "Almere", "Almkerk",
    "Alphen", "Alphen aan den Rijn", "Altforst", "Ambt Delden", "Ameide", "America", "Amerongen",
    "Amersfoort", "Ammerstol", "Ammerzoden", "Amstelveen", "Amsterdam", "Andel", "Andelst",
    "Anderen", "Andijk", "Ane", "Angeren", "Angerlo", "Anjum", "Ankeveen", "Anna Paulowna",
    "Annen", "Apeldoorn", "Appelscha", "Appeltern", "Appingedam", "Arcen", "Arkel", "Arnemuiden",
    "Arnhem", "Asperen", "Assen", "Assendelft", "Asten", "Avenhorn", "Axel", "Azewijn",
    "Baak", "Baaium", "Baambrugge", "Baard", "Baarland", "Baarlo", "Baarle-Nassau", "Baarn",
    "Baars", "Babberich", "Babyloniënbroek", "Badhoevedorp", "Baexem", "Bakel", "Bakhuizen",
    "Balgoij", "Balk", "Balloo", "Banholt", "Bant", "Barchem", "Barger-Compascuum", "Barneveld",
    "Barsingerhorn", "Batenburg", "Bathmen", "Bavel", "Bedum", "Beegden", "Beek", "Beekbergen",
    "Beemte Broekland", "Beers", "Beesd", "Beesel", "Beetgum", "Beetgumermolen", "Beetsterzwaag",
    "Beilen", "Beinsdorp", "Belfeld", "Bellingwolde", "Beltrum", "Bemelen", "Bemmel",
    "Beneden-Leeuwen", "Bennekom", "Bennebroek", "Benningbroek", "Benthuizen", "Bentelo",
    "Berg en Dal", "Berg en Terblijt", "Bergambacht", "Bergen", "Bergen aan Zee", "Bergen op Zoom",
    "Bergentheim", "Bergeijk", "Berghem", "Bergharen", "Bergschenhoek", "Beringe",
    "Berkel en Rodenrijs", "Berkel-Enschot", "Berkenwoude", "Berlicum", "Best", "Beugen",
    "Beusichem", "Beuningen", "Beverwijk", "Biddinghuizen", "Bierum", "Biervliet",
    "Biest-Houtakker", "Biggekerke", "Bilthoven", "Bingelrade", "Bitgum", "Bitgummole", "Bladel",
    "Blaricum", "Blauwhuis", "Bleiswijk", "Blerick", "Blesdijke", "Bleskensgraaf", "Blija",
    "Blitterswijck", "Bloemendaal", "Blokker", "Blokzijl", "Boazum", "Bocholtz", "Bodegraven",
    "Boekel", "Boelenslaan", "Boerakker", "Boijl", "Boksum", "Bolsward", "Bontebrug", "Borculo",
    "Borger", "Borgsweer", "Born", "Borne", "Bornerbroek", "Bornwird", "Borsele", "Bosch en Duin",
    "Boskoop", "Boven-Leeuwen", "Bovenkarspel", "Bovensmilde", "Boxmeer", "Boxtel", "Braamt",
    "Brakel", "Breda", "Bredevoort", "Breedenbroek", "Breezand", "Breskens", "Breukelen",
    "Breukeleveen", "Brielle", "Britsum", "Broek in Waterland", "Broek op Langedijk",
    "Broekhuizen", "Broekhuizenvorst", "Broekland", "Bronneger", "Brouwershaven", "Brucht",
    "Bruchem", "Bruinisse", "Brummen", "Brunssum", "Buchten", "Budel", "Budel-Dorplein",
    "Budel-Schoot", "Buggenum", "Buitenkaag", "Buitenpost", "Bunde", "Bunne", "Bunnik",
    "Bunschoten-Spakenburg", "Buren", "Burgerbrug", "Burgum", "Burgwerd", "Burum", "Bussum",
    "Cadier en Keer", "Cadzand", "Callantsoog", "Capelle aan den IJssel", "Castenray",
    "Casteren", "Castricum", "Chaam", "Clinge", "Coevorden", "Colijnsplaat", "Collendoorn",
    "Colmschate", "Corle", "Cothen", "Creil", "Cromvoirt", "Cuijk", "Culemborg",
    "Daarle", "Dale", "Dalen", "Dalfsen", "Dalmsholte", "Damwoude", "De Bilt", "De Blesse",
    "De Cocksdorp", "De Glind", "De Goorn", "De Heurne", "De Kiel", "De Klomp", "De Koog",
    "De Krim", "De Lier", "De Lutte", "De Meern", "De Moer", "De Mortel", "De Punt", "De Rijp",
    "De Rips", "De Steeg", "De Waal", "De Weere", "De Wijk", "De Wilp", "De Zilk", "Dedemsvaart",
    "Deersum", "Deil", "Delden", "Delfgauw", "Delfstrahuizen", "Delft", "Delfzijl", "Den Andel",
    "Den Bommel", "Den Burg", "Den Dolder", "Den Dungen", "Den Haag", "Den Ham", "Den Helder",
    "Den Hoorn", "Den Hout", "Den Ilp", "Den Oever", "Denekamp", "Deurne", "Deurningen",
    "Deventer", "Didam", "Dieden", "Diepenheim", "Dieren", "Diessen", "Diever", "Diffelen",
    "Dinteloord", "Dinxperlo", "Dirkshorn", "Dirksland", "Dodewaard", "Doesburg", "Doetinchem",
    "Doezum", "Dokkum", "Domburg", "Dongen", "Dongjum", "Doorn", "Doornenburg", "Doornspijk",
    "Doorwerth", "Dordrecht", "Dorkwerd", "Dorst", "Drachten", "Dreischor", "Drempt", "Dreumel",
    "Driebergen-Rijsenburg", "Driel", "Driemond", "Drijber", "Dronrijp", "Dronten",
    "Drouwenermond", "Drouwenerveen", "Drunen", "Druten", "Duiven", "Duivendrecht", "Duizel",
    "Dussen", "Dwingeloo",
    "Easterein", "Eastermar", "Echt", "Echten", "Echtenerbrug", "Edam", "Ede", "Eede", "Eefde",
    "Eelde", "Eelderwolde", "Eemnes", "Eemshaven", "Eenrum", "Eerbeek", "Eersel", "Eethen",
    "Eext", "Eexterveen", "Egchel", "Egmond aan den Hoef", "Egmond aan Zee", "Egmond-Binnen",
    "Eibergen", "Eijsden", "Eindhoven", "Einighausen", "Elburg", "Elim", "Ellemeet", "Ellecom",
    "Ellertshaar", "Ellewoutsdijk", "Elp", "Elshout", "Elspeet", "Elst", "Elsloo", "Emmeloord",
    "Emmen", "Emmer-Compascuum", "Emst", "Engelen", "Engelum", "Enkhuizen", "Ens", "Enschede",
    "Enter", "Enumatil", "Epe", "Epen", "Epse", "Erica", "Erichem", "Erm", "Ermelo", "Erp",
    "Escharen", "Espel", "Est", "Etten", "Etten-Leur", "Exel", "Exloo", "Exmorra",
    "Farmsum", "Feanwâlden", "Ferwert", "Fijnaart", "Finsterwolde", "Fleringen", "Fochteloo",
    "Follega", "Formerum", "Foxhol", "Franeker", "Frederiksoord", "Frieschepalen",
    "Gaanderen", "Gaast", "Gaastmeer", "Gapinge", "Garmerwolde", "Garrelsweer", "Garyp",
    "Gasselte", "Gasselternijveen", "Geervliet", "Gees", "Geesbrug", "Geesteren", "Geffen",
    "Geldermalsen", "Geldrop", "Geleen", "Gelselaar", "Gendringen", "Gendt", "Genemuiden",
    "Gennep", "Geulle", "Giessen", "Giessenburg", "Gieterveen", "Giethoorn", "Gieten", "Gilze",
    "Glane", "Glanerbrug", "Goes", "Goirle", "Goor", "Gorinchem", "Gorredijk", "Gorssel",
    "Gouda", "Gouderak", "Goudriaan", "Goudswaard", "Goutum", "Grafhorst", "Graft",
    "Gramsbergen", "Grashoek", "Grathem", "Grave", "Grevenbicht", "Griendtsveen", "Grijpskerk",
    "Grijpskerke", "Groenlo", "Groesbeek", "Groessen", "Groet", "Groningen", "Gronsveld",
    "Groot-Ammers", "Grootebroek", "Grootegast", "Grootschermer", "Grou", "Grubbenvorst",
    "Gulpen",
    "Haaften", "Haalderen", "Haamstede", "Haaren", "Haarle", "Haarlem", "Haarlemmerliede",
    "Haarzuilens", "Haastrecht", "Haelen", "Haghorst", "Halfweg", "Hall", "Halle", "Hallum",
    "Halsteren", "Handel", "Hank", "Hansweert", "Hantum", "Hantumhuizen", "Hapert", "Haps",
    "Hardenberg", "Harderwijk", "Hardinxveld-Giessendam", "Haren", "Harich", "Harlingen",
    "Harfsen", "Harmelen", "Harreveld", "Harskamp", "Hasselt", "Hattem", "Haulerwijk", "Haule",
    "Havelte", "Hedel", "Hedikhuizen", "Heeg", "Heel", "Heelsum", "Heelweg", "Heemskerk",
    "Heemstede", "Heenvliet", "Heerde", "Heerenveen", "Heerewaarden", "Heerhugowaard",
    "Heerlen", "Heeten", "Heeze", "Heijningen", "Heiligerlee", "Heiloo", "Heinenoord",
    "Heinkenszand", "Heino", "Hekelingen", "Helden", "Hellendoorn", "Hellevoetsluis", "Hellouw",
    "Helmond", "Helvoirt", "Hem", "Hemelum", "Hemmen", "Hengelo", "Hengelo (Gld)", "Hengevelde",
    "Henxel", "Hensbroek", "Herkenbosch", "Herkingen", "Hernen", "Herpen", "Herpt", "Herveld",
    "Herwen", "Herwijnen", "Heteren", "Heukelum", "Heumen", "Heusden", "Hierden", "Hillegom",
    "Hilvarenbeek", "Hilversum", "Hindeloopen", "Hippolytushoef", "Hoedekenskerke", "Hoek",
    "Hoek van Holland", "Hoenderloo", "Hoensbroek", "Hoevelaken", "Hoeven",
    "Hollandsche Rading", "Hollandscheveld", "Hollum", "Holsloot", "Holten", "Holthees",
    "Holthone", "Holtum", "Holwierde", "Hommerts", "Hoofddorp", "Hoofdplaat", "Hoog-Keppel",
    "Hooge Mierde", "Hooge Zwaluwe", "Hoogeloon", "Hoogerheide", "Hoogersmilde", "Hoogeveen",
    "Hoogezand", "Hooghalen", "Hoogkarspel", "Hoogland", "Hooglanderveen", "Hoogmade",
    "Hoogvliet Rotterdam", "Hoogwoud", "Hoorn", "Hoornaar", "Horn", "Horssen", "Horst",
    "Houten", "Houtigehage", "Huijbergen", "Huissen", "Huizen", "Hulsberg", "Hulshorst",
    "Hulst", "Hummelo", "Hunsel",
    "IJhorst", "IJlst", "IJmuiden", "IJsselham", "IJsselmuiden", "IJsselstein", "IJzendijke",
    "IJzendoorn", "IJzerlo", "Ilpendam", "Ingen", "Itteren", "Ittervoort",
    "Jisp", "Jirnsum", "Joppe", "Joure", "Jubbega", "Julianadorp",
    "Kaag", "Kaatsheuvel", "Kalenberg", "Kallenkote", "Kampen", "Kamperland", "Kantens",
    "Kapel Avezaath", "Kapelle", "Kats", "Katwijk", "Katwijk aan Zee", "Katwoude", "Kedichem",
    "Keijenborg", "Kelpen-Oler", "Keppel", "Kerk Avezaath", "Kerkdriel", "Kerkrade", "Kerkwijk",
    "Kessel", "Kesteren", "Kilder", "Kinderdijk", "Klaaswaal", "Klarenbeek", "Klazienaveen",
    "Klein Zundert", "Klimmen", "Kloetinge", "Kloosterburen", "Kloosterhaar", "Kloosterzande",
    "Knegsel", "Kockengen", "Koedijk", "Koekange", "Koewacht", "Kolham", "Kollum",
    "Kollumerpomp", "Kollumerzwaag", "Koog aan de Zaan", "Kootwijkerbroek", "Kotten",
    "Koudekerk aan den Rijn", "Koudum", "Kraggenburg", "Kranenburg", "Krimpen aan de Lek",
    "Krimpen aan den IJssel", "Krommenie", "Kropswolde", "Kruiningen", "Kruisland",
    "Kudelstaart", "Kuinre",
    "Laag-Keppel", "Laag-Soeren", "Lage Mierde", "Lage Vuursche", "Lage Zwaluwe", "Langerak",
    "Langezwaag", "Langweer", "Laren", "Lathum", "Lattrop-Breklenkamp", "Leek", "Leende",
    "Leerbroek", "Leerdam", "Leersum", "Leeuwarden", "Leiden", "Leiderdorp", "Leidschendam",
    "Leimuiden", "Lekkerkerk", "Lelystad", "Lemele", "Lemmer", "Lengel", "Lent", "Lepelstraat",
    "Lettele", "Leusden", "Leuth", "Leuvenheim", "Lichtenvoorde", "Liempde", "Lienden",
    "Lierop", "Lieshout", "Liessel", "Lievelde", "Limbricht", "Limmen", "Linden", "Linne",
    "Linschoten", "Lintelo", "Lisse", "Lithoijen", "Lobith", "Lochem", "Loenen",
    "Loenen aan de Vecht", "Loenersloot", "Loerbeek", "Loil", "Loo", "Loon op Zand",
    "Loosdrecht", "Lopik", "Loppersum", "Losser", "Lottum", "Lunteren", "Lutjebroek",
    "Lutjewinkel", "Luttelgeest", "Luttenberg", "Lutten", "Luyksgestel",
    "Maarheeze", "Maarn", "Maarsbergen", "Maarssen", "Maartensdijk", "Maasbommel",
    "Maasbracht", "Maasbree", "Maasdam", "Maasdijk", "Maashees", "Maasland", "Maassluis",
    "Maastricht", "Macharen", "Made", "Makkinga", "Makkum", "Malden", "Mander", "Mantgum",
    "Margraten", "Mariahout", "Mariënberg", "Mariënheem", "Mariënvelde", "Marken", "Markelo",
    "Marknesse", "Marrum", "Marum", "Maurik", "Mechelen", "Meddo", "Medemblik", "Meeden",
    "Meerlo", "Meerssen", "Megchelen", "Meijel", "Melick", "Melissant", "Menaam", "Meppel",
    "Merselo", "Meteren", "Meterik", "Middelburg", "Middelharnis", "Middenbeemster",
    "Middenmeer", "Midsland", "Mierlo", "Mildam", "Mill", "Millingen aan de Rijn", "Milsbeek",
    "Minnertsga", "Miste", "Moergestel", "Moerkapelle", "Molenaarsgraaf", "Molenhoek",
    "Molenschot", "Monnickendam", "Monster", "Montfoort", "Montfort", "Mook", "Moordrecht",
    "Muiden", "Muiderberg", "Munstergeleen", "Muntendam", "Mussel", "Musselkanaal",
    "Naaldwijk", "Naarden", "Nagele", "Nes", "Netterden", "Nieuw-Amsterdam", "Nieuw-Beijerland",
    "Nieuw-Buinen", "Nieuw-Dijk", "Nieuw-Lekkerland", "Nieuw-Loosdrecht", "Nieuw-Vennep",
    "Nieuw-Vossemeer", "Nieuw-Wehl", "Nieuwdorp", "Nieuwe Niedorp", "Nieuwe Pekela",
    "Nieuwe Tonge", "Nieuwegein", "Nieuwendijk", "Nieuwerkerk", "Nieuwerkerk aan den IJssel",
    "Nieuweschans", "Nieuwkoop", "Nieuwkuijk", "Nieuwleusen", "Nieuwolda", "Nieuwpoort",
    "Nieuwstadt", "Nieuwveen", "Nijbroek", "Nijkerk", "Nijkerkerveen", "Nijland", "Nijmegen",
    "Nijnsel", "Nijverdal", "Nispen", "Nistelrode", "Noardburgum", "Noorbeek",
    "Noord-Scharwoude", "Noordbeemster", "Noordbroek", "Noordeloos", "Noorden", "Noordhorn",
    "Noordijk", "Noordwelle", "Noordwijk", "Noordwijk aan Zee", "Noordwijkerhout",
    "Noordwolde", "Nootdorp", "Norg", "Notter", "Nuenen", "Nuland", "Numansdorp", "Nunspeet",
    "Nuth",
    "Obdam", "Ochten", "Odijk", "Odiliapeel", "Odoorn", "Oeffelt", "Oegstgeest", "Oene",
    "Oentsjerk", "Oirlo", "Oirsbeek", "Oirschot", "Oisterwijk", "Olburgen", "Oldebroek",
    "Oldehove", "Oldemarkt", "Oldenzaal", "Olst", "Ommen", "Ommeren", "Oosterbeek",
    "Oosterhesselen", "Oosterhout", "Oosterland", "Oosternijkerk", "Oosterwolde", "Oosterzee",
    "Oosthem", "Oosthuizen", "Oostkapelle", "Oostrum", "Oostvoorne", "Oostwold", "Oostzaan",
    "Ootmarsum", "Opmeer", "Ophemert", "Opheusden", "Opijnen", "Oploo", "Opperdoes",
    "Oranjewoud", "Orvelte", "Ospel", "Oss", "Ossendrecht", "Otterlo", "Ottersum",
    "Oud Gastel", "Oud-Beijerland", "Oud-Loosdrecht", "Oud-Vossemeer", "Ouddorp",
    "Oude Niedorp", "Oude Pekela", "Oude Wetering", "Oudega", "Oudehaske", "Oudemirdum",
    "Oudenbosch", "Oudenhoorn", "Ouder-Amstel", "Ouderkerk aan de Amstel",
    "Ouderkerk aan den IJssel", "Oudeschild", "Oudewater", "Oudkarspel", "Overloon", "Overveen",
    "Ovezande",
    "Pannerden", "Panningen", "Papendrecht", "Paterswolde", "Peize", "Petten", "Philippine",
    "Piershil", "Pieterburen", "Pijnacker", "Poederoijen", "Poeldijk", "Poortvliet",
    "Posterholt", "Prinsenbeek", "Puiflijk", "Purmerend", "Putten", "Puttershoek",
    "Raalte", "Raamsdonk", "Raamsdonksveer", "Randwijk", "Ratum", "Ravenstein", "Reek",
    "Reeuwijk", "Rekken", "Renkum", "Renswoude", "Ressen", "Reusel", "Reuver", "Rheden",
    "Rhenen", "Rhenoy", "Rhoon", "Ridderkerk", "Riethoven", "Rietmolen", "Rijen", "Rijkevoort",
    "Rijnsburg", "Rijpwetering", "Rijsbergen", "Rijssen", "Rijswijk", "Rinsumageest", "Roden",
    "Roermond", "Roggel", "Rolde", "Roodeschool", "Roosendaal", "Roosteren", "Rossum",
    "Rotterdam", "Rottevalle", "Rozenburg", "Rozendaal", "Rucphen", "Ruinen", "Ruinerwold",
    "Ruurlo", "Rutten",
    "Sambeek", "Santpoort-Noord", "Santpoort-Zuid", "Sappemeer", "Sassenheim", "Sauwerd",
    "Schagen", "Schalkhaar", "Scharendijke", "Schellinkhout", "Scherpenzeel", "Scheemda",
    "Schiermonnikoog", "Schiedam", "Schijndel", "Schildwolde", "Schimmert", "Schin op Geul",
    "Schinnen", "Schinveld", "Schipluiden", "Schoonhoven", "Schoonoord", "Schoonrewoerd",
    "Schoonebeek", "Sellingen", "Sevenum", "Sibculo", "Siddeburen", "Silvolde", "Simpelveld",
    "Sinderen", "Sint Agatha", "Sint Annaland", "Sint Annaparochie", "Sint Anthonis",
    "Sint Jansklooster", "Sint Joost", "Sint Laurens", "Sint Maarten", "Sint Maartensdijk",
    "Sint Michielsgestel", "Sint Nicolaasga", "Sint Odiliënberg", "Sint Oedenrode",
    "Sint Pancras", "Sint Philipsland", "Sint Willibrord", "Sittard", "Slagharen", "Sleen",
    "Sleeuwijk", "Sliedrecht", "Slochteren", "Slootdorp", "Sloten", "Sluis", "Sluiskil",
    "Smilde", "Sneek", "Soest", "Soesterberg", "Someren", "Sommelsdijk", "Son en Breugel",
    "Sondel", "Spakenburg", "Spanbroek", "Spankeren", "Spaubeek", "Spijk", "Spijkenisse",
    "Sprang-Capelle", "Sprundel", "Stadskanaal", "Stampersgat", "Standdaarbuiten", "Staphorst",
    "Stavoren", "Stedum", "Steenbergen", "Steenderen", "Steensel", "Steenwijk", "Steggerda",
    "Stein", "Stellendam", "Sterksel", "Stevensbeek", "Stevensweert", "Stiens", "Stokkum",
    "Stolwijk", "Stompwijk", "Stramproy", "Strijen", "Stuifzand", "Surhuisterveen", "Susteren",
    "Swalmen",
    "Tegelen", "Ten Boer", "Ten Post", "Ter Aar", "Ter Apel", "Ter Apelkanaal", "Terborg",
    "Terheijden", "Terherne", "Termunten", "Ternaard", "Terneuzen", "Terschelling",
    "Teteringen", "Tholen", "Thorn", "Tiel", "Tienhoven", "Tijnje", "Tilburg", "Tilligte",
    "Toldijk", "Tollebeek", "Tolkamer", "Tubbergen", "Twijzel", "Twello", "Tzum", "Tzummarum",
    "Uddel", "Udenhout", "Ugchelen", "Uitdam", "Uitgeest", "Uithoorn", "Uithuizen",
    "Uithuizermeeden", "Ulft", "Ulicoten", "Ulrum", "Ulvenhout", "Ureterp", "Urk", "Urmond",
    "Ursem", "Utrecht",
    "Vaals", "Vaassen", "Valburg", "Valkenburg", "Valkenburg aan de Geul", "Valkenswaard",
    "Varsselder", "Varsseveld", "Vasse", "Veendam", "Veenendaal", "Veenhuizen", "Veenwouden",
    "Veere", "Veessen", "Veghel", "Velddriel", "Velden", "Veldhoven", "Veldhoek", "Velp",
    "Velsen", "Velsen-Noord", "Velsen-Zuid", "Venhorst", "Venhuizen", "Venlo", "Venray",
    "Vianen", "Vierhouten", "Vierlingsbeek", "Vijfhuizen", "Vilsteren", "Vinkeveen",
    "Vlagtwedde", "Vlaardingen", "Vledder", "Vleuten", "Vlieland", "Vlierden", "Vlissingen",
    "Vlijmen", "Vlodrop", "Voerendaal", "Vogelenzang", "Volkel", "Vollenhove", "Voorburg",
    "Voorhout", "Voorschoten", "Voorst", "Voorthuizen", "Vorden", "Vorstenbosch", "Vragender",
    "Vredepeel", "Vreeland", "Vries", "Vriezenveen", "Vroomshoop", "Vrouwenpolder", "Vught",
    "Vuren",
    "Waalre", "Waalwijk", "Waardenburg", "Waarder", "Waarland", "Waddinxveen", "Wagenberg",
    "Wageningen", "Wanroij", "Wanssum", "Wapenveld", "Warffum", "Warmenhuizen", "Warns",
    "Warnsveld", "Waspik", "Wassenaar", "Wateringen", "Wedde", "Weesp", "Wehl", "Wehe-den Hoorn",
    "Welberg", "Wemeldinge", "Werkendam", "Werkhoven", "Wernhout", "Wervershoof", "Wesepe",
    "Wessem", "West-Terschelling", "Westbroek", "Westdorpe", "Westendorp",
    "Westerhaar-Vriezenveensewijk", "Westervoort", "Westkapelle", "Westmaas", "Westzaan",
    "Weurt", "Wezep", "Wichmond", "Wieringerwerf", "Wierden", "Wijchen", "Wijk aan Zee",
    "Wijk bij Duurstede", "Wijlre", "Wijnandsrade", "Wijhe", "Wildervank", "Willemstad",
    "Wilnis", "Wilp", "Winkel", "Winschoten", "Winssen", "Winsum", "Wintelre", "Winterswijk",
    "Wissenkerke", "Witmarsum", "Wittem", "Woensdrecht", "Woerden", "Wognum", "Wolfheze",
    "Wolvega", "Wommels", "Woold", "Workum", "Wormerveer", "Wormer", "Woubrugge", "Woudenberg",
    "Woudsend", "Wouw",
    "Yerseke",
    "Zaandam", "Zaandijk", "Zaamslag", "Zaltbommel", "Zandvoort", "Zeddam", "Zeelst",
    "Zeewolde", "Zegge", "Zegveld", "Zeist", "Zelhem", "Zetten", "Zevenaar", "Zevenhuizen",
    "Zevenhoven", "Zierikzee", "Zieuwent", "Zoelen", "Zoetermeer", "Zoeterwoude", "Zoutelande",
    "Zoutkamp", "Zuid-Beijerland", "Zuid-Scharwoude", "Zuidbroek", "Zuiddorpe", "Zuidhorn",
    "Zuidlaren", "Zuidwolde", "Zundert", "Zutphen", "Zwaag", "Zwaagdijk-Oost", "Zwaagdijk-West",
    "Zwaanshoek", "Zwammerdam", "Zwanenburg", "Zwartsluis", "Zwijndrecht", "Zwolle"
  ];

  // Coördinaten per gemeente (voor fallback als exacte woonplaats niet bekend is)
  const gemeenteCoords = {
    // Achterhoek
    'Oude IJsselstreek': { lat: 51.8958, lng: 6.3789 },
    'Aalten': { lat: 51.9264, lng: 6.5792 },
    'Berkelland': { lat: 52.1147, lng: 6.5225 },
    'Bronckhorst': { lat: 52.0653, lng: 6.2697 },
    'Doetinchem': { lat: 51.9647, lng: 6.2892 },
    'Lochem': { lat: 52.1597, lng: 6.4139 },
    'Montferland': { lat: 51.9050, lng: 6.1850 },
    'Oost Gelre': { lat: 52.0156, lng: 6.5889 },
    'Winterswijk': { lat: 51.9706, lng: 6.7194 },
    'Zutphen': { lat: 52.1383, lng: 6.2014 },
    // Liemers
    'Zevenaar': { lat: 51.9308, lng: 6.0728 },
    'Duiven': { lat: 51.9467, lng: 6.0164 },
    'Westervoort': { lat: 51.9558, lng: 5.9722 },
    // Betuwe
    'Lingewaard': { lat: 51.8900, lng: 5.9200 },
    'Overbetuwe': { lat: 51.9167, lng: 5.8333 },
    // Arnhem/Nijmegen
    'Arnhem': { lat: 51.9851, lng: 5.8987 },
    'Nijmegen': { lat: 51.8426, lng: 5.8546 },
    'Rheden': { lat: 52.0167, lng: 6.0333 },
    'Renkum': { lat: 51.9667, lng: 5.7333 },
    'Rozendaal': { lat: 52.0000, lng: 5.9500 },
    // Veluwe
    'Wageningen': { lat: 51.9692, lng: 5.6653 },
    'Ede': { lat: 52.0383, lng: 5.6650 },
    'Barneveld': { lat: 52.1378, lng: 5.5875 },
    'Apeldoorn': { lat: 52.2112, lng: 5.9699 },
    'Brummen': { lat: 52.0833, lng: 6.1500 },
    'Voorst': { lat: 52.1667, lng: 6.1333 },
    'Epe': { lat: 52.3500, lng: 5.9833 },
    'Heerde': { lat: 52.3833, lng: 6.0333 },
    'Hattem': { lat: 52.4667, lng: 6.0667 },
    // Overijssel
    'Deventer': { lat: 52.2550, lng: 6.1639 },
    'Zwolle': { lat: 52.5168, lng: 6.0830 },
    'Enschede': { lat: 52.2215, lng: 6.8937 },
    'Hengelo': { lat: 52.2661, lng: 6.7931 },
    // Grote steden
    'Amsterdam': { lat: 52.3676, lng: 4.9041 },
    'Rotterdam': { lat: 51.9244, lng: 4.4777 },
    'Den Haag': { lat: 52.0705, lng: 4.3007 },
    'Utrecht': { lat: 52.0907, lng: 5.1214 },
    'Eindhoven': { lat: 51.4416, lng: 5.4697 },
    'Groningen': { lat: 53.2194, lng: 6.5665 },
    'Maastricht': { lat: 50.8514, lng: 5.6910 },
    'Almere': { lat: 52.3508, lng: 5.2647 },
    'Hilversum': { lat: 52.2292, lng: 5.1669 },
    'Amersfoort': { lat: 52.1561, lng: 5.3878 },
    'Breda': { lat: 51.5719, lng: 4.7683 },
    'Tilburg': { lat: 51.5555, lng: 5.0913 },
    'Leiden': { lat: 52.1601, lng: 4.4970 },
    'Haarlem': { lat: 52.3874, lng: 4.6462 },
    'Dordrecht': { lat: 51.8133, lng: 4.6901 },
    'Zoetermeer': { lat: 52.0575, lng: 4.4931 },
    'Delft': { lat: 52.0116, lng: 4.3571 },
  };

  // Woonplaats naar gemeente mapping (voor fallback coördinaten)
  const woonplaatsGemeente = {
    // Oude IJsselstreek
    'Ulft': 'Oude IJsselstreek', 'Silvolde': 'Oude IJsselstreek', 'Terborg': 'Oude IJsselstreek',
    'Gendringen': 'Oude IJsselstreek', 'Varsselder': 'Oude IJsselstreek', 'Sinderen': 'Oude IJsselstreek',
    'Breedenbroek': 'Oude IJsselstreek', 'Megchelen': 'Oude IJsselstreek', 'Netterden': 'Oude IJsselstreek',
    'Etten': 'Oude IJsselstreek', 'Heelweg': 'Oude IJsselstreek', 'Westendorp': 'Oude IJsselstreek',
    'Bontebrug': 'Oude IJsselstreek', 'Kilder': 'Oude IJsselstreek', 'IJzerlo': 'Oude IJsselstreek',
    // Aalten
    'Aalten': 'Aalten', 'Bredevoort': 'Aalten', 'Dinxperlo': 'Aalten', 'De Heurne': 'Aalten',
    'Lintelo': 'Aalten', 'Dale': 'Aalten',
    // Berkelland
    'Borculo': 'Berkelland', 'Eibergen': 'Berkelland', 'Neede': 'Berkelland', 'Ruurlo': 'Berkelland',
    'Beltrum': 'Berkelland', 'Gelselaar': 'Berkelland', 'Haarlo': 'Berkelland', 'Rekken': 'Berkelland',
    // Bronckhorst
    'Hengelo (Gld)': 'Bronckhorst', 'Vorden': 'Bronckhorst', 'Zelhem': 'Bronckhorst',
    'Hummelo': 'Bronckhorst', 'Keppel': 'Bronckhorst', 'Laag-Keppel': 'Bronckhorst',
    'Steenderen': 'Bronckhorst', 'Toldijk': 'Bronckhorst', 'Baak': 'Bronckhorst',
    'Drempt': 'Bronckhorst', 'Hoog-Keppel': 'Bronckhorst', 'Wichmond': 'Bronckhorst',
    // Doetinchem
    'Doetinchem': 'Doetinchem', 'Gaanderen': 'Doetinchem', 'Wehl': 'Doetinchem',
    // Montferland
    "'s-Heerenberg": 'Montferland', 'Didam': 'Montferland', 'Zeddam': 'Montferland',
    'Beek': 'Montferland', 'Loerbeek': 'Montferland', 'Stokkum': 'Montferland', 'Braamt': 'Montferland',
    'Azewijn': 'Montferland', 'Nieuw-Dijk': 'Montferland', 'Loil': 'Montferland',
    // Oost Gelre
    'Groenlo': 'Oost Gelre', 'Lichtenvoorde': 'Oost Gelre', 'Zieuwent': 'Oost Gelre',
    'Harreveld': 'Oost Gelre', 'Mariënvelde': 'Oost Gelre', 'Vragender': 'Oost Gelre', 'Lievelde': 'Oost Gelre',
    // Winterswijk
    'Winterswijk': 'Winterswijk', 'Woold': 'Winterswijk', 'Kotten': 'Winterswijk',
    'Miste': 'Winterswijk', 'Corle': 'Winterswijk', 'Henxel': 'Winterswijk', 'Meddo': 'Winterswijk',
    // Zevenaar/Liemers
    'Zevenaar': 'Zevenaar', 'Angerlo': 'Zevenaar', 'Lathum': 'Zevenaar', 'Groessen': 'Zevenaar',
    'Babberich': 'Zevenaar', 'Lobith': 'Zevenaar', 'Tolkamer': 'Zevenaar', 'Spijk': 'Zevenaar',
    'Pannerden': 'Zevenaar', 'Aerdt': 'Zevenaar', 'Herwen': 'Zevenaar', 'Loo': 'Zevenaar',
    'Duiven': 'Duiven', 'Groessen': 'Duiven',
    'Westervoort': 'Westervoort',
    // Lingewaard
    'Bemmel': 'Lingewaard', 'Huissen': 'Lingewaard', 'Gendt': 'Lingewaard', 'Angeren': 'Lingewaard',
    'Doornenburg': 'Lingewaard', 'Haalderen': 'Lingewaard', 'Ressen': 'Lingewaard',
    // Overbetuwe
    'Elst': 'Overbetuwe', 'Zetten': 'Overbetuwe', 'Driel': 'Overbetuwe', 'Heteren': 'Overbetuwe',
    'Randwijk': 'Overbetuwe', 'Herveld': 'Overbetuwe', 'Andelst': 'Overbetuwe', 'Valburg': 'Overbetuwe',
    'Oosterhout': 'Overbetuwe', 'Slijk-Ewijk': 'Overbetuwe',
    // Nijmegen
    'Nijmegen': 'Nijmegen', 'Lent': 'Nijmegen', 'Oosterhout': 'Nijmegen', 'Hatert': 'Nijmegen',
    // Arnhem e.o.
    'Arnhem': 'Arnhem', 'Velp': 'Rheden', 'Rheden': 'Rheden', 'Dieren': 'Rheden', 'De Steeg': 'Rheden',
    'Ellecom': 'Rheden', 'Laag-Soeren': 'Rheden', 'Spankeren': 'Rheden',
    'Oosterbeek': 'Renkum', 'Doorwerth': 'Renkum', 'Wolfheze': 'Renkum', 'Renkum': 'Renkum', 'Heelsum': 'Renkum',
    'Rozendaal': 'Arnhem',
    'Wageningen': 'Wageningen',
    'Ede': 'Ede', 'Bennekom': 'Ede', 'Lunteren': 'Ede', 'Otterlo': 'Ede', 'Harskamp': 'Ede',
    'Barneveld': 'Barneveld', 'Voorthuizen': 'Barneveld', 'Kootwijkerbroek': 'Barneveld',
    // Apeldoorn e.o.
    'Apeldoorn': 'Apeldoorn', 'Beekbergen': 'Apeldoorn', 'Loenen': 'Apeldoorn', 'Hoenderloo': 'Apeldoorn', 'Ugchelen': 'Apeldoorn',
    'Brummen': 'Brummen', 'Eerbeek': 'Brummen', 'Hall': 'Brummen',
    'Twello': 'Voorst', 'Terwolde': 'Voorst',
    'Deventer': 'Deventer', 'Bathmen': 'Deventer', 'Schalkhaar': 'Deventer',
    'Epe': 'Epe', 'Vaassen': 'Epe', 'Emst': 'Epe',
    'Heerde': 'Heerde', 'Wapenveld': 'Heerde',
    'Hattem': 'Hattem',
    // Grote steden
    'Amsterdam': 'Amsterdam', 'Rotterdam': 'Rotterdam', 'Den Haag': 'Den Haag',
    'Utrecht': 'Utrecht', 'Eindhoven': 'Eindhoven', 'Groningen': 'Groningen',
    'Maastricht': 'Maastricht', 'Zwolle': 'Zwolle', 'Enschede': 'Enschede', 'Hengelo': 'Hengelo',
    'Almere': 'Almere', 'Hilversum': 'Hilversum', 'Amersfoort': 'Amersfoort',
    'Breda': 'Breda', 'Tilburg': 'Tilburg', 'Leiden': 'Leiden', 'Haarlem': 'Haarlem',
    'Dordrecht': 'Dordrecht', 'Zoetermeer': 'Zoetermeer', 'Delft': 'Delft',
  };

  // Functie om coördinaten te krijgen voor een woonplaats
  const getWoonplaatsCoords = (plaats) => {
    if (!plaats) return null;
    
    const plaatsLower = plaats.toLowerCase();
    
    // 1. Zoek eerst exacte match in woonplaatsen array (met exacte coördinaten)
    const found = woonplaatsen.find(w => w.naam.toLowerCase() === plaatsLower);
    if (found) {
      return { lat: found.lat, lng: found.lng };
    }
    
    // 2. Zoek in woonplaatsGemeente mapping (case-insensitive)
    const gemeenteKey = Object.keys(woonplaatsGemeente).find(key => key.toLowerCase() === plaatsLower);
    if (gemeenteKey) {
      const gemeente = woonplaatsGemeente[gemeenteKey];
      if (gemeenteCoords[gemeente]) {
        return gemeenteCoords[gemeente];
      }
    }
    
    // 3. Check of de plaatsnaam zelf een gemeente is (case-insensitive)
    const gemeenteDirectKey = Object.keys(gemeenteCoords).find(key => key.toLowerCase() === plaatsLower);
    if (gemeenteDirectKey) {
      return gemeenteCoords[gemeenteDirectKey];
    }
    
    // 4. Geen coördinaten gevonden - return null (afstand kan niet berekend worden)
    return null;
  };
  
  // Functie om coördinaten te krijgen voor een postcode (behouden voor backwards compatibility)
  const getPostcodeCoords = (pc) => {
    if (!pc) return null;
    const pc4 = pc.toString().substring(0, 4);
    
    // Exacte match
    if (postcodeCoords[pc4]) {
      return postcodeCoords[pc4];
    }
    
    // Zoek dichtstbijzijnde bekende postcode
    const pcNum = parseInt(pc4);
    let closest = null;
    let minDiff = Infinity;
    
    for (const [key, value] of Object.entries(postcodeCoords)) {
      const diff = Math.abs(parseInt(key) - pcNum);
      if (diff < minDiff) {
        minDiff = diff;
        closest = value;
      }
    }
    
    // Als verschil te groot is (> 100), return centrum Ulft als fallback
    if (minDiff > 100) {
      return { lat: 51.8961, lng: 6.3792, plaats: 'Ulft' };
    }
    
    return closest;
  };

  const riskQuestions = [
    { id: 'v1', question: 'Ben je gevallen in het afgelopen jaar?', explanation: 'Elke val in het afgelopen jaar telt mee, ongeacht de oorzaak.', nextIfYes: 'v4', nextIfNo: 'v2' },
    { id: 'v2', question: 'Ben je bang om te vallen?', explanation: 'Angst voor een val kan ervoor zorgen dat je activiteiten vermijdt (zelf een rondje lopen, boodschappen doen, fietsen).', nextIfYes: 'v8', nextIfNo: 'v3' },
    { id: 'v3', question: 'Heb je moeite met bewegen, lopen of evenwicht houden?', explanation: 'Vul ook "ja" in als je een wandelstok, rollator of looprek gebruikt bij het lopen.', nextIfYes: 'v8', nextIfNo: 'end_low' },
    { id: 'v4', question: 'Had je verwondingen na je val en ben je hiervoor bij de dokter of in het ziekenhuis geweest?', explanation: 'Voorbeelden van verwondingen: bloedingen, kneuzingen, botbreuken. Had je verwondingen maar ben je niet bij de dokter of het ziekenhuis geweest, vul dan "nee" in.', nextIfYes: 'v5', nextIfNo: 'v5' },
    { id: 'v5', question: 'Ben je vaker dan één keer gevallen in het afgelopen jaar?', explanation: 'Elke val in het afgelopen jaar telt mee, ongeacht de oorzaak.', nextIfYes: 'v6', nextIfNo: 'v6' },
    { id: 'v6', question: 'Ben je gevallen doordat je flauwviel?', explanation: 'Flauwvallen betekent dat je even bewusteloos was en niet reageerde op geluid of aanraking.', nextIfYes: 'v7', nextIfNo: 'v7' },
    { id: 'v7', question: 'Kon je zelf opstaan na de val?', explanation: 'Je kon zelf opstaan als je geen hulp nodig had van iemand anders.', nextIfYes: 'v8', nextIfNo: 'v8' },
    { id: 'v8', question: 'Kan je een of meer van de volgende taken zelf doen? (koken, tuinieren, stofzuigen of dweilen, boodschappen doen)', explanation: 'Vul "ja" in als je één of meer van deze taken zelf kunt uitvoeren.', nextIfYes: 'end', nextIfNo: 'end' }
  ];

  const preventionQuestions = [
    { id: 'p1', question: 'Laat je elk jaar je ogen controleren bij de opticien?', tip: 'Regelmatige oogcontrole en voldoende licht thuis verbeteren je zicht.', Icon: Eye, title: 'Controleer je ogen', advies: 'Laat je ogen elk jaar testen bij de opticien of oogarts en draag een schone bril. Goed zicht helpt om tijdig oneffenheden te zien en struikelgevaar te verminderen. Zorg voor voldoende licht in huis, ook \'s nachts, en poets je bril elke dag.', checklist: ['Ik poets mijn bril elke dag', 'Ik zorg ervoor dat ik altijd genoeg licht heb in huis, ook \'s nachts', 'Elk jaar laat ik mijn ogen testen'] },
    { id: 'p2', question: 'Draag je stevige schoenen die goed passen en lekker zitten?', tip: 'Goed passende schoenen geven meer stabiliteit.', Icon: Footprints, title: 'Zorg voor goed passende schoenen', advies: 'Draag schoenen die goed passen, stevig zijn en geen hoge hak hebben. Kies schoenen met een stevige hiel en goede sluiting zodat je voeten niet wegglijden. Zorg voor ruimte tussen je grote teen en de voorkant van de schoen.', checklist: ['Mijn schoenen zijn stevig. Ze passen goed en hebben geen hoge hak', 'Mijn sloffen blijven goed om mijn voeten zitten', 'Ik verzorg mijn voeten goed, of ik laat de pedicure dat doen'] },
    { id: 'p3', question: 'Doe je minstens twee keer per week oefeningen voor je evenwicht en je spieren?', tip: 'Dagelijkse beweging en oefeningen helpen spieren sterk te houden.', Icon: Dumbbell, title: 'Train je evenwicht en spierkracht', advies: 'Oefen dagelijks je spieren en evenwicht. Doe bijvoorbeeld mee met eenvoudige oefeningen zoals op je tenen staan, je tenen buigen en strekken of evenwichtsoefeningen tijdens dagelijkse activiteiten.', checklist: ['Ik doe elke dag oefeningen om mijn evenwicht en (been)spieren te trainen', 'Ik let erop dat ik niet te lang achter elkaar zit', 'Als ik opsta, wacht ik even voordat ik ga lopen'] },
    { id: 'p4', question: 'Gebruik je meerdere soorten medicijnen en laat je ze elk jaar controleren?', tip: 'Sommige medicijnen kunnen duizeligheid geven; laat je medicatie regelmatig controleren.', Icon: Pill, title: 'Controleer je medicijnen', advies: 'Weet precies welke medicijnen je gebruikt en of ze de kans op vallen vergroten. Vraag je huisarts of apotheker ieder jaar om een medicijncheck.', checklist: ['Ik weet precies welke medicijnen ik allemaal neem', 'Ik weet of mijn medicijnen de kans groter maken dat ik val', 'Ik vraag mijn huisarts of apotheker elk jaar om mijn medicijnen te controleren'] },
    { id: 'p5', question: 'Eet jij dagelijks eiwitten?', tip: 'Eiwitten houden botten en spieren sterk (melk, kaas, vis, vlees, peulvruchten, noten).', Icon: Apple, title: 'Eet lekker en gezond', advies: 'Zorg voor sterke botten en spieren door dagelijks voldoende groenten en fruit te eten in een gevarieerde voeding. Eet voedingsmiddelen met veel eiwitten. Drink genoeg water.', checklist: ['Ik weet wat ik iedere dag moet eten aan groente, fruit en andere voeding', 'Ik let erop dat ik genoeg eiwitten eet', 'Ik drink elke dag genoeg water'] },
    { id: 'p6', question: 'Heb je al eens gekeken hoe jij jouw huis met kleine aanpassingen veiliger kan maken?', tip: 'Kabels vastmaken, antislip onder vloerkleden, licht verbeteren en de trap vrijmaken verkleinen de kans op struikelen of uitglijden.', Icon: Home, title: 'Voorkom dat je thuis valt', advies: 'Werk losse snoeren weg, geef vloerkleden een anti-sliplaag en zorg voor voldoende licht, ook \'s nachts. Houd looppaden vrij en zorg voor voldoende ruimte tussen meubels.', checklist: ['Ik werk losse snoeren weg', 'Al mijn vloerkleden hebben een anti-sliplaag', 'Ik houd de trap vrij van spullen', 'Ik houd genoeg ruimte tussen meubels'] }
  ];

  const calculateRiskLevel = () => {
    const a = answers;
    if (a.v1 === false && a.v2 === false && a.v3 === false) return 'laag';
    if (a.v1 === true) {
      if (a.v4 === false && a.v5 === false && a.v6 === false && a.v7 === true && a.v8 === true) return 'matig';
      if (a.v4 === true || a.v5 === true || a.v6 === true || a.v7 === false || a.v8 === false) return 'hoog';
      return 'matig';
    }
    if ((a.v2 === true || a.v3 === true) && a.v8 !== undefined) return a.v8 === false ? 'hoog' : 'matig';
    return 'matig';
  };

  // Functie om testresultaten naar Supabase te sturen
  const saveToDatabase = async (woonplaatsValue, emailValue, calculatedRiskLevel) => {
    try {
      const data = {
        // Demografische gegevens
        woonplaats: woonplaatsValue,
        leeftijd: demographics.age,
        geslacht: demographics.gender,
        email: emailValue || null,
        
        // Risiconiveau
        risiconiveau: calculatedRiskLevel,
        
        // Antwoorden risicovragen
        v1_gevallen: answers.v1 ?? null,
        v2_bang_vallen: answers.v2 ?? null,
        v3_moeite_bewegen: answers.v3 ?? null,
        v4_verwondingen: answers.v4 ?? null,
        v5_vaker_gevallen: answers.v5 ?? null,
        v6_flauwgevallen: answers.v6 ?? null,
        v7_zelf_opstaan: answers.v7 ?? null,
        v8_taken_zelf: answers.v8 ?? null,
        
        // Antwoorden preventievragen
        p1_ogen: preventionAnswers.p1 ?? null,
        p2_schoenen: preventionAnswers.p2 ?? null,
        p3_beweging: preventionAnswers.p3 ?? null,
        p4_medicijnen: preventionAnswers.p4 ?? null,
        p5_voeding: preventionAnswers.p5 ?? null,
        p6_woonomgeving: preventionAnswers.p6 ?? null,
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/testresultaten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Data opgeslagen:', result);
        setDataSaved(true);
        if (result && result[0] && result[0].id) {
          setSavedRecordId(result[0].id);
        }
        return result;
      } else {
        console.error('Fout bij opslaan:', response.status, await response.text());
        return null;
      }
    } catch (error) {
      console.error('Fout bij versturen naar database:', error);
      return null;
    }
  };

  // Functie om fysiotherapie contact toe te voegen aan bestaand record
  const updateFysioContact = async (fysioNaam, contactNaam, contactTelefoon) => {
    console.log('updateFysioContact aangeroepen:', { savedRecordId, fysioNaam, contactNaam, contactTelefoon });
    
    if (!savedRecordId) {
      console.error('Geen savedRecordId beschikbaar - fysio contact kan niet worden opgeslagen');
      alert('Er ging iets mis. Probeer het opnieuw of neem contact op.');
      return;
    }
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/testresultaten?id=eq.${savedRecordId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          fysio_contact_aangevraagd: true,
          fysio_praktijk: fysioNaam,
          fysio_naam: contactNaam,
          fysio_telefoon: contactTelefoon
        })
      });

      if (response.ok) {
        console.log('Fysio contact succesvol opgeslagen voor record:', savedRecordId);
      } else {
        const errorText = await response.text();
        console.error('Fout bij updaten fysio contact:', response.status, errorText);
        alert('Er ging iets mis bij het opslaan. Probeer het opnieuw.');
      }
    } catch (error) {
      console.error('Fout bij updaten fysio contact:', error);
      alert('Er ging iets mis. Controleer je internetverbinding.');
    }
  };

  const animateTransition = (cb) => { 
    setAnimating(true); 
    setTimeout(() => { cb(); setAnimating(false); }, 150); 
  };

  const navigateTo = (screen, questionIdx = 0) => {
    setScreenHistory(prev => [...prev, { screen: currentScreen, question: currentQuestion }]);
    animateTransition(() => { setCurrentScreen(screen); setCurrentQuestion(questionIdx); });
  };

  const goBack = () => {
    if (screenHistory.length > 0) {
      const prev = screenHistory[screenHistory.length - 1];
      setScreenHistory(hist => hist.slice(0, -1));
      animateTransition(() => { setCurrentScreen(prev.screen); setCurrentQuestion(prev.question); });
    }
  };

  const handleAnswer = (answer) => { 
    if (isProcessing) return;
    setIsProcessing(true);
    const q = riskQuestions[currentQuestion]; 
    if (!q) { setIsProcessing(false); return; }
    setQuestionHistory(prev => [...prev, { question: currentQuestion, answers: { ...answers } }]);
    setAnswers({ ...answers, [q.id]: answer }); 
    const next = answer ? q.nextIfYes : q.nextIfNo; 
    // Vertraging zit nu in de AnswerButton, dus animateTransition wordt direct aangeroepen
    animateTransition(() => { 
      if (next === 'end_low' || next === 'end') { 
        setScreenHistory(prev => [...prev, { screen: 'questions', question: currentQuestion }]);
        setCurrentScreen('prevention'); 
        setCurrentQuestion(0); 
      } else { 
        const idx = riskQuestions.findIndex(x => x.id === next); 
        if (idx !== -1) setCurrentQuestion(idx); 
      }
      setIsProcessing(false);
    }); 
  };

  const handleQuestionBack = () => {
    if (questionHistory.length > 0) {
      const prev = questionHistory[questionHistory.length - 1];
      setQuestionHistory(hist => hist.slice(0, -1));
      setAnswers(prev.answers);
      animateTransition(() => setCurrentQuestion(prev.question));
    } else { goBack(); }
  };

  const handlePreventionAnswer = (answer) => { 
    if (isProcessing) return;
    setIsProcessing(true);
    const q = preventionQuestions[currentQuestion]; 
    setPreventionAnswers({ ...preventionAnswers, [q.id]: answer }); 
    animateTransition(() => { 
      if (currentQuestion < preventionQuestions.length - 1) { setCurrentQuestion(currentQuestion + 1); } 
      else { setScreenHistory(prev => [...prev, { screen: 'prevention', question: currentQuestion }]); setCurrentScreen('demographics'); }
      setIsProcessing(false);
    }); 
  };

  const handlePreventionBack = () => {
    if (currentQuestion > 0) {
      const prevQ = preventionQuestions[currentQuestion - 1];
      const newAnswers = { ...preventionAnswers };
      delete newAnswers[prevQ.id];
      setPreventionAnswers(newAnswers);
      animateTransition(() => setCurrentQuestion(currentQuestion - 1));
    } else { goBack(); }
  };

  const handleDemographicsSubmit = () => { 
    // Woonplaats validatie - moet ingevuld zijn en in de lijst voorkomen
    const foundWoonplaats = woonplaatsen.find(w => w.naam.toLowerCase() === woonplaats.toLowerCase());
    if (!woonplaats || !foundWoonplaats) { 
      // Toon modal om woonplaats te selecteren
      setWoonplaatsSearch('');
      setWoonplaatsModalOpen(true);
      return; 
    } 
    setRiskLevel(calculateRiskLevel()); 
    setReportPage(0); 
    animateTransition(() => setCurrentScreen('report')); 
  };

  // Bereken afstand tussen twee punten (Haversine formule)
  // Factor 1.3 om hemelsbreed om te zetten naar geschatte wegafstand
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const hemelsbreed = R * c;
    // Factor 1.3 voor geschatte wegafstand (wegen zijn niet recht)
    return hemelsbreed * 1.3;
  };

  // Sorteer fysio's op afstand op basis van woonplaats
  const getSortedFysios = () => {
    // Haal coördinaten op basis van woonplaats
    const coords = getWoonplaatsCoords(woonplaats);
    
    // Als geen coördinaten, return default volgorde met null afstand
    if (!coords) {
      return fysioPraktijken.map(f => ({ ...f, afstand: null }));
    }
    
    return [...fysioPraktijken].map(fysio => {
      const afstand = calculateDistance(
        coords.lat, 
        coords.lng, 
        fysio.lat, 
        fysio.lng
      );
      return { ...fysio, afstand: Math.round(afstand * 10) / 10 };
    }).sort((a, b) => a.afstand - b.afstand);
  };

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => { const diff = touchStartX.current - touchEndX.current; if (Math.abs(diff) > 60) navigateReport(diff > 0 ? 1 : -1); };
  
  const getTotalReportPages = () => riskLevel === 'hoog' ? 2 + 1 + 6 + 1 : 2 + 6 + 1;
  const navigateReport = (dir) => { 
    const newPage = reportPage + dir; 
    if (newPage >= 0 && newPage < getTotalReportPages()) {
      animateTransition(() => setReportPage(newPage));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ============================================================================
  // UI COMPONENTEN - ZLIMTHUIS STIJL
  // ============================================================================

  const Card = ({ children, noPadding = false }) => (
    <div style={{ 
      background: ZLIM.white, 
      borderRadius: '20px', 
      padding: noPadding ? 0 : isMobile ? '28px 24px' : '40px', 
      boxShadow: '0 2px 16px rgba(138, 154, 109, 0.08)', 
      border: `1px solid ${ZLIM.borderLight}`, 
      opacity: animating ? 0 : 1, 
      transform: animating ? 'translateY(8px)' : 'translateY(0)', 
      transition: 'all 0.15s ease' 
    }}>
      {children}
    </div>
  );

  // Antwoordknoppen in Zlimthuis stijl - touch-friendly (geen hover op mobiel)
  // AANGEPAST: Kleinere tekst zodat alles op één regel past
  const AnswerButton = ({ children, onClick, type = 'yes', disabled = false }) => {
    const [isPressed, setIsPressed] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const isYes = type === 'yes';
    
    // Alleen hover effect op desktop, niet op touch devices
    const handleMouseEnter = () => {
      if (!disabled && window.matchMedia('(hover: hover)').matches) {
        setIsPressed(true);
      }
    };
    
    const handleMouseLeave = () => {
      setIsPressed(false);
    };
    
    const handleClick = () => {
      if (disabled) return;
      setIsSelected(true);
      setIsPressed(false);
      // Wacht 700ms voordat we doorgaan naar de volgende vraag
      setTimeout(() => {
        onClick();
        setIsSelected(false);
      }, 700);
    };
    
    const isActive = isPressed || isSelected;
    
    return (
      <button 
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={() => !disabled && setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        disabled={disabled}
        style={{
          padding: '16px 12px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: FONT.semibold,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          fontFamily: FONT.family,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          flex: 1,
          minWidth: 0,
          height: '56px',
          border: `2px solid ${isActive ? (isYes ? ZLIM.success : ZLIM.danger) : ZLIM.border}`,
          background: isActive ? (isYes ? ZLIM.successLight : ZLIM.dangerLight) : ZLIM.white,
          color: isActive ? (isYes ? ZLIM.successDark : ZLIM.dangerDark) : ZLIM.textDark,
          opacity: disabled ? 0.5 : 1,
          WebkitTapHighlightColor: 'transparent',
          boxSizing: 'border-box',
        }}
      >
        {isYes ? <Check size={20} color={isActive ? ZLIM.successDark : ZLIM.success} strokeWidth={2.5} /> : <X size={20} color={isActive ? ZLIM.dangerDark : ZLIM.danger} strokeWidth={2.5} />}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>
      </button>
    );
  };

  // Primaire knop - Teal accent zoals op zlimthuis.nl
  const PrimaryButton = ({ children, onClick, disabled = false, variant = 'primary' }) => {
    const styles = {
      primary: { background: ZLIM.teal, color: '#fff', border: 'none' },
      outline: { background: 'transparent', color: ZLIM.teal, border: `2px solid ${ZLIM.teal}` },
      sage: { background: ZLIM.sage, color: '#fff', border: 'none' },
    };
    return (
      <button onClick={onClick} disabled={disabled} style={{ 
        ...styles[variant], 
        padding: isMobile ? '18px 28px' : '20px 36px', 
        borderRadius: '12px', 
        fontSize: FONT.body, 
        fontWeight: FONT.bold, 
        cursor: disabled ? 'not-allowed' : 'pointer', 
        opacity: disabled ? 0.5 : 1, 
        transition: 'all 0.2s ease', 
        fontFamily: FONT.family, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '12px', 
        width: '100%', 
        minHeight: isMobile ? '58px' : '64px' 
      }}>
        {children}
      </button>
    );
  };

  // Voortgangsbalk in saliegroen
  const ProgressBar = ({ current, total, label }) => (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: FONT.small, fontWeight: FONT.bold, color: ZLIM.sage }}>Vraag {current} van {total}</span>
        <span style={{ fontSize: '13px', color: ZLIM.textMedium, fontWeight: FONT.medium }}>{label}</span>
      </div>
      <div style={{ height: '6px', background: ZLIM.sagePale, borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${(current / total) * 100}%`, height: '100%', background: ZLIM.sage, borderRadius: '3px', transition: 'width 0.3s ease' }} />
      </div>
    </div>
  );

  // Tip box in saliegroen stijl
  const TipBox = ({ tip }) => (
    <div style={{ 
      background: ZLIM.sageVeryPale,
      borderLeft: `3px solid ${ZLIM.sage}`,
      borderRadius: '0 12px 12px 0', 
      padding: '16px 20px', 
      marginBottom: '28px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Lightbulb size={20} color={ZLIM.sage} style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: FONT.small, color: ZLIM.textMedium, lineHeight: 1.6, margin: 0 }}>
          <span style={{ fontWeight: FONT.semibold, color: ZLIM.sageDark }}>Tip: </span>{tip}
        </p>
      </div>
    </div>
  );

  // Zlimthuis Logo
  const ZlimthuisLogo = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <img 
        src="https://www.zlimthuis.nl/media/n5cpu0o3/logo-zlimthuis-2021-nieuwe-pay-off-rgb.png" 
        alt="Zlimthuis" 
        style={{ height: '36px', width: 'auto' }}
        onError={(e) => {
          // Fallback naar tekst als afbeelding niet laadt
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      <div style={{ display: 'none', flexDirection: 'column' }}>
        <span style={{ fontSize: '20px', fontWeight: FONT.extrabold, color: '#f26522', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
          <span style={{ color: '#f26522' }}>zlim</span><span style={{ color: '#333' }}>thuis</span>
        </span>
      </div>
    </div>
  );

  // ============================================================================
  // SCHERMEN
  // ============================================================================

  const renderWelcome = () => (
    <Card noPadding>
      {/* Header met gradient in saliegroen */}
      <div style={{ 
        background: `linear-gradient(135deg, ${ZLIM.sage} 0%, ${ZLIM.sageDark} 100%)`, 
        padding: isMobile ? '48px 28px' : '60px 48px', 
        textAlign: 'center', 
        borderRadius: '20px 20px 0 0' 
      }}>
        <div style={{ 
          width: isMobile ? '72px' : '88px', 
          height: isMobile ? '72px' : '88px', 
          background: 'rgba(255,255,255,0.2)', 
          borderRadius: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 24px',
          backdropFilter: 'blur(10px)'
        }}>
          <Shield size={isMobile ? 36 : 44} color="#fff" strokeWidth={1.5} />
        </div>
        <h1 style={{ fontSize: FONT.h1, fontWeight: FONT.extrabold, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          Ik Sta Sterk Test
        </h1>
        <p style={{ fontSize: isMobile ? '17px' : '19px', color: 'rgba(255,255,255,0.9)', margin: 0, fontWeight: FONT.medium }}>
          Ontdek hoe stevig jij staat
        </p>
      </div>
      
      <div style={{ padding: isMobile ? '32px 24px' : '44px' }}>
        <p style={{ fontSize: FONT.body, color: ZLIM.textDark, lineHeight: 1.75, margin: '0 0 32px', textAlign: 'center' }}>
          Door de test te doen, weet je jouw risico op vallen. Ook krijg je direct advies om de kans op een val zo klein mogelijk te maken.
        </p>

        <div style={{ display: 'grid', gap: '12px', marginBottom: '32px' }}>
          {[
            { Icon: Clock, text: 'Duurt ongeveer 3 minuten' },
            { Icon: Shield, text: 'De test is anoniem' },
            { Icon: FileText, text: 'Je krijgt direct persoonlijk advies' },
          ].map((item, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '14px', 
              padding: '14px 18px', 
              background: ZLIM.sageVeryPale, 
              borderRadius: '12px',
              border: `1px solid ${ZLIM.sagePale}`
            }}>
              <item.Icon size={22} color={ZLIM.sage} strokeWidth={2} />
              <span style={{ fontSize: '15px', color: ZLIM.textDark, fontWeight: FONT.medium }}>{item.text}</span>
            </div>
          ))}
        </div>

        <div style={{ 
          background: ZLIM.bgLight, 
          borderRadius: '12px', 
          padding: '16px 18px', 
          marginBottom: '28px', 
          borderLeft: `3px solid ${ZLIM.sage}` 
        }}>
          <p style={{ fontSize: FONT.small, color: ZLIM.textMedium, margin: 0, lineHeight: 1.6 }}>
            De Ik Sta Sterk Test is bedoeld om valrisico op te sporen bij mensen van 65 jaar en ouder.
          </p>
        </div>

        <PrimaryButton onClick={() => navigateTo('age')}>
          Start de test <ArrowRight size={20} />
        </PrimaryButton>
        
        <p style={{ fontSize: FONT.tiny, color: ZLIM.textLight, textAlign: 'center', marginTop: '20px' }}>
          Gebaseerd op de wetenschappelijk gevalideerde test van VeiligheidNL
        </p>
      </div>
    </Card>
  );

  // Leeftijdsknop component met hover effect
  const AgeButton = ({ age, onClick }) => {
    const [isPressed, setIsPressed] = useState(false);
    
    const handleMouseEnter = () => {
      if (window.matchMedia('(hover: hover)').matches) {
        setIsPressed(true);
      }
    };
    
    const handleMouseLeave = () => {
      setIsPressed(false);
    };
    
    const handleClick = () => {
      setIsPressed(false);
      onClick();
    };
    
    return (
      <button 
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        style={{ 
          padding: '20px 22px', 
          borderRadius: '12px', 
          border: `2px solid ${isPressed ? ZLIM.sage : ZLIM.border}`, 
          background: isPressed ? ZLIM.sagePale : ZLIM.white, 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          fontFamily: FONT.family, 
          transition: 'all 0.2s',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: FONT.semibold, color: isPressed ? ZLIM.sageDark : ZLIM.textDark }}>{age.label}</span>
        <ChevronRight size={22} color={ZLIM.sage} />
      </button>
    );
  };

  const renderAgeSelection = () => (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: ZLIM.sagePale, 
          borderRadius: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 20px' 
        }}>
          <Users size={32} color={ZLIM.sage} />
        </div>
        <h2 style={{ fontSize: FONT.h2, fontWeight: FONT.extrabold, margin: '0 0 8px', color: ZLIM.textDark }}>
          Wat is je leeftijd?
        </h2>
        <p style={{ fontSize: '15px', color: ZLIM.textMedium, margin: 0 }}>
          Selecteer de leeftijdscategorie die bij jou past
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: '65 tot en met 74 jaar', value: '65-74' }, 
          { label: '75 tot en met 84 jaar', value: '75-84' }, 
          { label: '85 jaar en ouder', value: '85+' }
        ].map((age) => (
          <AgeButton 
            key={age.value} 
            age={age} 
            onClick={() => { setDemographics({ ...demographics, age: age.value }); navigateTo('questions', 0); }} 
          />
        ))}
      </div>

      <button onClick={goBack} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '10px 0', 
        background: 'transparent', 
        border: 'none', 
        color: ZLIM.textMedium, 
        fontSize: FONT.small, 
        fontWeight: FONT.semibold, 
        cursor: 'pointer', 
        fontFamily: FONT.family 
      }}>
        <ArrowLeft size={18} /> Terug
      </button>
    </Card>
  );

  // AANGEPAST: Risk questions met vaste button posities onderaan
  const renderRiskQuestion = () => { 
    const q = riskQuestions[currentQuestion]; 
    
    return ( 
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: isMobile ? '420px' : '440px' }}>
          <ProgressBar current={currentQuestion + 1} total={8} label="Vaststellen valrisico" />
          
          {/* Vraagblok in saliegroen - neemt beschikbare ruimte */}
          <div style={{ 
            background: ZLIM.sageVeryPale, 
            borderRadius: '16px', 
            padding: isMobile ? '24px' : '32px', 
            marginBottom: '24px',
            border: `1px solid ${ZLIM.sagePale}`,
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h2 style={{ 
              fontSize: FONT.h2, 
              fontWeight: FONT.bold, 
              lineHeight: 1.4, 
              margin: '0 0 16px', 
              color: ZLIM.textDark 
            }}>
              {q.question}
            </h2>
            <p style={{ fontSize: '15px', color: ZLIM.textMedium, lineHeight: 1.6, margin: 0 }}>
              {q.explanation}
            </p>
          </div>

          {/* Buttons altijd onderaan - vaste positie */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <AnswerButton onClick={() => handleAnswer(true)} type="yes" disabled={isProcessing}>Ja</AnswerButton>
              <AnswerButton onClick={() => handleAnswer(false)} type="no" disabled={isProcessing}>Nee</AnswerButton>
            </div>

            <button onClick={handleQuestionBack} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 0', 
              background: 'transparent', 
              border: 'none', 
              color: ZLIM.textMedium, 
              fontSize: FONT.small, 
              fontWeight: FONT.semibold, 
              cursor: 'pointer', 
              fontFamily: FONT.family 
            }}>
              <ArrowLeft size={18} /> Vorige vraag
            </button>
          </div>
        </div>
      </Card> 
    ); 
  };

  // AANGEPAST: Prevention questions met vaste button posities en kortere tekst
  const renderPreventionQuestion = () => { 
    const q = preventionQuestions[currentQuestion]; 
    const Icon = q.Icon; 
    
    return ( 
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: isMobile ? '480px' : '500px' }}>
          <ProgressBar current={currentQuestion + 1} total={6} label="Wat doe jij al?" />
          
          {/* Vraag blok met icoon rechtsboven */}
          <div style={{ 
            background: ZLIM.sageVeryPale, 
            borderRadius: '16px', 
            padding: isMobile ? '24px' : '32px', 
            marginBottom: '16px', 
            position: 'relative',
            border: `1px solid ${ZLIM.sagePale}`
          }}>
            {/* Icoon rechtsboven */}
            <div style={{ 
              position: 'absolute', 
              top: isMobile ? '16px' : '24px', 
              right: isMobile ? '16px' : '24px',
              width: '48px', 
              height: '48px', 
              background: ZLIM.white, 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(138, 154, 109, 0.15)'
            }}>
              <Icon size={24} color={ZLIM.sage} />
            </div>
            
            {/* Categorie titel */}
            <p style={{ 
              fontSize: '13px', 
              fontWeight: FONT.bold, 
              color: ZLIM.sage, 
              margin: '0 0 10px', 
              paddingRight: '60px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {q.title}
            </p>
            
            {/* Vraag */}
            <h2 style={{ 
              fontSize: isMobile ? '18px' : '22px', 
              fontWeight: FONT.bold, 
              lineHeight: 1.4, 
              margin: 0, 
              color: ZLIM.textDark, 
              paddingRight: isMobile ? '0' : '56px' 
            }}>
              {q.question}
            </h2>
          </div>
          
          {/* Tip - flex grow */}
          <div style={{ flex: '1' }}>
            <TipBox tip={q.tip} />
          </div>

          {/* Buttons altijd onderaan - vaste positie */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <AnswerButton onClick={() => handlePreventionAnswer(true)} type="yes" disabled={isProcessing}>Ja, dat doe ik</AnswerButton>
              <AnswerButton onClick={() => handlePreventionAnswer(false)} type="no" disabled={isProcessing}>Nee, dat doe ik niet</AnswerButton>
            </div>

            <button onClick={handlePreventionBack} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 0', 
              background: 'transparent', 
              border: 'none', 
              color: ZLIM.textMedium, 
              fontSize: FONT.small, 
              fontWeight: FONT.semibold, 
              cursor: 'pointer', 
              fontFamily: FONT.family 
            }}>
              <ArrowLeft size={18} /> Vorige vraag
            </button>
          </div>
        </div>
      </Card> 
    ); 
  }; 

  // Gender knop component met hover effect
  const GenderButton = ({ option, isSelected, onClick }) => {
    const [isPressed, setIsPressed] = useState(false);
    
    const handleMouseEnter = () => {
      if (window.matchMedia('(hover: hover)').matches) {
        setIsPressed(true);
      }
    };
    
    const handleMouseLeave = () => {
      setIsPressed(false);
    };
    
    const handleClick = () => {
      setIsPressed(false);
      onClick();
    };
    
    const isActive = isSelected || isPressed;
    
    return (
      <button 
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        style={{ 
          padding: '14px 18px', 
          borderRadius: '10px', 
          border: `2px solid ${isActive ? ZLIM.sage : ZLIM.border}`, 
          background: isActive ? ZLIM.sagePale : ZLIM.white, 
          cursor: 'pointer', 
          fontFamily: FONT.family, 
          fontSize: '15px', 
          fontWeight: FONT.semibold, 
          color: isActive ? ZLIM.sageDark : ZLIM.textDark, 
          textAlign: 'left', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          transition: 'all 0.2s',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <div style={{ 
          width: '20px', 
          height: '20px', 
          borderRadius: '50%', 
          border: `2px solid ${isActive ? ZLIM.sage : ZLIM.border}`, 
          background: isSelected ? ZLIM.sage : ZLIM.white, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}>
          {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
        </div>
        {option.l}
      </button>
    );
  };

  // AANGEPAST: Demographics met GenderButton en woonplaats dropdown
  const renderDemographics = () => {
    return (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: ZLIM.sagePale, 
          borderRadius: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 20px' 
        }}>
          <FileText size={32} color={ZLIM.sage} />
        </div>
        <h2 style={{ fontSize: FONT.h2, fontWeight: FONT.extrabold, margin: '0 0 8px', color: ZLIM.textDark }}>
          Nog een paar gegevens
        </h2>
        <p style={{ fontSize: '15px', color: ZLIM.textMedium }}>Hiermee kunnen we je beter adviseren</p>
      </div>

      {/* Geslacht met hover effect */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '15px', fontWeight: FONT.bold, marginBottom: '10px', color: ZLIM.textDark }}>
          Wat is je geslacht?
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[{ v: 'man', l: 'Man' }, { v: 'vrouw', l: 'Vrouw' }, { v: 'anders', l: 'Anders / zeg ik liever niet' }].map(opt => (
            <GenderButton 
              key={opt.v}
              option={opt}
              isSelected={demographics.gender === opt.v}
              onClick={() => setDemographics(prev => ({ ...prev, gender: opt.v }))}
            />
          ))}
        </div>
      </div>

      {/* Woonplaats - mobiel-vriendelijke selector */}
      <div style={{ marginBottom: '24px' }}>
        <label 
          htmlFor="woonplaatsField"
          style={{ display: 'block', fontSize: '15px', fontWeight: FONT.bold, marginBottom: '6px', color: ZLIM.textDark }}
        >
          In welke plaats woon je?
        </label>
        <p style={{ fontSize: '13px', color: ZLIM.textMedium, margin: '0 0 10px' }}>Tik om je woonplaats te selecteren</p>
        
        {/* Klikbare button die modal opent */}
        <button
          type="button"
          onClick={() => {
            setWoonplaatsSearch('');
            setWoonplaatsModalOpen(true);
            setTimeout(() => woonplaatsSearchRef.current?.focus(), 100);
          }}
          style={{ 
            width: '100%', 
            padding: '14px 18px', 
            fontSize: '16px', 
            fontWeight: woonplaats ? FONT.medium : FONT.regular, 
            border: `2px solid ${ZLIM.border}`, 
            borderRadius: '10px', 
            fontFamily: FONT.family, 
            boxSizing: 'border-box',
            backgroundColor: ZLIM.white,
            color: woonplaats ? ZLIM.textDark : ZLIM.textLight,
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{woonplaats || 'Selecteer je woonplaats...'}</span>
          <ChevronRight size={20} color={ZLIM.textLight} />
        </button>
        
        <p style={{ fontSize: '12px', color: ZLIM.textLight, margin: '6px 0 0' }}>
          Bijv. Ulft, Terborg, Silvolde, Arnhem...
        </p>
      </div>
      
      {/* Woonplaats selectie modal */}
      {woonplaatsModalOpen && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(45, 58, 36, 0.5)', 
          display: 'flex', 
          flexDirection: 'column',
          zIndex: 1000
        }}>
          <div style={{ 
            background: ZLIM.white, 
            width: '100%', 
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header met zoekbalk */}
            <div style={{ 
              padding: '16px', 
              borderBottom: `1px solid ${ZLIM.border}`,
              background: ZLIM.white
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <button
                  onClick={() => setWoonplaatsModalOpen(false)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ArrowLeft size={24} color={ZLIM.textDark} />
                </button>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: FONT.bold, color: ZLIM.textDark }}>
                  Selecteer woonplaats
                </h3>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                padding: '12px 14px',
                background: ZLIM.bgLight,
                borderRadius: '10px',
                border: `2px solid ${ZLIM.border}`
              }}>
                <Search size={20} color={ZLIM.textMedium} />
                <input
                  ref={woonplaatsSearchRef}
                  type="text"
                  value={woonplaatsSearch}
                  onChange={(e) => setWoonplaatsSearch(e.target.value)}
                  placeholder="Typ om te zoeken..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  style={{ 
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontSize: '16px',
                    fontFamily: FONT.family,
                    outline: 'none',
                    color: ZLIM.textDark
                  }}
                />
                {woonplaatsSearch && (
                  <button
                    onClick={() => setWoonplaatsSearch('')}
                    style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}
                  >
                    <X size={18} color={ZLIM.textMedium} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Lijst met woonplaatsen */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}>
              {/* Oude IJsselstreek plaatsen bovenaan */}
              {woonplaatsSearch.length === 0 && (
                <div style={{ padding: '12px 16px', background: ZLIM.sagePale }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: FONT.bold, color: ZLIM.sageDark, textTransform: 'uppercase' }}>
                    Gemeente Oude IJsselstreek
                  </p>
                </div>
              )}
              {woonplaatsen
                .filter(w => {
                  if (woonplaatsSearch.length === 0) {
                    // Toon alleen Oude IJsselstreek plaatsen als er niet gezocht wordt
                    return ['Ulft', 'Silvolde', 'Terborg', 'Gendringen', 'Varsselder', 'Sinderen', 'Breedenbroek', 'Voorst', 'Megchelen', 'Netterden', 'Etten', 'Heelweg', 'Westendorp', 'Bontebrug', 'Kilder', 'IJzerlo'].includes(w.naam);
                  }
                  return w.naam.toLowerCase().includes(woonplaatsSearch.toLowerCase());
                })
                .slice(0, 50) // Beperk resultaten voor performance
                .map((w, idx) => (
                  <button
                    key={`${w.naam}-${idx}`}
                    onClick={() => {
                      setWoonplaats(w.naam);
                      setWoonplaatsModalOpen(false);
                    }}
                    style={{ 
                      width: '100%',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: FONT.medium,
                      color: ZLIM.textDark,
                      background: woonplaats === w.naam ? ZLIM.sagePale : ZLIM.white,
                      border: 'none',
                      borderBottom: `1px solid ${ZLIM.borderLight}`,
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: FONT.family,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{w.naam}</span>
                    {woonplaats === w.naam && <Check size={20} color={ZLIM.sage} />}
                  </button>
                ))}
              
              {/* Zoekresultaten info */}
              {woonplaatsSearch.length > 0 && woonplaatsen.filter(w => w.naam.toLowerCase().includes(woonplaatsSearch.toLowerCase())).length === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '15px', color: ZLIM.textMedium }}>
                    Geen plaatsen gevonden voor "{woonplaatsSearch}"
                  </p>
                  <p style={{ fontSize: '13px', color: ZLIM.textLight, marginTop: '8px' }}>
                    Controleer de spelling of probeer een andere zoekterm
                  </p>
                </div>
              )}
              
              {/* Hint om te zoeken */}
              {woonplaatsSearch.length === 0 && (
                <div style={{ padding: '16px 20px', background: ZLIM.bgLight }}>
                  <p style={{ margin: 0, fontSize: '13px', color: ZLIM.textMedium, textAlign: 'center' }}>
                    💡 Woon je buiten Oude IJsselstreek? Typ hierboven om te zoeken.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* E-mail - uncontrolled input met ref */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ display: 'block', fontSize: '15px', fontWeight: FONT.bold, marginBottom: '6px', color: ZLIM.textDark }}>
          Je e-mailadres <span style={{ fontWeight: FONT.regular, color: ZLIM.textMedium }}>(optioneel)</span>
        </label>
        <input 
          ref={emailInputRef}
          type="email" 
          name="email"
          placeholder="naam@voorbeeld.nl"
          defaultValue={demographics.email}
          key={`email-${currentScreen}`}
          style={{ 
            width: '100%', 
            padding: '14px 18px', 
            fontSize: '16px', 
            border: `2px solid ${ZLIM.border}`, 
            borderRadius: '10px', 
            fontFamily: FONT.family, 
            boxSizing: 'border-box' 
          }} 
        />
      </div>

      <PrimaryButton 
        onClick={async () => {
          // Lees email uit ref
          const emailValue = emailInputRef.current ? emailInputRef.current.value.trim() : '';
          
          // Valideer
          if (!demographics.gender) {
            alert('Selecteer je geslacht');
            return;
          }
          if (!woonplaats) {
            setWoonplaatsSearch('');
            setWoonplaatsModalOpen(true);
            return;
          }
          
          // Valideer tegen de complete woonplaatsenlijst
          const isValidWoonplaats = woonplaatsen.some(w => 
            w.naam.toLowerCase() === woonplaats.toLowerCase()
          );
          
          if (!isValidWoonplaats) {
            setWoonplaatsSearch('');
            setWoonplaatsModalOpen(true);
            return;
          }
          
          setDemographics(prev => ({ ...prev, email: emailValue }));
          
          // Bereken risiconiveau
          const calculatedRiskLevel = calculateRiskLevel();
          setRiskLevel(calculatedRiskLevel);
          
          // Sla data op in Supabase - AWAIT zodat savedRecordId beschikbaar is
          await saveToDatabase(woonplaats, emailValue, calculatedRiskLevel);
          
          // Ga door naar resultaten
          setReportPage(0); 
          animateTransition(() => setCurrentScreen('report'));
        }} 
        disabled={!demographics.gender}
      >
        Bekijk mijn uitslag <ArrowRight size={20} />
      </PrimaryButton>

      <button onClick={goBack} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '10px 0', 
        marginTop: '16px', 
        background: 'transparent', 
        border: 'none', 
        color: ZLIM.textMedium, 
        fontSize: FONT.small, 
        fontWeight: FONT.semibold, 
        cursor: 'pointer', 
        fontFamily: FONT.family 
      }}>
        <ArrowLeft size={18} /> Terug naar vragen
      </button>
    </Card>
  );};

  // ============================================================================
  // RAPPORT PAGINA'S
  // ============================================================================

  const renderReportIntro = () => (
    <Card>
      {/* Rustige header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: ZLIM.sageVeryPale, 
          borderRadius: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 16px' 
        }}>
          <FileText size={28} color={ZLIM.sage} strokeWidth={1.5} />
        </div>
        <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: FONT.bold, color: ZLIM.textDark, margin: '0 0 6px' }}>
          Jouw rapport
        </h1>
        <p style={{ fontSize: '15px', color: ZLIM.textMedium, margin: 0 }}>
          Op basis van jouw antwoorden
        </p>
      </div>

      <p style={{ fontSize: '16px', color: ZLIM.textDark, lineHeight: 1.8, margin: '0 0 20px' }}>
        Bedankt voor het invullen. In dit rapport vind je jouw persoonlijke uitslag en praktische tips om stevig te blijven staan.
      </p>

      {/* Wat je kunt verwachten */}
      <div style={{ 
        background: ZLIM.bgLight, 
        borderRadius: '12px', 
        padding: '20px',
        marginBottom: '20px'
      }}>
        <p style={{ fontSize: '14px', fontWeight: FONT.semibold, color: ZLIM.textDark, margin: '0 0 12px' }}>
          In dit rapport:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ZLIM.sage }} />
            <span style={{ fontSize: '14px', color: ZLIM.textMedium }}>Je persoonlijke valrisico</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ZLIM.sage }} />
            <span style={{ fontSize: '14px', color: ZLIM.textMedium }}>Tips per onderwerp</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ZLIM.sage }} />
            <span style={{ fontSize: '14px', color: ZLIM.textMedium }}>Praktische checklists</span>
          </div>
        </div>
      </div>

      <p style={{ fontSize: '14px', color: ZLIM.textLight, margin: 0, textAlign: 'center' }}>
        Blader rustig door de pagina's
      </p>
    </Card>
  );

  // AANGEPAST: Risico niveau pagina met minder drukke iconen - eenvoudiger design
  const renderReportRiskLevel = () => {
    const config = {
      laag: { 
        color: ZLIM.success, 
        bg: ZLIM.successLight, 
        label: 'Laag valrisico', 
        title: 'Je hebt een laag valrisico', 
        message: 'Dat is goed nieuws! Als je ouder wordt, verandert je lichaam. Daarom is het belangrijk om actief te blijven. Zo kun je de dingen blijven doen die voor jou belangrijk zijn, zoals samen eropuit gaan en spelen met de kleinkinderen.', 
        advice: 'Hoewel je valrisico laag is, is het verstandig om alert te blijven. Bekijk de tips in dit rapport om je risico laag te houden en blijf actief bewegen.' 
      },
      matig: { 
        color: ZLIM.warning, 
        bg: ZLIM.warningLight, 
        label: 'Matig valrisico', 
        title: 'Je hebt een matig valrisico', 
        message: 'Gelukkig kan je zelf veel doen om een val te voorkomen. Het is belangrijk dat je valrisico niet verder toeneemt. Door te oefenen kan je dit voorkomen. Zo kan je zo lang mogelijk zelfstandig blijven.', 
        advice: 'Bekijk de tips in dit rapport goed door en probeer ze toe te passen in je dagelijks leven. Bespreek je valrisico ook eens met je huisarts bij een volgend bezoek.' 
      },
      hoog: { 
        color: ZLIM.danger, 
        bg: ZLIM.dangerLight, 
        label: 'Hoog valrisico', 
        title: 'Je hebt een hoog valrisico', 
        message: 'Gelukkig kan je zelf veel doen om een val te voorkomen. Het is belangrijk om samen met bijvoorbeeld de huisarts, praktijkverpleegkundige of fysiotherapeut een plan te maken om sterk te blijven staan.', 
        advice: 'We raden je sterk aan om een afspraak te maken met een fysiotherapeut voor een uitgebreide valrisicometing. Op de volgende pagina helpen we je hierbij.' 
      },
    }[riskLevel];

    return (
      <Card noPadding>
        {/* Vereenvoudigde header - geen drukke iconen, alleen badge */}
        <div style={{ 
          background: config.bg, 
          padding: isMobile ? '36px 24px' : '44px 32px', 
          textAlign: 'center', 
          borderRadius: '20px 20px 0 0',
          borderBottom: `3px solid ${config.color}`
        }}>
          {/* Label als badge - enige visuele element */}
          <div style={{ 
            display: 'inline-block', 
            padding: '10px 24px', 
            background: config.color, 
            borderRadius: '24px', 
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '15px', fontWeight: FONT.bold, color: '#fff' }}>{config.label}</span>
          </div>
          
          <h2 style={{ fontSize: FONT.h2, fontWeight: FONT.extrabold, color: ZLIM.textDark, margin: 0 }}>
            {config.title}
          </h2>
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? '28px 24px' : '32px' }}>
          <p style={{ fontSize: '16px', color: ZLIM.textDark, lineHeight: 1.8, margin: '0 0 24px' }}>
            {config.message}
          </p>

          <div style={{ 
            background: ZLIM.bgLight, 
            borderRadius: '14px', 
            padding: '20px', 
            borderLeft: `4px solid ${config.color}` 
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: FONT.bold, margin: '0 0 8px', color: config.color }}>
              Wat betekent dit voor jou?
            </h3>
            <p style={{ fontSize: '15px', color: ZLIM.textDark, lineHeight: 1.7, margin: 0 }}>{config.advice}</p>
          </div>
        </div>
      </Card>
    );
  };

  const renderReportDoorverwijzing = () => {
    const sortedFysios = getSortedFysios();
    
    return (
    <Card noPadding>
      {/* Opvallende header */}
      <div style={{ 
        background: `linear-gradient(135deg, ${ZLIM.danger} 0%, ${ZLIM.dangerDark} 100%)`, 
        padding: isMobile ? '32px 24px' : '40px 32px', 
        textAlign: 'center', 
        borderRadius: '20px 20px 0 0' 
      }}>
        <div style={{ 
          width: '72px', 
          height: '72px', 
          background: 'rgba(255,255,255,0.2)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 16px',
          backdropFilter: 'blur(10px)'
        }}>
          <Heart size={36} color="#fff" />
        </div>
        <h2 style={{ fontSize: FONT.h2, fontWeight: FONT.extrabold, margin: '0 0 8px', color: '#fff' }}>
          Actie aanbevolen
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', margin: 0, fontWeight: FONT.medium }}>
          Maak een afspraak met een fysiotherapeut
        </p>
      </div>

      <div style={{ padding: isMobile ? '28px 24px' : '36px 32px' }}>
        {/* Waarschuwingsblok */}
        <div style={{ 
          background: ZLIM.warningLight, 
          borderRadius: '14px', 
          padding: '20px', 
          marginBottom: '24px',
          border: `2px solid ${ZLIM.warning}`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px'
        }}>
          <AlertCircle size={24} color={ZLIM.warning} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontSize: '15px', fontWeight: FONT.bold, color: ZLIM.warningDark, margin: '0 0 6px' }}>
              Dit is een belangrijke stap
            </p>
            <p style={{ fontSize: FONT.small, color: ZLIM.textDark, lineHeight: 1.6, margin: 0 }}>
              Bij een verhoogd valrisico raden wij je <strong>sterk aan</strong> om een afspraak te maken voor een uitgebreide valrisicometing.
            </p>
          </div>
        </div>

        <p style={{ fontSize: '16px', color: ZLIM.textDark, lineHeight: 1.8, margin: '0 0 20px' }}>
          Een <strong>fysiotherapeut</strong> kan je balans, spierkracht en looppatroon nauwkeurig in kaart brengen. Op basis hiervan krijg je een <strong>persoonlijk oefenprogramma</strong>. Veel mensen merken al na een paar weken dat ze steviger staan.
        </p>

        {/* CTA sectie */}
        <div style={{ 
          background: ZLIM.tealLight, 
          borderRadius: '14px', 
          padding: '20px', 
          marginBottom: '24px',
          border: `2px solid ${ZLIM.teal}`
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: FONT.bold, margin: '0 0 8px', color: ZLIM.teal, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={20} /> Kies een praktijk en vraag een afspraak aan
          </h3>
          <p style={{ fontSize: FONT.small, color: ZLIM.textDark, lineHeight: 1.6, margin: 0 }}>
            De praktijk neemt binnen 2 werkdagen contact met je op om een afspraak in te plannen.
          </p>
        </div>

        {/* Praktijken lijst - gesorteerd op afstand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          {sortedFysios.map((fysio, index) => (
            <button 
              key={fysio.id} 
              onClick={() => setSelectedFysio(fysio)} 
              style={{ 
                background: ZLIM.white, 
                border: `2px solid ${index === 0 ? ZLIM.teal : ZLIM.border}`, 
                borderRadius: '16px', 
                padding: '20px', 
                cursor: 'pointer', 
                textAlign: 'left', 
                fontFamily: FONT.family, 
                width: '100%', 
                transition: 'all 0.15s ease',
                boxShadow: index === 0 ? '0 4px 12px rgba(74, 155, 140, 0.2)' : '0 2px 6px rgba(0,0,0,0.06)',
                position: 'relative',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                minHeight: '140px'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
                e.currentTarget.style.boxShadow = index === 0 ? '0 2px 6px rgba(74, 155, 140, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = index === 0 ? '0 4px 12px rgba(74, 155, 140, 0.2)' : '0 2px 6px rgba(0,0,0,0.06)';
              }}
            >
              {index === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '16px',
                  background: ZLIM.teal,
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: FONT.bold
                }}>
                  ⭐ Dichtstbij
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: FONT.bold, color: index === 0 ? ZLIM.teal : ZLIM.textDark, margin: 0, paddingRight: '10px' }}>{fysio.naam}</h4>
                <span style={{ 
                  background: index === 0 ? ZLIM.teal : ZLIM.bgGrey, 
                  color: index === 0 ? '#fff' : ZLIM.textMedium, 
                  padding: '6px 14px', 
                  borderRadius: '20px', 
                  fontSize: '13px', 
                  fontWeight: FONT.bold,
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                  {fysio.afstand !== null ? `${fysio.afstand} km` : '-- km'}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: ZLIM.textMedium, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} /> {fysio.adres}, {fysio.plaats}
              </p>
              <div style={{ 
                background: index === 0 ? ZLIM.teal : ZLIM.sage, 
                color: '#fff', 
                padding: '14px 20px', 
                borderRadius: '10px', 
                fontSize: '16px', 
                fontWeight: FONT.bold,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <Phone size={20} /> Afspraak aanvragen →
              </div>
            </button>
          ))}
        </div>

        {/* Optie om later te doen */}
        <p style={{ fontSize: '13px', color: ZLIM.textLight, textAlign: 'center', margin: 0 }}>
          Je kunt ook eerst de rest van het rapport bekijken en later terugkomen naar deze pagina.
        </p>
      </div>
    </Card>
  );}; 

  const renderReportPreventionPage = (index) => {
    const q = preventionQuestions[index];
    const Icon = q.Icon;
    const isPositive = preventionAnswers[q.id] === true;

    return (
      <Card>
        {/* Header met icoon rechtsboven */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          {/* Icoon rechtsboven */}
          <div style={{ 
            position: 'absolute', 
            top: '0', 
            right: '0',
            width: '56px', 
            height: '56px', 
            background: ZLIM.sagePale, 
            borderRadius: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Icon size={28} color={ZLIM.sage} />
          </div>
          
          {/* Categorie label */}
          <p style={{ 
            fontSize: FONT.small, 
            fontWeight: FONT.bold, 
            color: ZLIM.sage, 
            margin: '0 0 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {q.title}
          </p>
          
          {/* Titel */}
          <h2 style={{ fontSize: FONT.h2, fontWeight: FONT.extrabold, margin: 0, color: ZLIM.textDark, paddingRight: '70px' }}>
            {q.question.split('?')[0]}?
          </h2>
        </div>

        {/* Antwoord blok - alleen het antwoord, ruimer */}
        <div style={{ 
          background: isPositive ? ZLIM.successLight : ZLIM.dangerLight, 
          borderRadius: '12px', 
          padding: '18px 24px', 
          marginBottom: '28px',
          borderLeft: `4px solid ${isPositive ? ZLIM.success : ZLIM.danger}`
        }}>
          <p style={{ fontSize: '17px', fontWeight: FONT.bold, margin: 0, color: isPositive ? ZLIM.successDark : ZLIM.dangerDark }}>
            {isPositive ? 'Ja, dat doe ik' : 'Nee, dat doe ik niet'}
          </p>
        </div>

        {/* Advies */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: FONT.bold, margin: '0 0 12px', color: ZLIM.textDark }}>Advies</h3>
          <p style={{ fontSize: '15px', color: ZLIM.textDark, lineHeight: 1.8, margin: 0 }}>{q.advies}</p>
        </div>

        {/* Checklist */}
        <div style={{ background: ZLIM.bgLight, borderRadius: '14px', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: FONT.bold, margin: '0 0 16px', color: ZLIM.textDark }}>Checklist</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {q.checklist.map((item, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <div style={{ 
                  width: '22px', 
                  height: '22px', 
                  borderRadius: '6px', 
                  border: `2px solid ${ZLIM.border}`, 
                  background: ZLIM.white, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0, 
                  marginTop: '2px' 
                }}>
                  <Check size={14} color={ZLIM.textLight} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: FONT.small, color: ZLIM.textDark, lineHeight: 1.6 }}>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  const renderReportSummary = () => (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ 
          width: '72px', 
          height: '72px', 
          background: ZLIM.sagePale, 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 20px' 
        }}>
          <CheckCircle2 size={36} color={ZLIM.sage} />
        </div>
        <h2 style={{ fontSize: FONT.h2, fontWeight: FONT.extrabold, margin: '0 0 8px', color: ZLIM.textDark }}>
          Bedankt voor het invullen
        </h2>
        <p style={{ fontSize: '16px', color: ZLIM.textMedium, margin: 0 }}>
          Je hebt nu een goed beeld van je valrisico
        </p>
      </div>

      <p style={{ fontSize: '16px', color: ZLIM.textDark, lineHeight: 1.8, margin: '0 0 28px', textAlign: 'center' }}>
        Met de tips uit dit rapport kun je zelf aan de slag. Kleine aanpassingen kunnen al een groot verschil maken. En vergeet niet: hulp vragen is geen zwakte, maar juist slim.
      </p>

      {/* Gemeente informatie */}
      <div style={{ 
        background: ZLIM.sageVeryPale, 
        borderRadius: '14px', 
        padding: '24px', 
        marginBottom: '20px',
        border: `1px solid ${ZLIM.sagePale}`
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: FONT.bold, margin: '0 0 12px', color: ZLIM.sage }}>
          Meer weten?
        </h3>
        <p style={{ fontSize: '15px', color: ZLIM.textDark, lineHeight: 1.7, margin: '0 0 16px' }}>
          De gemeente Oude IJsselstreek zet zich in voor het welzijn van haar inwoners. Heb je vragen over valpreventie, hulpmiddelen of ondersteuning thuis? Neem gerust contact op.
        </p>
        <div style={{ 
          background: ZLIM.white, 
          borderRadius: '10px', 
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <p style={{ fontSize: FONT.small, color: ZLIM.textDark, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={16} color={ZLIM.sage} /> <strong>0315 - 292 292</strong>
          </p>
          <p style={{ fontSize: FONT.small, color: ZLIM.textMedium, margin: 0 }}>
            gemeente@oude-ijsselstreek.nl
          </p>
        </div>
      </div>

      {/* Zlimthuis verwijzing */}
    </Card>
  );

  const renderFysioModal = () => {
    if (!selectedFysio) return null;
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: 'rgba(45, 58, 36, 0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000, 
        padding: '16px', 
        overflowY: 'auto' 
      }}>
        <div style={{ background: ZLIM.white, borderRadius: '20px', maxWidth: '480px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
          {!formSubmitted ? (
            <>
              <div style={{ 
                padding: '20px', 
                borderBottom: `1px solid ${ZLIM.border}`, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                position: 'sticky', 
                top: 0, 
                background: ZLIM.white, 
                borderRadius: '20px 20px 0 0', 
                zIndex: 10 
              }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: FONT.extrabold, color: ZLIM.sage, margin: '0 0 4px' }}>{selectedFysio.naam}</h2>
                  <p style={{ fontSize: '13px', color: ZLIM.textMedium, margin: 0 }}>{selectedFysio.plaats}{selectedFysio.afstand !== null ? ` • ${selectedFysio.afstand} km` : ''}</p>
                </div>
                <button 
                  onClick={() => { setSelectedFysio(null); setFormSubmitted(false); setTelefoonError(''); setContactForm({ naam: '', telefoon: '', voorkeur: '', opmerking: '' }); }} 
                  style={{ background: ZLIM.bgLight, border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={20} color={ZLIM.textMedium} />
                </button>
              </div>
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: FONT.small, color: ZLIM.textDark, lineHeight: 1.7, margin: '0 0 16px' }}>{selectedFysio.omschrijving}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {selectedFysio.specialisaties.map((s, i) => (
                    <span key={i} style={{ background: ZLIM.sagePale, color: ZLIM.sageDark, padding: '4px 12px', borderRadius: '6px', fontSize: FONT.tiny, fontWeight: FONT.semibold }}>
                      {s}
                    </span>
                  ))}
                </div>
                <div style={{ background: ZLIM.bgLight, borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: FONT.small, fontWeight: FONT.bold, margin: '0 0 6px', color: ZLIM.textDark }}>Afspraak aanvragen</h4>
                  <p style={{ fontSize: '13px', color: ZLIM.textMedium, margin: 0 }}>De praktijk neemt binnen 2 werkdagen contact met je op.</p>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: FONT.small, fontWeight: FONT.semibold, marginBottom: '6px', color: ZLIM.textDark }}>Je naam *</label>
                  <input 
                    value={contactForm.naam} 
                    onChange={e => setContactForm({ ...contactForm, naam: e.target.value })} 
                    placeholder="Vul je naam in" 
                    style={{ width: '100%', padding: '12px 14px', fontSize: '15px', border: `2px solid ${ZLIM.border}`, borderRadius: '8px', fontFamily: FONT.family, boxSizing: 'border-box' }} 
                  />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: FONT.small, fontWeight: FONT.semibold, marginBottom: '6px', color: ZLIM.textDark }}>Je telefoonnummer *</label>
                  <input 
                    value={contactForm.telefoon} 
                    onChange={e => {
                      // Alleen cijfers toestaan
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setContactForm({ ...contactForm, telefoon: value });
                      if (telefoonError) setTelefoonError('');
                    }} 
                    placeholder="0612345678"
                    maxLength={10}
                    style={{ 
                      width: '100%', 
                      padding: '12px 14px', 
                      fontSize: '15px', 
                      border: `2px solid ${telefoonError ? ZLIM.danger : ZLIM.border}`, 
                      borderRadius: '8px', 
                      fontFamily: FONT.family, 
                      boxSizing: 'border-box' 
                    }} 
                  />
                  {telefoonError && (
                    <p style={{ color: ZLIM.danger, fontSize: '12px', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={14} /> {telefoonError}
                    </p>
                  )}
                  <p style={{ fontSize: '11px', color: ZLIM.textLight, margin: '4px 0 0' }}>
                    {contactForm.telefoon.length}/10 cijfers
                  </p>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: FONT.small, fontWeight: FONT.semibold, marginBottom: '6px', color: ZLIM.textDark }}>
                    Opmerking <span style={{ fontWeight: FONT.regular, color: ZLIM.textMedium }}>(optioneel)</span>
                  </label>
                  <textarea 
                    value={contactForm.opmerking} 
                    onChange={e => setContactForm({ ...contactForm, opmerking: e.target.value })} 
                    placeholder="Is er iets dat de praktijk moet weten?" 
                    rows={2} 
                    style={{ width: '100%', padding: '12px 14px', fontSize: '15px', border: `2px solid ${ZLIM.border}`, borderRadius: '8px', fontFamily: FONT.family, boxSizing: 'border-box', resize: 'vertical' }} 
                  />
                </div>
                <PrimaryButton 
                  onClick={async () => {
                    // Valideer telefoonnummer
                    if (contactForm.telefoon.length !== 10) {
                      setTelefoonError('Vul een geldig 10-cijferig telefoonnummer in');
                      return;
                    }
                    if (!contactForm.naam.trim()) {
                      return;
                    }
                    // Update database met fysio contact
                    await updateFysioContact(selectedFysio.naam, contactForm.naam, contactForm.telefoon);
                    setFormSubmitted(true);
                  }} 
                  disabled={!contactForm.naam.trim()}
                >
                  <Send size={18} /> Verstuur aanvraag
                </PrimaryButton>
              </div>
            </>
          ) : (
            <div style={{ padding: '40px 28px', textAlign: 'center' }}>
              <div style={{ 
                width: '72px', 
                height: '72px', 
                background: ZLIM.successLight, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px' 
              }}>
                <CheckCircle2 size={40} color={ZLIM.success} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: FONT.extrabold, color: ZLIM.success, margin: '0 0 10px' }}>Aanvraag verstuurd!</h2>
              <p style={{ fontSize: '15px', color: ZLIM.textMedium, margin: '0 0 24px' }}>{selectedFysio.naam} neemt binnen 2 werkdagen contact met je op.</p>
              <PrimaryButton 
                variant="outline" 
                onClick={() => { setSelectedFysio(null); setFormSubmitted(false); setTelefoonError(''); setContactForm({ naam: '', telefoon: '', voorkeur: '', opmerking: '' }); }}
              >
                Sluiten
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReport = () => { 
    const totalPages = getTotalReportPages();
    let content;
    if (reportPage === 0) content = renderReportIntro();
    else if (reportPage === 1) content = renderReportRiskLevel();
    else if (riskLevel === 'hoog' && reportPage === 2) content = renderReportDoorverwijzing();
    else if (reportPage === totalPages - 1) content = renderReportSummary();
    else { const preventieStart = riskLevel === 'hoog' ? 3 : 2; content = renderReportPreventionPage(reportPage - preventieStart); }

    return ( 
      <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {content}
        
        {/* Navigatie knoppen */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '24px' }}>
          <button 
            onClick={() => navigateReport(-1)} 
            disabled={reportPage === 0} 
            style={{ 
              padding: '14px', 
              borderRadius: '10px', 
              border: `2px solid ${ZLIM.border}`, 
              background: ZLIM.white, 
              cursor: reportPage === 0 ? 'not-allowed' : 'pointer', 
              opacity: reportPage === 0 ? 0.4 : 1, 
              fontFamily: FONT.family, 
              fontSize: '15px', 
              fontWeight: FONT.semibold, 
              color: ZLIM.textMedium, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px' 
            }}
          >
            <ChevronLeft size={20} /> Vorige
          </button>
          <button 
            onClick={() => navigateReport(1)} 
            disabled={reportPage === totalPages - 1} 
            style={{ 
              padding: '14px', 
              borderRadius: '10px', 
              border: 'none', 
              background: reportPage === totalPages - 1 ? ZLIM.success : ZLIM.teal, 
              cursor: reportPage === totalPages - 1 ? 'default' : 'pointer', 
              fontFamily: FONT.family, 
              fontSize: '15px', 
              fontWeight: FONT.semibold, 
              color: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px' 
            }}
          >
            {reportPage === totalPages - 1 ? <><CheckCircle2 size={20} /> Klaar</> : <>Volgende <ChevronRight size={20} /></>}
          </button>
        </div>
        
        {/* Paginering onderaan */}
        <div style={{ textAlign: 'center', padding: '16px 0 0', fontSize: '13px', color: ZLIM.textLight }}>
          {reportPage + 1} / {totalPages}
        </div>
        
        {renderFysioModal()}
      </div> 
    ); 
  };

  // ============================================================================
  // HOOFDCOMPONENT
  // ============================================================================

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: ZLIM.offWhite, 
      fontFamily: FONT.family, 
      color: ZLIM.textDark 
    }}>
      {/* Header */}
      <header style={{ 
        background: ZLIM.white, 
        padding: isMobile ? '12px 16px' : '14px 28px', 
        boxShadow: '0 1px 3px rgba(138, 154, 109, 0.06)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100,
        borderBottom: `1px solid ${ZLIM.borderLight}`
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <ZlimthuisLogo />
          {currentScreen === 'report' && (
            <span style={{ 
              fontSize: '13px', 
              fontWeight: FONT.semibold, 
              color: ZLIM.textMedium, 
              background: ZLIM.bgLight, 
              padding: '5px 12px', 
              borderRadius: '15px' 
            }}>
              {reportPage + 1} / {getTotalReportPages()}
            </span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: isMobile ? '24px 16px 40px' : '36px 20px 60px' }}>
        {currentScreen === 'welcome' && renderWelcome()}
        {currentScreen === 'age' && renderAgeSelection()}
        {currentScreen === 'questions' && renderRiskQuestion()}
        {currentScreen === 'prevention' && renderPreventionQuestion()}
        {currentScreen === 'demographics' && renderDemographics()}
        {currentScreen === 'report' && renderReport()}
      </main>

      {/* Footer */}
      <footer style={{ 
        padding: '16px', 
        textAlign: 'center', 
        borderTop: `1px solid ${ZLIM.borderLight}`, 
        background: ZLIM.white 
      }}>
        <p style={{ fontSize: FONT.tiny, color: ZLIM.textLight, margin: 0 }}>
          © 2024 Ik Sta Sterk Test • VeiligheidNL • Zlimthuis
        </p>
      </footer>
    </div>
  );
};

export default IkStaSterkTest;
