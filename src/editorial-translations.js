import {periods, biography, biographySources, artworkNote, imageNote} from './editorial.js';

const periodTranslations = [
  [
    ['Among trees and paths', 'Tra alberi e sentieri'],
    ['The earliest surviving images take us to gardens, pine groves and paths. Trunks organise the scene and paths lead the eye towards a house, hills or a clearing. Alongside these sheltered spaces are open fields and reflections of architecture on water.', 'Le prime immagini conservate ci portano tra giardini, pinete e sentieri. I tronchi organizzano la scena e i percorsi guidano lo sguardo verso una casa, delle colline o una radura. Accanto a questi spazi raccolti compaiono campi aperti e riflessi di architetture sull’acqua.'],
    ['Trees and paths would remain subjects he returned to through the years.', 'L’albero e il sentiero saranno soggetti a cui tornerà nel corso degli anni.'],
  ],
  [
    ['The landscape opens up', 'Il paesaggio si apre'],
    ['Fields, slopes and mountains become more prominent. Furrows, fences and hay bales give rural landscapes depth. Greens sit alongside earthy tones and golds; the seasons change the appearance of familiar subjects. A group of portraits from 2017 also brings the intimacy of a face.', 'Campi, pendii e montagne acquistano maggiore presenza. Solchi, recinzioni e balle di fieno segnano la profondità dei paesaggi rurali. I verdi convivono con toni terrosi e dorati; le stagioni cambiano l’aspetto degli stessi soggetti. Un gruppo di ritratti del 2017 introduce anche la vicinanza del volto.'],
    ['Broad views coexist with close attention to a figure or a corner of the garden.', 'Le vedute ampie convivono con l’attenzione a una figura o a un angolo del giardino.'],
  ],
  [
    ['Figures and connection', 'La figura e l’incontro'],
    ['Madonnas with the Child and scenes of motherhood take a central place in this part of the archive. The gaze draws closer to gestures, hands and the relationship between figures. In the East Asian inspired mothers and children, dresses, flowers and backgrounds feature especially rich ornamentation.', 'Le Madonne con il Bambino e le maternità occupano un posto centrale in questa parte dell’archivio. Lo sguardo si avvicina ai gesti, alle mani e alla relazione tra le figure. Nelle maternità di ispirazione orientale, gli abiti, i fiori e gli sfondi incorporano una decorazione particolarmente ricca.'],
    ['Landscape makes room for intimate compositions with new combinations of colour and drawing.', 'Il paesaggio lascia spazio a composizioni intime, con nuove combinazioni di colore e disegno.'],
  ],
  [
    ['New subjects, new colours', 'Nuovi soggetti, nuovi colori'],
    ['The repertoire expands: flowers, objects, gardens, fields and mountains share the year with East Asian inspired landscapes. Pavilions, flowering branches and expanses of water suggest other ways of arranging a scene. Towards the end of this period, snow and lakes appear, subjects that continue in later years.', 'Il repertorio si amplia: fiori, oggetti, giardini, campi e montagne condividono l’anno con paesaggi di ispirazione orientale. Padiglioni, rami fioriti e superfici d’acqua propongono altri modi di organizzare la scena. Verso la fine di questa tappa compaiono la neve e i laghi che avranno continuità negli anni successivi.'],
    ['The variety of subjects reveals the same sensibility in very different compositions.', 'La varietà dei soggetti permette di osservare una stessa sensibilità in composizioni molto diverse.'],
  ],
  [
    ['Winter light', 'La luce dell’inverno'],
    ['Snow becomes a prominent subject. Among bare trees, fences and slopes, whites are accompanied by blues and soft shadows. The contrast with yellow skies and autumn trees shows how much colour can transform a familiar landscape.', 'La neve acquista una presenza rilevante. Tra alberi spogli, recinzioni e pendii, i bianchi si accompagnano agli azzurri e a ombre delicate. Il contrasto con i cieli gialli e gli alberi autunnali mostra quanto il colore possa trasformare un paesaggio familiare.'],
    ['In some scenes the subjects become simpler and the space between them takes on greater importance.', 'In alcune scene i soggetti si semplificano e lo spazio tra loro acquista maggiore rilievo.'],
  ],
  [
    ['Water and inhabited places', 'L’acqua e i luoghi abitati'],
    ['Mountain lakes, boats and villages alternate with courtyards, fountains and buildings. Architecture introduces rhythms of arches, walls and perspectives, while water mirrors their forms. Later, mown fields and hay bales reappear.', 'Laghi di montagna, barche e paesi si alternano a cortili, fontane ed edifici. L’architettura introduce ritmi di archi, muri e prospettive, mentre l’acqua restituisce le forme nei riflessi. Più avanti riappaiono i campi falciati e le balle di fieno.'],
    ['The themes intertwine: landscape, architecture and water speak to one another within a single image.', 'I temi si intrecciano: paesaggio, architettura e acqua dialogano nella stessa immagine.'],
  ],
  [
    ['Horizons of water and light', 'Orizzonti d’acqua e di luce'],
    ['In the final year gathered in the archive, snow coexists with lakes, canals and meadows. Summer photographs bring beaches, palm trees and parasols. The blues and turquoises of water meet pink mountains, open greens and the warmth of sand.', 'Nell’ultimo anno riunito nell’archivio, la neve convive con laghi, canali e prati. Le fotografie estive introducono spiagge, palme e ombrelloni. Gli azzurri e i turchesi dell’acqua incontrano montagne rosate, verdi aperti e il calore della sabbia.'],
    ['The journey ends with this breadth of subjects and an invitation to keep looking at his artworks.', 'Il percorso termina con questa ampiezza di soggetti e con l’invito a continuare a guardare le sue opere.'],
  ],
];

