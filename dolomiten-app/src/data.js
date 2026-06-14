export const weatherByDay = {
  1: { temp: "20°", low: "10°", cond: "Heiter, trocken", icon: "☀️", rain: "5%", wind: "Wind bis 37 km/h", note: "Anreise bei Sonne" },
  2: { temp: "20°", low: "7°", cond: "Wechselhaft, meist trocken", icon: "🌤️", rain: "0%", wind: "windstill", note: "Gefühlt 24° — ideal zum Wandern" },
  3: { temp: "21°", low: "8°", cond: "Heiter", icon: "☀️", rain: "0%", wind: "windstill", note: "Top für Pässe & Fotostopps" },
  4: { temp: "21°", low: "7°", cond: "Heiter, sonnig", icon: "☀️", rain: "0%", wind: "leicht, Böen möglich", note: "Perfekt für Drei Zinnen!" },
  5: { temp: "22°", low: "8°", cond: "Sonnig", icon: "☀️", rain: "10%", wind: "leicht", note: "Ideal für Shooting & Sonnenuntergang" },
  6: { temp: "21°", low: "8°", cond: "Heiter", icon: "🌤️", rain: "15%", wind: "leicht", note: "Sonnenaufgang Seceda — klar!" },
};

export const sunTimes = { sunrise: "05:18", sunset: "21:08" };

export const outfitByDay = {
  1: { title: "Anreise — bequem", items: ["Bequeme Reisekleidung", "Leichte Jacke für Pausen", "Sneaker"], shoot: null },
  2: { title: "Wandertag Villnöss", items: ["Wanderhose + atmungsaktives Shirt", "Fleece für die Geislerspitzen", "Wanderschuhe", "Sonnenhut & Brille"], shoot: null },
  3: { title: "Fahrtag mit Pässen", items: ["Lockere Kleidung", "Leichte Jacke (Pässe sind kühler)", "Bequeme Schuhe für Fotostopps"], shoot: null },
  4: { title: "Drei Zinnen — Bergtag", items: ["Warme Schichten (morgens 7° auf 2.300m!)", "Winddichte Jacke", "Feste Wanderschuhe", "Mütze & Handschuhe morgens", "Sonnencreme LSF50"], shoot: null },
  5: { title: "Shooting-Tag — Abend", items: ["Tagsüber: bequeme Wanderkleidung", "Pragser Wildsee: leichte Schichten"], shoot: "Für Sonnenuntergang: fließende, helle Stoffe (Kleid/Hemd), die im Wind wehen. Erdtöne & Creme harmonieren mit den Almwiesen. Bewegungsfreundlich für Candid-Shots!" },
  6: { title: "Shooting-Tag — Sonnenaufgang", items: ["Warme Schicht drüber bis Sonne kommt (5° morgens!)", "Wanderschuhe für Aufstieg"], shoot: "Sonnenaufgang Seceda: warme Erdtöne, Rostrot oder Camel passen zum Morgenlicht. Schichten zum Ausziehen sobald die Sonne wärmt. Schal als Accessoire für Bewegung im Wind." },
};

export const packlist = {
  "🏕️ Camper & Übernachtung": [
    "Bettwäsche / Schlafsäcke", "Kissen", "Handtücher (auch fürs Schwimmen)",
    "Campingstühle & Tisch", "Stirnlampen / Taschenlampen", "Powerbank & Ladekabel",
    "Müllbeutel", "Spülmittel & Schwamm", "Frischwasserschlauch", "Münzgeld (Ver-/Entsorgung)",
    "Gaskartuschen-Check", "Feuerzeug / Streichhölzer",
  ],
  "🥾 Wandern & Outdoor": [
    "Feste Wanderschuhe (eingelaufen!)", "Wandersocken (mehrere Paar)", "Wanderstöcke",
    "Tagesrucksack", "Trinkflaschen / Trinksystem", "Regenjacke (winddicht)",
    "Fleece / Midlayer", "Mütze & dünne Handschuhe (Berge morgens kalt!)", "Sonnenhut / Cap",
  ],
  "🧥 Kleidung (Wetter: 20-24° tags, 4-8° nachts)": [
    "T-Shirts / atmungsaktive Shirts", "Lange Wanderhose + kurze Hose",
    "Warme Jacke für Abende & frühe Mornings", "Pullover / Hoodie",
    "Unterwäsche & Socken", "Schlafkleidung (warm!)", "Badesachen (Seen & Pool)",
    "Flip-Flops / Sandalen",
  ],
  "📷 Foto-Shooting": [
    "Outfits für Sonnenuntergang (helle, fließende Stoffe)", "Outfits für Sonnenaufgang (Erdtöne)",
    "Wechselschuhe für Fotos", "Haarbürste & Styling", "Make-up / Touch-up",
    "Accessoires (Schal, Hut für Bewegung)", "Ladegeräte für Kameras",
  ],
  "💊 Gesundheit & Hygiene": [
    "Sonnencreme LSF 50 (UV-Index 8!)", "Lippenpflege mit LSF", "Erste-Hilfe-Set",
    "Blasenpflaster", "Persönliche Medikamente", "Insektenspray", "Zahnbürste & Co.",
    "Feuchttücher", "Desinfektionsgel",
  ],
  "📄 Dokumente & Sonstiges": [
    "Ausweis / Reisepass", "Führerschein & Fahrzeugpapiere", "Österreich-Vignette (digital)",
    "Camping-Buchungsbestätigungen", "Drei Zinnen Ticket", "Pragser Wildsee Ticket",
    "Bargeld & Kreditkarte", "Krankenversicherungskarte (EHIC)", "Offline-Karten aufs Handy",
  ],
};
