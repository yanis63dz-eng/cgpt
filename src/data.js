export const bundles = [
  { id: 'kit-1', count: 1, price: 349, oldPrice: 599 },
  { id: 'kit-2', count: 2, price: 499, oldPrice: 1198, popular: true },
  { id: 'kit-3', count: 3, price: 699, oldPrice: 1797 },
];

export const gallery = [
  { type: 'hero', src: 'hero.png', alt: 'Manveo vävkit med vävverktyg, träskiva, fjäder och nålar på en mörk yta' },
  { type: 'repair', src: 'before-after.png', alt: 'En salviagrön tröja före och efter en diskret lagning' },
  { type: 'craft', src: 'craft.png', cell: 0, alt: 'Händer väver med terrakottafärgad tråd på salviagrön denim' },
  { type: 'steps', src: 'steps.png', alt: 'Fyra steg för att laga ett plagg med Manveo' },
  { type: 'flower', src: 'craft.png', cell: 2, alt: 'En liten blomkruka i terrakotta med ljusa blommor broderad på denim' },
  { type: 'kit', src: 'kit.png', alt: 'Det kompletta Manveo-kitet med en svensk instruktionsbok' },
];

// The PDF exposes the first use-case slide and part of the second.
// Additional slide copy is an adaptation, pending verification against the live source.
export const uses = [
  { title: 'Laga hål', text: 'Ge ett skadat favoritplagg chansen att användas igen.', src: 'craft.png', cell: 0, alt: 'Vävverktyget lagar ett hål i grön denim' },
  { title: 'Täck slitage', text: 'Förvandla slitna partier till en fin detalj i plaggets egen färg.', src: 'craft.png', cell: 1, alt: 'En diskret lagning i en krämvit stickad tröja' },
  { title: 'Skapa egna mönster', text: 'Låt dina favoritfärger bli något helt personligt.', src: 'craft.png', cell: 2, alt: 'Blommor i rosa och gräddvitt på blå denim' },
  { title: 'Förnya dina favoriter', text: 'En liten lagning. En ny början för plagget du tycker om.', src: 'impact.png', cell: 3, alt: 'Ett par jeans med en vävd terrakottafärgad lagning' },
];

export const steps = [
  { title: 'Fäst över hålet', text: 'Placera träskivan bakom plagget och fäst Manveo över området du vill laga.', alt: 'Vävverktyget fästs över hålet i en mörk tröja' },
  { title: 'Spänn upp trådarna', text: 'Rikta krokarna mot dig. Fäst garnet i plagget och för trådarna upp runt krokarna.', alt: 'Terrakottafärgade och ljusa trådar spänns runt krokarna' },
  { title: 'Väv fram och tillbaka', text: 'Vrid krokarna åt sidan och väv genom trådarna. Växla krokarnas riktning för varje rad.', alt: 'En nål väver genom de uppspända trådarna' },
  { title: 'Klart!', text: 'Ta bort Manveo och fäst öglorna längs överkanten i plagget. För sedan trådändarna till baksidan och fäst dem.', alt: 'En färdig rutig lagning i terrakotta och gräddvitt' },
];

export const impact = [
  { src: 'impact.png', cell: 0, alt: 'Textilavfall på en återvinningsplats', text: 'Varje år slänger vi svenskar omkring 80 000 ton kläder och textilier.' },
  { src: 'impact.png', cell: 1, alt: 'Kläder på galgar i en tom butik', text: 'Det mest värdefulla plagget kan vara det du redan har.' },
  { src: 'impact.png', cell: 2, alt: 'Vikta, lagade favoritplagg på en trästol', text: 'Ta hand om dina favoriter. Låt dem följa med lite längre.' },
  { src: 'impact.png', cell: 3, alt: 'Vävverktyg och lagad denim på linne', text: 'En tråd i taget. Ett litet val för en mer hållbar framtid.' },
];

// Questions are transcribed from the PDF; answers are written for this implementation.
export const faqs = [
  ['Är Manveo svårt att använda?', 'Nej, du behöver ingen tidigare erfarenhet av vävning. Manveo håller trådarna på plats medan du arbetar, och de enkla steg-för-steg-instruktionerna hjälper dig från första tråden till färdig lagning.'],
  ['Vilka plagg kan jag använda Manveo på?', 'Du kan laga och dekorera till exempel tröjor, jeans, strumpor och filtar. Anpassa nål och garn efter tyget och prova gärna först på en liten, mindre synlig yta.'],
  ['Kan jag använda Manveo även om plagget inte har ett hål?', 'Ja! Använd vävverktyget för att skapa personliga detaljer, färgglada mönster eller små dekorationer på ett helt plagg. Du väljer själv färgerna och uttrycket.'],
  ['Hur stor lagning kan jag göra?', 'Verktygets 14 krokar hjälper dig att väva små lagningar och detaljer. Den färdiga storleken beror på garnet och hur tätt du väver. Större områden kan bearbetas i flera omgångar.'],
  ['Ingår instruktioner och mönster?', 'Ja, steg-för-steg-instruktioner och en digital mönsterbok ingår i varje kit. Garn väljer du själv, eller så lägger du till Manveo Färgtrådar med 24 färger.'],
  ['Vad händer om Manveo inte känns rätt för mig?', 'Du har 30 dagars öppet köp. Läs återbetalningspolicyn och kontakta kundservice för hjälp med en retur.'],
];

export const included = ['Manveo vävverktyg med 14 krokar', 'Träskiva i bokträ', 'Metallfjäder', 'Väv- och nålverktyg', 'Digital mönsterbok', 'Steg-för-steg-instruktioner'];

export const money = value => `${new Intl.NumberFormat('sv-SE').format(value)} kr`;