const biographyTranslations = [
  ['Javier Cotelo Villarreal was born in Madrid on 16 August 1932 and died in Rome on 10 October 2026. An architect, photographer, draughtsman and painter, he found in landscapes and people subjects worthy of his attention.', 'Javier Cotelo Villarreal è nato a Madrid il 16 agosto 1932 ed è morto a Roma il 10 ottobre 2026. Architetto, fotografo, disegnatore e pittore, trovava nel paesaggio e nelle persone soggetti a cui dedicare il proprio sguardo.'],
  ['He studied architecture in Madrid and joined Opus Dei in 1952. In 1962 he settled in Rome, where he worked on the Villa Tevere and Cavabianca projects. He accompanied Saint Josemaría on his journeys across Europe for more than two decades.', 'Ha studiato architettura a Madrid ed è entrato nell’Opus Dei nel 1952. Nel 1962 si è stabilito a Roma, dove ha lavorato ai progetti di Villa Tevere e Cavabianca. Ha accompagnato san Josemaría nei suoi spostamenti e viaggi in Europa per oltre due decenni.'],
  ['During those journeys he photographed architectural details and solutions that later served as references for his work. In 2021 he published Al volante de un santo, a book of everyday memories with Saint Josemaría, accompanied by drawings and photographs.', 'Durante quei viaggi fotografava dettagli e soluzioni architettoniche che in seguito servivano da riferimento per il suo lavoro. Nel 2021 ha pubblicato Al volante de un santo, un libro di ricordi quotidiani accanto a san Josemaría, accompagnato da disegni e fotografie.'],
  ['He also designed the installation of the Mater Ecclesiae mosaic in Saint Peter’s Square, inaugurated in 1981. The mosaic was created by Virgilio Cassio and his collaborators.', 'Ha inoltre realizzato il progetto per l’installazione del mosaico Mater Ecclesiae in piazza San Pietro, inaugurato nel 1981. L’esecuzione del mosaico è stata affidata a Virgilio Cassio e ai suoi collaboratori.'],
  ['Painting and drawing were part of his daily life. He painted landscapes for many homes and drew caricatures of those who lived with him, especially at Christmas and on some birthdays. His watercolours allow us to discover this part of his life today, through the places, colours and faces he chose to depict.', 'La pittura e il disegno facevano parte della sua vita quotidiana. Dipingeva paesaggi per molte case e disegnava caricature di chi viveva con lui, soprattutto a Natale e in occasione di alcuni compleanni. I suoi acquerelli ci permettono oggi di avvicinarci a questo aspetto della sua vita attraverso i luoghi, i colori e i volti che ha scelto di rappresentare.'],
];

const sourceTranslations = [
  ['A portrait of Javier Cotelo (1932–2026) · Opus Dei', 'Profilo di Javier Cotelo (1932–2026) · Opus Dei'],
  ['Al volante de un santo · His memories, drawings and photographs', 'Al volante de un santo · I suoi ricordi, disegni e fotografie'],
  ['Listen to Javier · 2025 interview (video in Italian)', 'Ascolta Javier · Intervista del 2025 (video in italiano)'],
  ['Mater Ecclesiae mosaic · Vatican', 'Mosaico Mater Ecclesiae · Vaticano'],
];

const notes = {
  AC0006: ['The same composition appears in photographs from 2013 and 2014.', 'La stessa composizione compare in fotografie del 2013 e del 2014.'],
  AC0065: ['Several photographs of this artwork survive, with differences in lighting and colour.', 'Si conservano diverse fotografie di quest’opera, con differenze di illuminazione e colore.'],
  AC0094: ['The sitter’s identity is not documented. This is a different painting from the profile portrait preserved in the collection.', 'L’identità della persona ritratta non è documentata. È un dipinto diverso dal ritratto di profilo conservato nella collezione.'],
  AC0433: ['Reflections in the glass make some areas of the painting difficult to see.', 'I riflessi del vetro rendono difficile osservare alcune parti del dipinto.'],
  AC0491: ['The earliest photograph may show an intermediate stage of the painting.', 'La prima fotografia potrebbe mostrare una fase intermedia del dipinto.'],
  AC0532: ['The photographs show the same composition with differences in colour. The image that best reveals the painting is presented.', 'Le fotografie mostrano la stessa composizione con differenze di colore. Viene presentata l’immagine che permette di apprezzare meglio il dipinto.'],
  AC0651: ['This painting may be another version of the subject photographed on 6 April 2022.', 'Questo dipinto potrebbe essere un’altra versione del soggetto fotografato il 6 aprile 2022.'],
  AC0664: ['The same composition survives in photographs taken on different dates.', 'La stessa composizione è conservata in fotografie di date diverse.'],
  AC0668: ['The inscription on this artwork has not been transcribed.', 'L’iscrizione di quest’opera non è stata trascritta.'],
  AC0685: ['The identity of the figure is not documented.', 'L’identità della figura non è documentata.'],
  AC0769: ['The earliest photograph may show an earlier stage of the painting.', 'La prima fotografia potrebbe mostrare una fase precedente del dipinto.'],
  AC0878: ['The place names are written on the sheet, which brings together two scenes.', 'I nomi dei luoghi sono scritti sul foglio, che riunisce due scene.'],
  AC0898: ['The sheet contains two scenes and is presented in full.', 'Il foglio contiene due scene e viene presentato per intero.'],
  AC0935: ['This is a different composition from the painting with two mountain huts photographed in July 2023.', 'È una composizione diversa dal dipinto con due rifugi fotografato nel luglio 2023.'],
  AC0938: ['The photograph shows the framed artwork. The place depicted is not documented.', 'La fotografia mostra l’opera incorniciata. Il luogo rappresentato non è documentato.'],
  AC1020: ['The artwork also appears in a photograph from May 2024. The catalogue year follows its earliest surviving image.', 'L’opera compare anche in una fotografia del maggio 2024. L’anno di catalogo segue la sua prima immagine conservata.'],
  AC1035: ['Photographs from two consecutive days may record changes made while working on the painting.', 'Le fotografie di due giorni consecutivi potrebbero documentare modifiche durante il lavoro sul dipinto.'],
  AC1079: ['The painting shows visible changes from another composition photographed two days earlier.', 'Il dipinto presenta cambiamenti visibili rispetto a un’altra composizione fotografata due giorni prima.'],
  AC1081: ['The surviving image suggests a study made from a reference on a screen.', 'L’immagine conservata suggerisce uno studio realizzato a partire da un riferimento su uno schermo.'],
  AC1212: ['The framed artwork brings together two scenes that are presented together.', 'L’opera incorniciata riunisce due scene che vengono presentate insieme.'],
  AC1359: ['This composition resembles a landscape photographed in 2023. Their relationship is preserved in the archive documentation.', 'Questa composizione presenta somiglianze con un paesaggio fotografato nel 2023. La loro relazione è conservata nella documentazione dell’archivio.'],
  AC1396: ['The image resembles the pink lake photographed in 2023. Their relationship is preserved in the archive documentation.', 'L’immagine presenta somiglianze con il lago rosato fotografato nel 2023. La loro relazione è conservata nella documentazione dell’archivio.'],
  AC1403: ['The archive also holds a detail photograph of this painting.', 'L’archivio conserva anche una fotografia di dettaglio di questo dipinto.'],
  AC1442: ['Photographs from two consecutive days may show different stages of the same painting.', 'Le fotografie di due giorni consecutivi potrebbero mostrare fasi diverse dello stesso dipinto.'],
  AC1468: ['The light watercolour reveals the line drawing supporting the composition.', 'L’acquerello leggero lascia intravedere il disegno lineare che sostiene la composizione.'],
  AC1470: ['Two groups of photographs of this artwork survive, taken on the same day.', 'Si conservano due gruppi di fotografie di quest’opera, scattate nello stesso giorno.'],
};

export const editorialMessages = {};
periods.forEach((period, index) => ['title', 'text', 'detail'].forEach((field, position) => {
  editorialMessages[period[field]] = periodTranslations[index][position];
}));
biography.forEach((paragraph, index) => { editorialMessages[paragraph] = biographyTranslations[index]; });
biographySources.forEach((source, index) => { editorialMessages[source.label] = sourceTranslations[index]; });
Object.entries(notes).forEach(([id, values]) => { editorialMessages[artworkNote({id})] = values; });
editorialMessages[imageNote({id: 'AC0433', limitation: true})] = ['The image preserves the reflections in the glass and the perspective of the original photograph.', 'L’immagine conserva i riflessi del vetro e la prospettiva della fotografia originale.'];
editorialMessages[imageNote({id: '', limitation: true})] = ['The full framing of the photograph is preserved.', 'Viene conservata l’inquadratura completa della fotografia.'];
